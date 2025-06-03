import * as cheerio from "cheerio";

export interface TableData {
  headers: string[];
  rows: string[][];
}

export const HTMLHandler = {
  extractTables: (htmlContent: string): TableData[] => {
    const $ = cheerio.load(htmlContent);
    const tables: TableData[] = [];

    $("table").each((_, table) => {
      const tableData: TableData = {
        headers: [],
        rows: [],
      };

      // Try to find headers in any th elements, regardless of location
      $(table)
        .find("th")
        .each((_, header) => {
          tableData.headers.push($(header).text().trim());
        });

      // If still no headers, try first row as headers
      if (tableData.headers.length === 0) {
        $(table)
          .find("tr:first-child td")
          .each((_, cell) => {
            tableData.headers.push($(cell).text().trim());
          });
      }

      // Extract rows (excluding header row if it contains th elements)
      $(table)
        .find("tr")
        .each((_, row) => {
          // Skip rows that contain th elements (header rows)
          if ($(row).find("th").length === 0) {
            const rowData: string[] = [];
            $(row)
              .find("td")
              .each((_, cell) => {
                rowData.push($(cell).text().trim());
              });
            if (rowData.length > 0) {
              tableData.rows.push(rowData);
            }
          }
        });

      tables.push(tableData);
    });

    return tables;
  },
};
