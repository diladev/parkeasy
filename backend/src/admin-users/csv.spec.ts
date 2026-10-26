import { csvCell, toCsv } from './csv';

describe('csvCell', () => {
  it('leaves plain values alone', () => {
    expect(csvCell('Aram Hassan')).toBe('Aram Hassan');
    expect(csvCell(42)).toBe('42');
    expect(csvCell(-5)).toBe('-5');
    expect(csvCell(null)).toBe('');
  });

  it('quotes commas, quotes and line breaks', () => {
    expect(csvCell('Rashid, Lana')).toBe('"Rashid, Lana"');
    expect(csvCell('Say "hi"')).toBe('"Say ""hi"""');
    expect(csvCell('two\nlines')).toBe('"two\nlines"');
  });

  it('defuses text a spreadsheet would run as a formula', () => {
    expect(csvCell('=HYPERLINK("http://evil")')).toBe(
      `"'=HYPERLINK(""http://evil"")"`,
    );
    expect(csvCell('+964 750 100 0001')).toBe("'+964 750 100 0001");
    expect(csvCell('-1+1')).toBe("'-1+1");
    expect(csvCell('@SUM(A1)')).toBe("'@SUM(A1)");
  });
});

describe('toCsv', () => {
  it('writes a UTF-8 file Excel opens correctly, one CRLF line per row', () => {
    expect(toCsv(['ID', 'Name'], [[1, 'لانا ڕەشید']])).toBe(
      '\uFEFFID,Name\r\n1,لانا ڕەشید\r\n',
    );
  });
});
