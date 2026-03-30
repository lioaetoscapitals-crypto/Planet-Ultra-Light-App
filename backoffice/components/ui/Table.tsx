type Column<T> = {
  key: keyof T;
  header: string;
};

type Props<T extends Record<string, string>> = {
  columns: Column<T>[];
  rows: T[];
};

export default function Table<T extends Record<string, string>>({ columns, rows }: Props<T>) {
  return (
    <div className="bo-table-wrap">
      <table className="bo-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${rowIndex}-${String(row[columns[0].key])}`}>
              {columns.map((column) => (
                <td key={String(column.key)}>{row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
