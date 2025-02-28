
export enum ColumnType {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    FLOAT = 'FLOAT',
    BOOLEAN = 'BOOLEAN',
    DATE = 'DATE',
    DATETIME = 'DATETIME',
    JSON = 'JSON',
    // Tambahkan tipe data lain sesuai kebutuhan
  }
export function getColumnTypeMysql(columnType: string): ColumnType {
    if (columnType.startsWith('varchar') || columnType.startsWith('text')) {
      return ColumnType.STRING;
    } else if (columnType.startsWith('int')) {
      return ColumnType.NUMBER;
    } else if (columnType.startsWith('float') || columnType.startsWith('double')) {
      return ColumnType.FLOAT;
    } else if (columnType.startsWith('boolean')) {
      return ColumnType.BOOLEAN;
    } else if (columnType.startsWith('date')) {
      return ColumnType.DATE;
    } else if (columnType.startsWith('datetime') || columnType.startsWith('timestamp')) {
      return ColumnType.DATETIME;
    } else if (columnType.startsWith('json')) {
      return ColumnType.JSON;
    } else {
      // Jika tipe tidak dikenali, bisa memberi nilai default atau throw error
      return ColumnType.STRING; // Misalnya, default ke STRING
    }
  }
  