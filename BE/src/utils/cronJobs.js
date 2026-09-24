/**
 * cronJobs.js — Layer 7: Auto-trigger Batch Jobs
 * Chuẩn Netflix/Amazon: không chạy tay, tự động theo lịch
 *
 * Jobs:
 * 1. Python SVD/ALS batch    — mỗi 4 giờ
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

// ── Interaction counter trigger ──────────────────────────────────────────────
let _newInteractionCount = 0;
const INTERACTION_TRIGGER = 100; // trigger Python SVD khi đủ N interactions mới

const incrementInteractionCounter = () => {
  _newInteractionCount++;
  if (_newInteractionCount >= INTERACTION_TRIGGER) {
    _newInteractionCount = 0;
    runPythonSVDBatch().catch(() => { }); // fire-and-forget
  }
};

// ── Python SVD Batch ───────────────────────────────────────────────────────────────────────────
const runPythonSVDBatch = () => {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, '../../python-services/matrix_factorization.py');
    const pythonScriptDir = path.dirname(scriptPath);
    const pythonExecutable = process.env.PYTHON_PATH || (process.platform === 'win32' ? 'python' : 'python3');

    cronLog.info('PythonSVD', 'Starting batch...');

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
        if (err) {
          cronLog.error('PythonSVD', err);
          if (stderr) cronLog.warn('PythonSVD', `stderr: ${stderr.slice(0, 300)}`);
        } else {
          cronLog.info('PythonSVD', 'Completed successfully.');
          if (stdout) console.log('[CronJobs][PythonSVD] stdout:', stdout.slice(0, 500));
        }
        resolve();
      }
    );
  });
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

  // Python SVD: every 4 hours (mỗi 4 tiếng)
  cron.schedule('0 */4 * * *', () => {
    runPythonSVDBatch().catch(() => { });
  });
  console.log('[CronJobs] Python SVD scheduled: every 4 hours');

  // Item-CF: every 6 hours (mỗi 6 tiếng)
  cron.schedule('0 */6 * * *', () => {
    runItemCFBatch().catch(() => { });
  });
  console.log('[CronJobs] Item-CF scheduled: every 6 hours');

  // Reset SearchLog count7d: every Sunday midnight
  cron.schedule('0 0 * * 0', () => {
    resetSearchLog7d().catch(() => { });
  });
  console.log('[CronJobs] SearchLog count7d reset scheduled: every Sunday');

  // Banner expiry: every 30 minutes — tu dong an banner het lich
  cron.schedule('*/30 * * * *', () => {
    autoHideExpiredBanners().catch(() => { });
  });
  console.log('[CronJobs] Banner auto-hide scheduled: every 30 minutes');

  // Upsell Engine: every 8 hours
  cron.schedule('0 */8 * * *', () => {
    runUpsellBatch().catch(() => { });
  });
  console.log('[CronJobs] Upsell Engine scheduled: every 8 hours');

  // Run in background 10 seconds after startup to avoid blocking server boot
  setTimeout(() => {
    runItemCFBatch().catch(() => { });
    autoHideExpiredBanners().catch(() => { });
    runUpsellBatch().catch(() => { });
  }, 10000);
};

module.exports = {
  startCronJobs,
  incrementInteractionCounter,
  runPythonSVDBatch,
  runItemCFBatch,
  runUpsellBatch,
};
