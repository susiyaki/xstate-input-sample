import { ZodError } from "zod";
import styles from "./table.module.css";

type Props = {
  headers: [string, string];
  rows: [string, unknown][];
};

const parseValue = (value: unknown): string => {
  if (typeof value === "string") return value || '""';
  if (value instanceof ZodError) return value.issues.map((issue) => issue.message).join("\t");
  if (value === undefined) return "undefined";
  if (value === null) return "null";

  return value.toString();
};

export const Table = ({ headers, rows }: Props) => {
  return (
    <table className={styles.table}>
      <thead className={styles.thead}>
        <tr>
          {headers.map((header, index) => (
            <td key={index} className={styles[`td${index + 1}`]}>
              {header}
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            <td className={styles.td1}>{row[0]}</td>
            <td className={styles.td2}>{parseValue(row[1])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
