/**
 * backfillProductRetailFields.js
 * Migration script to populate newly added retail & WMS fields for all existing products and variants in MongoDB:
 * - Product: weight (g), dimensions (L x W x H cm), keywords (Pancake fast search tokens),
 *            lowStockThreshold, allowNegativeStock, hideNameOnPrint, hideOnInvoice, weightBasedPricing, itemType.
 * - ProductVariant: weight (g), dimensions (L x W x H cm).
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const Brand = require('../models/brand.model');
const Category = require('../models/category.model');

// Helper to remove Vietnamese tones for fast search keywords
function removeVietnameseTones(str) {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  return str;
}

// Generate fast-search keywords (model, code, brand, unaccented, category acronyms)
function generateKeywords(product) {
  const keywords = new Set();
  const name = (product.name || '').trim();
  const cleanName = removeVietnameseTones(name);
  const brand = (product.brand?.name || '').toLowerCase().trim();

  // Add brand
  if (brand) keywords.add(brand);

  // Model codes regex (e.g. KD-75X80L, RS64R5301B4, SMS4EVI14E, M4, S24, 16IRX9)
  const tokens = name.match(/[a-zA-Z0-9\-\/]{2,}/g) || [];
  for (const t of tokens) {
    const raw = t.toLowerCase().replace(/[^a-z0-9\-]/g, '');
    if (raw.length >= 2 && !['inch', 'lit', 'kg', 'hp', 'nam', 'cho', 'ban', 'cap'].includes(raw)) {
      keywords.add(raw);
      if (raw.includes('-')) {
        keywords.add(raw.replace(/-/g, ''));
      }
    }
  }

  // Category and specific terms
  const nLow = cleanName;
  if (nLow.includes('tivi') || nLow.includes('tv')) {
    keywords.add('tv');
    keywords.add('tivi');
    keywords.add('ti vi');
    if (nLow.includes('smart')) keywords.add('smart tivi');
    if (nLow.includes('oled')) keywords.add('oled');
    if (nLow.includes('qled')) keywords.add('qled');
    if (nLow.includes('4k')) keywords.add('4k');
  }
  if (nLow.includes('tu lanh')) {
    keywords.add('tl');
    keywords.add('tu lanh');
    keywords.add('tulanh');
    if (nLow.includes('inverter')) keywords.add('inverter');
    if (nLow.includes('side by side')) keywords.add('sbs');
    if (nLow.includes('multi door')) keywords.add('multidoor');
  }
  if (nLow.includes('tu dong')) {
    keywords.add('td');
    keywords.add('tu dong');
    keywords.add('tudong');
  }
  if (nLow.includes('may lanh') || nLow.includes('dieu hoa')) {
    keywords.add('ml');
    keywords.add('dh');
    keywords.add('may lanh');
    keywords.add('dieu hoa');
  }
  if (nLow.includes('may giat')) {
    keywords.add('mg');
    keywords.add('may giat');
    keywords.add('maygiat');
  }
  if (nLow.includes('may say')) {
    keywords.add('ms');
    keywords.add('may say');
    keywords.add('maysay');
  }
  if (nLow.includes('may loc khong khi')) {
    keywords.add('mlkk');
    keywords.add('loc khong khi');
  }
  if (nLow.includes('may loc nuoc')) {
    keywords.add('mln');
    keywords.add('loc nuoc');
    keywords.add('ro');
  }
  if (nLow.includes('robot')) {
    keywords.add('rb');
    keywords.add('robot');
    keywords.add('hut bui');
    keywords.add('lau nha');
  }
  if (nLow.includes('noi chien')) {
    keywords.add('nckd');
    keywords.add('noi chien');
    keywords.add('noi chien khong dau');
  }
  if (nLow.includes('noi com')) {
    keywords.add('noi com');
    keywords.add('noi com dien');
    keywords.add('cuckoo');
  }
  if (nLow.includes('may rua chen')) {
    keywords.add('mrc');
    keywords.add('mrb');
    keywords.add('may rua chen');
    keywords.add('may rua bat');
  }
  if (nLow.includes('dien thoai') || nLow.includes('iphone') || nLow.includes('galaxy')) {
    keywords.add('dt');
    keywords.add('dien thoai');
    keywords.add('smartphone');
    if (nLow.includes('iphone')) {
      keywords.add('ip');
      keywords.add('iphone');
      if (nLow.includes('16 pro max')) {
        keywords.add('ip16prm');
        keywords.add('16prm');
        keywords.add('16 pro max');
      }
      if (nLow.includes('15 pro')) {
        keywords.add('ip15pro');
        keywords.add('15 pro');
      }
    }
    if (nLow.includes('s24')) {
      keywords.add('s24');
      keywords.add('s24u');
      keywords.add('s24 ultra');
    }
    if (nLow.includes('fold6') || nLow.includes('fold 6')) {
      keywords.add('fold6');
      keywords.add('z fold 6');
    }
    if (nLow.includes('flip6') || nLow.includes('flip 6')) {
      keywords.add('flip6');
      keywords.add('z flip 6');
    }
  }
  if (nLow.includes('ipad')) {
    keywords.add('ipad');
    keywords.add('mtb');
    keywords.add('may tinh bang');
  }
  if (nLow.includes('macbook')) {
    keywords.add('mb');
    keywords.add('macbook');
    keywords.add('mac');
    keywords.add('laptop');
  }
  if (nLow.includes('laptop')) {
    keywords.add('lt');
    keywords.add('laptop');
    keywords.add('may tinh');
  }
  if (nLow.includes('loa')) {
    keywords.add('loa');
    keywords.add('speaker');
    if (nLow.includes('soundbar')) keywords.add('soundbar');
    if (nLow.includes('karaoke')) keywords.add('karaoke');
  }
  if (nLow.includes('dong ho')) {
    keywords.add('dh');
    keywords.add('dong ho');
    keywords.add('smartwatch');
  }
  if (nLow.includes('playstation') || nLow.includes('ps5')) {
    keywords.add('ps5');
    keywords.add('playstation');
    keywords.add('console');
  }

  return Array.from(keywords).filter((k) => k.length >= 2);
}

// Low stock threshold
function determineLowStockThreshold(product) {
  const n = removeVietnameseTones(product.name || '');
  if (n.includes('iphone') || n.includes('s24 ultra') || n.includes('fold6') || n.includes('macbook') || n.includes('ps5')) {
    return 2;
  }
  if (n.includes('tivi') || n.includes('tu lanh') || n.includes('may giat') || n.includes('may lanh') || n.includes('may rua chen')) {
    return 3;
  }
  if (n.includes('chuot') || n.includes('tai nghe') || n.includes('ban phim')) {
    return 10;
  }
  return 5;
}

// Determine specifications (weight in grams, dimensions in cm)
function determineProductSpecs(product) {
  const n = removeVietnameseTones(product.name || '');

  // --- TIVI & MÀN HÌNH ---
  if (n.includes('tivi') || n.includes('tv')) {
    if (n.includes('75 inch') || n.includes('75x80l')) return { weight: 33700, dimensions: { length: 167.5, width: 39.9, height: 103.6 } };
    if (n.includes('65 inch') || n.includes('65xr70') || n.includes('65qn85d') || n.includes('65c755')) return { weight: 23500, dimensions: { length: 145.0, width: 28.5, height: 89.0 } };
    if (n.includes('55 inch') || n.includes('55xr80') || n.includes('55q60d') || n.includes('oled55c4psa') || n.includes('55uga610')) return { weight: 15500, dimensions: { length: 122.8, width: 24.5, height: 77.2 } };
    if (n.includes('43 inch') || n.includes('43x77l') || n.includes('43v31mp') || n.includes('aqt43k800fg')) return { weight: 8500, dimensions: { length: 96.4, width: 18.2, height: 60.5 } };
    return { weight: 14000, dimensions: { length: 120.0, width: 20.0, height: 75.0 } };
  }
  if (n.includes('odyssey oled g9') || n.includes('49 inch')) {
    return { weight: 12600, dimensions: { length: 119.5, width: 23.7, height: 52.9 } };
  }
  if (n.includes('the freestyle')) {
    return { weight: 830, dimensions: { length: 10.4, width: 10.4, height: 17.3 } };
  }
  if (n.includes('nintendo switch')) {
    return { weight: 420, dimensions: { length: 24.2, width: 10.2, height: 1.4 } };
  }
  if (n.includes('asus rog azoth') || n.includes('ban phim co')) {
    return { weight: 1180, dimensions: { length: 38.0, width: 16.0, height: 4.0 } };
  }

  // --- TỦ LẠNH & TỦ ĐÔNG ---
  if (n.includes('tu dong') || n.includes('vh-4099w2kd')) {
    return { weight: 48000, dimensions: { length: 133.0, width: 62.0, height: 85.0 } };
  }
  if (n.includes('tu lanh')) {
    if (n.includes('side by side') || n.includes('multi door') || n.includes('instaview') || n.includes('rs64r5301b4') || n.includes('647 lit') || n.includes('635 lit') || n.includes('550 lit') || n.includes('541 lit')) {
      const w = n.includes('635 lit') || n.includes('647 lit') ? 109000 : 95000;
      return { weight: w, dimensions: { length: 91.2, width: 71.6, height: 178.0 } };
    }
    if (n.includes('511 lit') || n.includes('495 lit') || n.includes('488 lit') || n.includes('474 lit') || n.includes('409 lit')) {
      return { weight: 75000, dimensions: { length: 83.3, width: 68.5, height: 177.5 } };
    }
    if (n.includes('341 lit') || n.includes('322 lit') || n.includes('234 lit')) {
      return { weight: 56000, dimensions: { length: 60.0, width: 65.0, height: 168.0 } };
    }
    if (n.includes('181 lit')) {
      return { weight: 38000, dimensions: { length: 54.0, width: 60.0, height: 135.0 } };
    }
    return { weight: 65000, dimensions: { length: 70.0, width: 65.0, height: 170.0 } };
  }

  // --- MÁY LẠNH / ĐIỀU HOÀ ---
  if (n.includes('may lanh') || n.includes('dieu hoa')) {
    if (n.includes('1.5 hp')) {
      return { weight: 31000, dimensions: { length: 77.0, width: 28.5, height: 55.0 } };
    }
    return { weight: 28000, dimensions: { length: 77.0, width: 28.0, height: 52.0 } };
  }

  // --- MÁY GIẶT & MÁY SẤY ---
  if (n.includes('lg styler') || n.includes('tu cham soc quan ao')) {
    return { weight: 78000, dimensions: { length: 44.5, width: 58.5, height: 185.0 } };
  }
  if (n.includes('may giat say') || n.includes('14 kg')) {
    return { weight: 82000, dimensions: { length: 64.5, width: 77.0, height: 94.0 } };
  }
  if (n.includes('may giat')) {
    return { weight: 73000, dimensions: { length: 60.0, width: 58.5, height: 85.0 } };
  }
  if (n.includes('may say')) {
    const w = n.includes('heatpump') || n.includes('bom nhiet') ? 50000 : 38000;
    return { weight: w, dimensions: { length: 60.0, width: 60.0, height: 85.0 } };
  }
  if (n.includes('dyson supersonic') || n.includes('hd15') || n.includes('may say toc')) {
    return { weight: 660, dimensions: { length: 24.5, width: 7.8, height: 9.7 } };
  }

  // --- MÁY LỌC KHÔNG KHÍ & HÚT ẨM ---
  if (n.includes('dw-j27fv-s') || n.includes('hut am')) {
    return { weight: 16800, dimensions: { length: 35.9, width: 30.1, height: 66.5 } };
  }
  if (n.includes('4 pro') || n.includes('fp-j60e') || n.includes('mc55uvm6') || n.includes('ap-1018f')) {
    const w = n.includes('fp-j60e') ? 10000 : 6800;
    return { weight: w, dimensions: { length: 27.5, width: 27.5, height: 68.0 } };
  }
  if (n.includes('4 compact')) {
    return { weight: 2200, dimensions: { length: 22.0, width: 22.0, height: 35.5 } };
  }
  if (n.includes('may loc nuoc') || n.includes('hydrogen') || n.includes('smax')) {
    return { weight: 32000, dimensions: { length: 38.0, width: 31.0, height: 98.0 } };
  }
  if (n.includes('es-wh96') || n.includes('triet long')) {
    return { weight: 350, dimensions: { length: 21.3, width: 6.9, height: 4.4 } };
  }

  // --- ROBOT HÚT BỤI & VỆ SINH ---
  if (n.includes('dyson v12') || n.includes('cam tay')) {
    return { weight: 2200, dimensions: { length: 25.0, width: 25.0, height: 123.0 } };
  }
  if (n.includes('d9 max')) {
    return { weight: 3800, dimensions: { length: 35.0, width: 35.0, height: 9.7 } };
  }
  if (n.includes('robot') || n.includes('omni') || n.includes('revo') || n.includes('ultra heat') || n.includes('x20 plus')) {
    return { weight: 17500, dimensions: { length: 42.0, width: 45.0, height: 52.0 } };
  }

  // --- GIA DỤNG NHÀ BẾP ---
  if (n.includes('noi chien')) {
    const w = n.includes('xxl') || n.includes('8.3') || n.includes('7.2') ? 7200 : (n.includes('4.1') ? 4500 : 5500);
    return { weight: w, dimensions: { length: 36.0, width: 36.0, height: 38.0 } };
  }
  if (n.includes('cuckoo') || n.includes('noi com')) {
    return { weight: 8600, dimensions: { length: 42.3, width: 30.5, height: 29.0 } };
  }
  if (n.includes('bep tu') || n.includes('ppi82560ms')) {
    return { weight: 10500, dimensions: { length: 78.0, width: 45.0, height: 5.9 } };
  }
  if (n.includes('hurom h400') || n.includes('may ep cham')) {
    return { weight: 6700, dimensions: { length: 26.1, width: 16.9, height: 47.1 } };
  }
  if (n.includes('delonghi') || n.includes('ca phe') || n.includes('ecam22')) {
    return { weight: 9000, dimensions: { length: 23.8, width: 43.0, height: 35.1 } };
  }
  if (n.includes('lo vi song') || n.includes('emg23di9ebp')) {
    return { weight: 12500, dimensions: { length: 49.0, width: 39.0, height: 29.0 } };
  }
  if (n.includes('may xay sinh to') || n.includes('hr3652')) {
    return { weight: 4300, dimensions: { length: 20.0, width: 20.0, height: 43.0 } };
  }

  // --- MÁY RỬA CHÉN ---
  if (n.includes('may rua chen') || n.includes('sms4evi14e') || n.includes('sms6zci42e') || n.includes('sms26ai01f')) {
    if (n.includes('mini') || n.includes('de ban') || n.includes('hdw-t5531b')) {
      return { weight: 21500, dimensions: { length: 55.0, width: 50.0, height: 43.8 } };
    }
    return { weight: 52500, dimensions: { length: 60.0, width: 60.0, height: 84.5 } };
  }

  // --- IPAD & MÁY TÍNH BẢNG ---
  if (n.includes('ipad pro 13')) return { weight: 579, dimensions: { length: 28.1, width: 21.5, height: 0.51 } };
  if (n.includes('ipad pro 11')) return { weight: 444, dimensions: { length: 24.9, width: 17.7, height: 0.53 } };
  if (n.includes('ipad air 11')) return { weight: 462, dimensions: { length: 24.7, width: 17.8, height: 0.61 } };
  if (n.includes('ipad gen 10')) return { weight: 477, dimensions: { length: 24.8, width: 17.9, height: 0.70 } };
  if (n.includes('ipad mini 6')) return { weight: 293, dimensions: { length: 19.5, width: 13.4, height: 0.63 } };
  if (n.includes('tab s9 ultra')) return { weight: 732, dimensions: { length: 32.6, width: 20.8, height: 0.55 } };
  if (n.includes('pad 6')) return { weight: 490, dimensions: { length: 25.4, width: 16.5, height: 0.65 } };

  // --- LAPTOP & MACBOOK ---
  if (n.includes('macbook air 13')) return { weight: 1240, dimensions: { length: 30.4, width: 21.5, height: 1.13 } };
  if (n.includes('macbook air 15')) return { weight: 1510, dimensions: { length: 34.0, width: 23.7, height: 1.15 } };
  if (n.includes('macbook pro 14')) return { weight: 1610, dimensions: { length: 31.2, width: 22.1, height: 1.55 } };
  if (n.includes('legion 5 pro')) return { weight: 2500, dimensions: { length: 36.3, width: 26.1, height: 2.67 } };
  if (n.includes('nitro v 15')) return { weight: 2100, dimensions: { length: 36.2, width: 23.9, height: 2.35 } };
  if (n.includes('zephyrus g16')) return { weight: 1850, dimensions: { length: 35.4, width: 24.6, height: 1.49 } };
  if (n.includes('zenbook 14') || n.includes('xps 13')) return { weight: 1200, dimensions: { length: 31.2, width: 22.0, height: 1.49 } };

  // --- MÁY CHƠI GAME & CONSOLE ---
  if (n.includes('ps5 slim') && n.includes('digital')) return { weight: 2600, dimensions: { length: 35.8, width: 8.0, height: 21.6 } };
  if (n.includes('ps5') || n.includes('playstation 5')) return { weight: 3200, dimensions: { length: 35.8, width: 9.6, height: 21.6 } };
  if (n.includes('xbox series x')) return { weight: 4450, dimensions: { length: 15.1, width: 15.1, height: 30.1 } };
  if (n.includes('playstation vr2') || n.includes('ps vr2')) return { weight: 560, dimensions: { length: 21.2, width: 15.8, height: 27.8 } };

  // --- SMARTPHONE ---
  if (n.includes('iphone 16 pro max')) return { weight: 227, dimensions: { length: 16.3, width: 7.76, height: 0.83 } };
  if (n.includes('iphone 16')) return { weight: 170, dimensions: { length: 14.76, width: 7.16, height: 0.78 } };
  if (n.includes('iphone 15 pro')) return { weight: 187, dimensions: { length: 14.66, width: 7.06, height: 0.83 } };
  if (n.includes('s24 ultra')) return { weight: 232, dimensions: { length: 16.23, width: 7.9, height: 0.86 } };
  if (n.includes('z fold6') || n.includes('fold6')) return { weight: 239, dimensions: { length: 15.35, width: 6.81, height: 1.21 } };
  if (n.includes('z flip6') || n.includes('flip6')) return { weight: 187, dimensions: { length: 8.51, width: 7.19, height: 1.49 } };
  if (n.includes('xiaomi 14 ultra')) return { weight: 220, dimensions: { length: 16.14, width: 7.53, height: 0.92 } };
  if (n.includes('redmi note 13 pro')) return { weight: 188, dimensions: { length: 16.11, width: 7.5, height: 0.8 } };

  // --- THIẾT BỊ ÂM THANH & LOA ---
  if (n.includes('airpods pro 2')) return { weight: 51, dimensions: { length: 4.5, width: 6.0, height: 2.2 } };
  if (n.includes('wh-1000xm5')) return { weight: 250, dimensions: { length: 22.0, width: 20.0, height: 7.5 } };
  if (n.includes('jbl charge 5')) return { weight: 960, dimensions: { length: 22.3, width: 9.7, height: 9.4 } };
  if (n.includes('emberton ii')) return { weight: 700, dimensions: { length: 16.0, width: 6.8, height: 7.6 } };
  if (n.includes('stanmore iii')) return { weight: 4250, dimensions: { length: 35.0, width: 19.5, height: 18.5 } };
  if (n.includes('partybox stage 320')) return { weight: 16500, dimensions: { length: 33.5, width: 38.5, height: 67.0 } };
  if (n.includes('hw-q990d') || n.includes('soundbar samsung')) return { weight: 18200, dimensions: { length: 123.2, width: 13.8, height: 6.9 } };
  if (n.includes('ht-a5000')) return { weight: 12000, dimensions: { length: 121.0, width: 14.0, height: 6.7 } };
  if (n.includes('ht-s20r')) return { weight: 13000, dimensions: { length: 76.0, width: 8.6, height: 5.2 } };
  if (n.includes('nanomax pro-9500') || n.includes('3600w')) return { weight: 42000, dimensions: { length: 52.0, width: 50.0, height: 86.0 } };
  if (n.includes('birici nb-6889') || n.includes('1200w')) return { weight: 32000, dimensions: { length: 50.0, width: 48.0, height: 78.0 } };
  if (n.includes('mobell mk-7080') || n.includes('1000w')) return { weight: 28000, dimensions: { length: 46.0, width: 44.0, height: 75.0 } };
  if (n.includes('jammy n2070k')) return { weight: 12000, dimensions: { length: 45.0, width: 26.0, height: 28.0 } };
  if (n.includes('sumico bella 42')) return { weight: 8000, dimensions: { length: 34.0, width: 23.0, height: 25.0 } };
  if (n.includes('enkor s2880')) return { weight: 3500, dimensions: { length: 28.0, width: 20.0, height: 20.0 } };

  // --- ĐỒNG HỒ & PHỤ KIỆN ---
  if (n.includes('apple watch ultra 2')) return { weight: 61, dimensions: { length: 4.9, width: 4.4, height: 1.44 } };
  if (n.includes('galaxy watch ultra')) return { weight: 60, dimensions: { length: 4.74, width: 4.71, height: 1.21 } };
  if (n.includes('garmin fenix 7 pro')) return { weight: 79, dimensions: { length: 4.7, width: 4.7, height: 1.45 } };
  if (n.includes('mx master 3s') || n.includes('chuot khong day')) return { weight: 141, dimensions: { length: 12.5, width: 8.4, height: 5.1 } };

  return { weight: 1000, dimensions: { length: 20.0, width: 15.0, height: 10.0 } };
}

// Adjust variant specifications based on attributes
function determineVariantSpecs(parentSpecs, variant) {
  const attrValues = (variant.attributes || []).map((a) => (a.value || '').toLowerCase()).join(' ');
  const dispName = (variant.displayName || '').toLowerCase();
  const text = attrValues + ' ' + dispName;

  if (text.includes('32 inch')) return { weight: 4500, dimensions: { length: 73.0, width: 14.0, height: 47.0 } };
  if (text.includes('43 inch')) return { weight: 8500, dimensions: { length: 96.4, width: 18.2, height: 60.5 } };
  if (text.includes('50 inch')) return { weight: 12500, dimensions: { length: 111.0, width: 22.0, height: 70.0 } };
  if (text.includes('55 inch')) return { weight: 15500, dimensions: { length: 122.8, width: 24.5, height: 77.2 } };
  if (text.includes('65 inch')) return { weight: 23500, dimensions: { length: 145.0, width: 28.5, height: 89.0 } };
  if (text.includes('75 inch')) return { weight: 33700, dimensions: { length: 167.5, width: 39.9, height: 103.6 } };

  return {
    weight: parentSpecs.weight,
    dimensions: { ...parentSpecs.dimensions },
  };
}

async function runBackfill() {
  const startTime = Date.now();
  console.log('🚀 Starting backfill of retail fields for Products & Variants...');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully.');

    // 1. Fetch all products
    const products = await Product.find({})
      .populate('brand', 'name')
      .populate('categories', 'name');

    console.log(`📦 Loaded ${products.length} products from database.`);

    // 2. Fetch all variants
    const variants = await ProductVariant.find({});
    console.log(`🔢 Loaded ${variants.length} variants from database.`);

    // Group variants by productId
    const variantMap = new Map();
    for (const v of variants) {
      const pIdStr = v.productId.toString();
      if (!variantMap.has(pIdStr)) {
        variantMap.set(pIdStr, []);
      }
      variantMap.get(pIdStr).push(v);
    }

    const productOps = [];
    const variantOps = [];

    let updatedProductsCount = 0;
    let updatedVariantsCount = 0;

    for (const p of products) {
      const pSpecs = determineProductSpecs(p);
      const keywords = generateKeywords(p);
      const lowStockThreshold = determineLowStockThreshold(p);

      // Prepare product update
      productOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: {
            $set: {
              weight: pSpecs.weight,
              dimensions: pSpecs.dimensions,
              keywords: keywords,
              lowStockThreshold: lowStockThreshold,
              allowNegativeStock: p.allowNegativeStock ?? false,
              hideNameOnPrint: p.hideNameOnPrint ?? false,
              hideOnInvoice: p.hideOnInvoice ?? false,
              weightBasedPricing: p.weightBasedPricing ?? false,
              itemType: p.itemType || 'merchandise',
            },
          },
        },
      });
      updatedProductsCount++;

      // Process variants of this product
      const pVariants = variantMap.get(p._id.toString()) || [];
      for (const v of pVariants) {
        const vSpecs = determineVariantSpecs(pSpecs, v);
        variantOps.push({
          updateOne: {
            filter: { _id: v._id },
            update: {
              $set: {
                weight: vSpecs.weight,
                dimensions: vSpecs.dimensions,
              },
            },
          },
        });
        updatedVariantsCount++;
      }
    }

    // Execute bulkWrite for Products
    if (productOps.length > 0) {
      console.log(`⏳ Executing bulkWrite for ${productOps.length} products...`);
      const prodRes = await Product.bulkWrite(productOps);
      console.log(`✅ Product bulkWrite complete: ${prodRes.modifiedCount} updated (${prodRes.matchedCount} matched).`);
    }

    // Execute bulkWrite for Variants
    if (variantOps.length > 0) {
      console.log(`⏳ Executing bulkWrite for ${variantOps.length} variants...`);
      const varRes = await ProductVariant.bulkWrite(variantOps);
      console.log(`✅ Variant bulkWrite complete: ${varRes.modifiedCount} updated (${varRes.matchedCount} matched).`);
    }

    // Verification check: sample 3 products
    const sample = await Product.find({}).limit(3).lean();
    console.log('\n--- VERIFICATION SAMPLING ---');
    sample.forEach((p, idx) => {
      console.log(`Sample ${idx + 1}: ${p.name}`);
      console.log(`  Weight: ${p.weight}g | Dimensions: ${p.dimensions?.length} x ${p.dimensions?.width} x ${p.dimensions?.height} cm`);
      console.log(`  Threshold: ${p.lowStockThreshold} | NegativeStock: ${p.allowNegativeStock}`);
      console.log(`  Keywords (${p.keywords?.length}): ${p.keywords?.slice(0, 6).join(', ')}...`);
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n🎉 Backfill successfully completed in ${duration}s!`);
    console.log(`📊 Summary: ${updatedProductsCount} products & ${updatedVariantsCount} variants processed.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error executing backfill script:', error);
    process.exit(1);
  }
}

runBackfill();
