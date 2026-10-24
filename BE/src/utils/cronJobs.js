/**
 * cronJobs.js — Layer 7: Auto-trigger Batch Jobs
 * Chuẩn Netflix/Amazon: không chạy tay, tự động theo lịch
 *
 * Jobs:
 * 1. Python ALS batch        — mỗi 4 giờ
 * 2. Item-CF matrix compute  — mỗi 6 giờ
 * 3. Interaction threshold   — trigger khi đủ 100 interactions mới
 */

const path = require('path');
const { execFile } = require('child_process');

// ── Structured cron logger ────────────────────────────────────────────────────────────
const cronLog = {
  info: (job, msg) => console.log(`[CronJobs][${new Date().toISOString()}] ✔ ${job}: ${msg}`),
  error: (job, err) => console.error(`[CronJobs][${new Date().toISOString()}] ❌ ${job} FAILED: ${err?.message || err}`),
  warn: (job, msg) => console.warn(`[CronJobs][${new Date().toISOString()}] ⚠ ${job}: ${msg}`),
};

let _nodeCron = null;
const getNodeCron = () => {
  if (!_nodeCron) {
    try {
      _nodeCron = require('node-cron');
    } catch {
      console.warn('[CronJobs] node-cron not installed. Run: npm install node-cron');
    }
  }
  return _nodeCron;
};

// ── ALS batch: khoá chạy + cooldown ──────────────────────────────────────────────────────────
let _alsRunning = false;
let _alsLastStartedAt = 0;
const ALS_MIN_INTERVAL_MS = 10 * 60 * 1000; // tối thiểu 10 phút giữa 2 lần chạy
const ALS_STALE_MS = 12 * 60 * 60 * 1000; // kết quả cũ hơn 12h thì chạy lại lúc boot

const canStartAls = () => !_alsRunning && Date.now() - _alsLastStartedAt >= ALS_MIN_INTERVAL_MS;

// ── Interaction counter trigger ──────────────────────────────────────────────
let _newInteractionCount = 0;
const INTERACTION_TRIGGER = 100; // trigger Python ALS khi đủ N interactions mới

const incrementInteractionCounter = (n = 1) => {
  _newInteractionCount += n;
  if (_newInteractionCount < INTERACTION_TRIGGER) return;
  // Đang chạy / còn trong cooldown: giữ nguyên bộ đếm, lần event sau sẽ thử lại
  if (!canStartAls()) return;
  _newInteractionCount = 0;
  runAlsBatch().catch(() => { }); // fire-and-forget
};

// ── Python ALS Batch ───────────────────────────────────────────────────────────────────────────
/**
 * Chạy matrix_factorization.py. Không chạy chồng và có cooldown.
 * @returns {Promise<{started:boolean, reason?:string}>}
 */
const runAlsBatch = () => {
  if (_alsRunning) {
    cronLog.warn('PythonALS', 'Bỏ qua: batch trước vẫn đang chạy.');
    return Promise.resolve({ started: false, reason: 'running' });
  }
  if (Date.now() - _alsLastStartedAt < ALS_MIN_INTERVAL_MS) {
    cronLog.warn('PythonALS', 'Bỏ qua: còn trong thời gian cooldown.');
    return Promise.resolve({ started: false, reason: 'cooldown' });
  }

  _alsRunning = true;
  _alsLastStartedAt = Date.now();

  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, '../../python-services/matrix_factorization.py');
    const pythonScriptDir = path.dirname(scriptPath);
    const pythonExecutable = process.env.PYTHON_PATH || (process.platform === 'win32' ? 'python' : 'python3');

    cronLog.info('PythonALS', 'Starting batch...');

    execFile(
      pythonExecutable,
      [scriptPath],
      {
        cwd: pythonScriptDir,
        timeout: 5 * 60 * 1000,
        maxBuffer: 10 * 1024 * 1024,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      },
      (err, stdout, stderr) => {
        _alsRunning = false;
        if (err) {
          cronLog.error('PythonALS', err);
          if (stderr) cronLog.warn('PythonALS', `stderr: ${stderr.slice(0, 300)}`);
        } else {
          cronLog.info('PythonALS', 'Completed successfully.');
          if (stdout) console.log('[CronJobs][PythonALS] stdout:', stdout.slice(0, 500));
        }
        resolve({ started: true });
      }
    );
  });
};

/**
 * Lúc boot: chạy ALS nếu chưa có kết quả hoặc kết quả đã cũ, tránh phải chờ tới mốc cron kế tiếp.
 */
