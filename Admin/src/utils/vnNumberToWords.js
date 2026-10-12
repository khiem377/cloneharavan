/**
 * Chuyển đổi số tiền thành chữ Tiếng Việt chuẩn kế toán
 */

const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const UNITS = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

function readGroup3(group, isFirstGroup) {
  const hundreds = Math.floor(group / 100);
  const tens = Math.floor((group % 100) / 10);
  const ones = group % 10;

  let result = '';

  if (hundreds > 0 || !isFirstGroup) {
    result += `${DIGITS[hundreds]} trăm `;
  }

  if (tens === 0) {
    if (ones > 0 && (hundreds > 0 || !isFirstGroup)) {
      result += 'lẻ ';
    }
  } else if (tens === 1) {
    result += 'mười ';
  } else {
    result += `${DIGITS[tens]} mươi `;
  }

  if (tens > 0 && ones === 1) {
    if (tens === 1) {
      result += 'một ';
    } else {
      result += 'mốt ';
    }
  } else if (ones === 5 && (tens > 0 || hundreds > 0 || !isFirstGroup)) {
    if (tens === 0) {
      result += 'năm ';
    } else {
      result += 'lăm ';
    }
  } else if (ones > 0) {
    result += `${DIGITS[ones]} `;
  }

  return result.trim();
}

export function numberToWordsVN(number, options = {}) {
  const { suffix = 'đồng chẵn.', capitalize = true } = options;

  let num = Math.round(Number(number) || 0);
  if (num === 0) {
    return capitalize ? `Không ${suffix}`.trim() : `không ${suffix}`.trim();
  }

  let isNegative = false;
  if (num < 0) {
    isNegative = true;
    num = Math.abs(num);
  }

  const groups = [];
  while (num > 0) {
    groups.push(num % 1000);
    num = Math.floor(num / 1000);
  }

  let words = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    const groupVal = groups[i];
    if (groupVal > 0) {
      const isFirst = i === groups.length - 1;
      const groupText = readGroup3(groupVal, isFirst);
      const unitText = UNITS[i % UNITS.length] || '';
      words += `${groupText} ${unitText} `;
    }
  }

  words = words.trim().replace(/\s+/g, ' ');

  if (isNegative) {
    words = `âm ${words}`;
  }

  if (suffix) {
    words = `${words} ${suffix}`;
  }

  if (capitalize && words.length > 0) {
    words = words.charAt(0).toUpperCase() + words.slice(1);
  }

  return words.trim();
}
