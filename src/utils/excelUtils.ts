import ExcelJS from 'exceljs';

/**
 * Export data array to an Excel (.xlsx) file in browser
 */
export async function exportToExcel(
  filename: string,
  sheetName: string,
  columns: { header: string; key: string; width?: number }[],
  data: any[]
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 20,
  }));

  // Style header row
  worksheet.getRow(1).font = { bold: true };

  data.forEach((row) => {
    worksheet.addRow(row);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Read Excel (.xlsx) ArrayBuffer into 2D grid array
 */
export async function readExcelGrid(arrayBuffer: ArrayBuffer): Promise<any[][]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const grid: any[][] = [];

  worksheet.eachRow({ includeEmpty: true }, (row) => {
    const rowValues: any[] = [];
    // row.values is 1-indexed in exceljs (row.values[1] is first column)
    const values = Array.isArray(row.values) ? row.values.slice(1) : [];
    values.forEach(val => {
      if (val !== null && typeof val === 'object' && 'result' in val) {
        rowValues.push((val as any).result ?? '');
      } else if (val !== null && typeof val === 'object' && 'text' in val) {
        rowValues.push((val as any).text ?? '');
      } else if (val instanceof Date) {
        rowValues.push(val);
      } else {
        rowValues.push(val ?? '');
      }
    });
    grid.push(rowValues);
  });

  return grid;
}
