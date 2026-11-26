export function stripCsvComments(text: string): string {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const kept: string[] = [];
  let inQuotes = false;

  for (const line of lines) {
    if (!inQuotes && line.trim().startsWith("#")) continue;
    kept.push(line);
    for (let index = 0; index < line.length; index += 1) {
      if (line[index] !== '"') continue;
      if (inQuotes && line[index + 1] === '"') {
        index += 1;
        continue;
      }
      inQuotes = !inQuotes;
    }
  }

  return kept.join("\n");
}

export function parseCsv(text: string): string[][] {
  const input = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (inQuotes) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && input[index + 1] === "\n") index += 1;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }
  if (inQuotes) throw new Error("CSV has an unterminated quote");
  return rows;
}

export function rowsFromCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const table = parseCsv(stripCsvComments(text));
  if (table.length === 0) throw new Error("CSV is empty");
  const headers = table[0].map((header) => header.trim());
  const seen = new Set<string>();
  for (const header of headers) {
    if (!header) throw new Error("CSV header has an empty column name");
    if (seen.has(header)) throw new Error(`CSV header ${header} is duplicated`);
    seen.add(header);
  }

  const rows = table.slice(1).map((cells, index) => {
    if (cells.length !== headers.length) {
      throw new Error(`CSV row ${index + 2} has ${cells.length} columns; expected ${headers.length}`);
    }
    const record: Record<string, string> = {};
    headers.forEach((header, cellIndex) => {
      record[header] = (cells[cellIndex] ?? "").trim();
    });
    return record;
  });

  return { headers, rows };
}

export function assertHeaders(actual: string[], expected: readonly string[], fileName: string): void {
  if (actual.length !== expected.length || actual.some((header, index) => header !== expected[index])) {
    throw new Error(
      `${fileName} headers do not match the contract.\nExpected: ${expected.join(",")}\nActual:   ${actual.join(",")}`,
    );
  }
}
