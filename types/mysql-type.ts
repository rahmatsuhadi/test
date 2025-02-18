// Tipe untuk kolom dalam tabel
export interface IColumn {
  Field: string;
  Type: string;
  Null: "YES" | "NO";
  Key: string; // Misalnya, 'PRI', 'MUL', atau ''
  Default: string | null;
  Extra: string;
}

// Tipe untuk tabel
export interface ITable {
  name: string;
  columns: IColumn[];
}

// Tipe untuk database
export interface IDatabase {
  id: string;
  name: string;
  type: string; // Misalnya: 'mysql', 'postgresql', dll.
  host: string;
  username: string;
  password: string;
  port: number;
  createdAt: string; // Atau bisa menggunakan Date jika ingin mengkonversi ke tipe tanggal
}

// Tipe untuk keseluruhan struktur
export interface IDatabaseSchema {
  database: IDatabase;
  tables: ITable[];
}

export interface IField {
  Field: string;
  Type: string;
  Null: "NO" | "YES";
  Key: string;
  Default: null | any;
  Extra: string;
}
