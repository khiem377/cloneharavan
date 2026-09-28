const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const TEMPLATE_DIR = path.join(__dirname, '../template');

/**
 * Service fill dữ liệu xuất file Excel theo Template (.xlsx)
 */

class ExcelTemplateService {
  /**
   * Đọc và log cấu trúc file Excel template để kiểm tra ô/dòng
   */
  static async inspectTemplate(filename) {
    const filePath = path.join(TEMPLATE_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`[ExcelTemplate] File không tồn tại: ${filePath}`);
      return null;
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.worksheets[0];
    const structure = [];

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      const cells = [];
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        let rawVal = cell.value;
        if (typeof rawVal === 'object' && rawVal !== null) {
          if (rawVal.result !== undefined) rawVal = rawVal.result;
          else if (rawVal.richText) rawVal = rawVal.richText.map(t => t.text).join('');
          else if (rawVal.text) rawVal = rawVal.text;
          else rawVal = JSON.stringify(rawVal);
        }
        cells.push({ col: colNumber, addr: cell.address, val: String(rawVal).trim() });
      });
      if (cells.length > 0) {
        structure.push({ row: rowNumber, cells });
      }
    });

    return { sheetName: sheet.name, rowCount: sheet.rowCount, structure };
  }
}

// Chạy tự động log khi nodemon restart
(async () => {
  try {
    const files = ['phieu nhap kho.xlsx', 'Phieu xuat kho.xlsx', 'phieu kiem tra hang hoa.xlsx'];
    console.log('\n======================================================');
    console.log('📊 ĐANG KIỂM TRA VÀ BÓC TÁCH CÁC FILE EXCEL TEMPLATE');
    console.log('======================================================');
    for (const f of files) {
      const res = await ExcelTemplateService.inspectTemplate(f);
      if (res) {
        console.log(`\n📌 Template: "${f}" (${res.sheetName})`);
        res.structure.forEach(r => {
          const line = r.cells.map(c => `[${c.addr}]: "${c.val}"`).join(' | ');
          console.log(`   Dòng ${r.row.toString().padStart(2, ' ')} -> ${line}`);
        });
      }
    }
    console.log('======================================================\n');
  } catch (err) {
    console.error('Lỗi inspect excel template:', err.message);
  }
})();

module.exports = ExcelTemplateService;