const runAlsIfStale = async () => {
  try {
    const PersonalizedRecommendation = require('../models/personalizedRecommendation.model');
    const latest = await PersonalizedRecommendation.findOne()
      .sort({ lastCalculatedAt: -1 })
      .select('lastCalculatedAt')
      .lean();
    const age = latest?.lastCalculatedAt ? Date.now() - new Date(latest.lastCalculatedAt).getTime() : Infinity;
    if (age > ALS_STALE_MS) {
      cronLog.info('PythonALS', latest ? 'Kết quả gợi ý đã cũ, chạy lại lúc khởi động.' : 'Chưa có kết quả gợi ý, chạy lúc khởi động.');
      await runAlsBatch();
    }
  } catch (err) {
    cronLog.error('PythonALS', err);
  }
};

const runUpsellBatch = () => {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, '../../python-services/upsell_engine.py');
    const pythonScriptDir = path.dirname(scriptPath);
    const pythonExecutable = process.env.PYTHON_PATH || (process.platform === 'win32' ? 'python' : 'python3');

    cronLog.info('UpsellEngine', 'Starting batch...');

    execFile(
      pythonExecutable,
      [scriptPath],
      {
        cwd: pythonScriptDir,
        timeout: 3 * 60 * 1000,
        maxBuffer: 5 * 1024 * 1024,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      },
      (err, stdout, stderr) => {
        if (err) {
          cronLog.error('UpsellEngine', err);
          if (stderr) cronLog.warn('UpsellEngine', `stderr: ${stderr.slice(0, 300)}`);
        } else {
          cronLog.info('UpsellEngine', 'Completed successfully.');
          if (stdout) console.log('[CronJobs][UpsellEngine] stdout:', stdout.slice(0, 500));
        }
        resolve();
      }
    );
  });

};

// ── Item-CF Matrix Batch ─────────────────────────────────────────────────────────────────────────────
const runItemCFBatch = async () => {
  try {
    const { computeItemSimilarityMatrix } = require('../services/recommendation.service');
    cronLog.info('ItemCF', 'Starting matrix computation...');
    const count = await computeItemSimilarityMatrix();
    cronLog.info('ItemCF', `Done — ${count} products updated.`);
  } catch (err) {
    cronLog.error('ItemCF', err);
  }
};

// ── Reset SearchLog count7d every 7 days ───────────────────────────────────────────────────────────────
const resetSearchLog7d = async () => {
  try {
    const SearchLog = require('../models/searchLog.model');
    await SearchLog.updateMany({}, { $set: { count7d: 0 } });
    cronLog.info('SearchLogReset', 'count7d reset done.');
  } catch (err) {
    cronLog.error('SearchLogReset', err);
  }
};

// ── Auto-hide expired banners ─────────────────────────────────────────────────────────────────────────────
const autoHideExpiredBanners = async () => {
  try {
    const Banner = require('../models/banner.model');
    const now = new Date();
    const result = await Banner.updateMany(
      { isVisible: true, endAt: { $ne: null, $lt: now } },
      { $set: { isVisible: false } }
    );
    if (result.modifiedCount > 0) {
      cronLog.info('BannerAutoHide', `${result.modifiedCount} banner(s) hidden.`);
    }
  } catch (err) {
    cronLog.error('BannerAutoHide', err);
  }
};

const startCronJobs = () => {
  const cron = getNodeCron();
  if (!cron) return;

  // Python ALS: every 4 hours
  cron.schedule('0 */4 * * *', () => {
    runAlsBatch().catch(() => {});
  });

  // Item-CF: every 6 hours
  cron.schedule('0 */6 * * *', () => {
    runItemCFBatch().catch(() => {});
  });

  // Reset SearchLog count7d: every Sunday midnight
  cron.schedule('0 0 * * 0', () => {
    resetSearchLog7d().catch(() => {});
  });

  // Banner expiry: every 30 minutes
  cron.schedule('*/30 * * * *', () => {
    autoHideExpiredBanners().catch(() => {});
  });

  // Upsell Engine: every 8 hours
  cron.schedule('0 */8 * * *', () => {
    runUpsellBatch().catch(() => {});
  });

  // Flash Sale Realtime Menu Sync: every 1 minute
  cron.schedule('*/1 * * * *', () => {
    try {
      const { syncFlashSalesToMenu } = require('../services/flashSale.service');
      syncFlashSalesToMenu().catch(() => {});
    } catch (e) {}
  });

  console.log('[CronJobs] 6 background jobs scheduled (ALS, Item-CF, SearchLog, Banner, Upsell, FlashSale)');

  // Run in background 10 seconds after startup to avoid blocking server boot
  setTimeout(() => {
    try {
      const { syncFlashSalesToMenu } = require('../services/flashSale.service');
      syncFlashSalesToMenu().catch(() => {});
    } catch (e) {}
    runItemCFBatch().catch(() => { });
    autoHideExpiredBanners().catch(() => { });
    runUpsellBatch().catch(() => { });
    runAlsIfStale().catch(() => { });
  }, 3000);
};

module.exports = {
  startCronJobs,
  incrementInteractionCounter,
  runAlsBatch,
  runItemCFBatch,
  runUpsellBatch,
};
