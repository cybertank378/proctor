// Files: src/shared-ui/component/Table.tsx

"use client"

import clsx from "clsx"
import type React from "react"

//////////////////////////////////////////////////////////////
// TABLE CONTAINER
//////////////////////////////////////////////////////////////

type TableProps = {
  children: React.ReactNode

  className?: string

  wrapperClassName?: string

  /**
   * Mengaktifkan sticky header.
   *
   * Ketika aktif, wrapper table akan memiliki
   * vertical scroll berdasarkan maxHeight.
   *
   * @default false
   */
  stickyHeader?: boolean

  /**
   * Tinggi maksimum container ketika sticky header aktif.
   *
   * Contoh:
   * - "60vh"
   * - "70vh"
   * - "600px"
   */
  maxHeight?: string

  /**
   * Mengaktifkan responsive horizontal scrolling.
   *
   * Seluruh kolom tetap tersedia pada viewport kecil
   * dan dapat diakses melalui horizontal scrolling.
   *
   * @default true
   */
  responsive?: boolean

  /**
   * Mengaktifkan sticky kolom pertama.
   *
   * Berguna untuk table dengan banyak kolom sehingga
   * identifier utama tetap terlihat ketika melakukan
   * horizontal scrolling.
   *
   * @default false
   */
  stickyFirstColumn?: boolean
}

export const Table = ({
  children,
  className,
  wrapperClassName,
  stickyHeader = false,
  maxHeight,
  responsive = true,
  stickyFirstColumn = false,
}: TableProps) => {
  return (
    <div
      className={clsx("w-full", responsive && "overflow-x-auto", stickyHeader && "overflow-y-auto", wrapperClassName)}
      style={
        stickyHeader && maxHeight
          ? {
              maxHeight,
            }
          : undefined
      }
    >
      <table
        className={clsx(
          "w-full border-collapse text-sm text-gray-700",

          /*
           * Prevent table columns from being compressed
           * excessively on small viewport sizes.
           *
           * The wrapper handles horizontal scrolling.
           */
          responsive && "min-w-max",

          /*
           * Sticky first column.
           *
           * Applies to both header cells and body cells.
           */
          stickyFirstColumn && [
            "[&_tr>*:first-child]:sticky",
            "[&_tr>*:first-child]:left-0",
            "[&_tr>*:first-child]:bg-white",
            "[&_tr>*:first-child]:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]",

            /*
             * Keep the first column above normal
             * table cells during horizontal scrolling.
             */
            "[&_tbody_tr>*:first-child]:z-10",

            /*
             * Header first column must remain above
             * both body cells and normal header cells.
             */
            "[&_thead_tr>*:first-child]:z-30",
          ],

          className
        )}
      >
        {children}
      </table>
    </div>
  )
}

//////////////////////////////////////////////////////////////
// TABLE HEAD
//////////////////////////////////////////////////////////////

type TableHeadProps = {
  children: React.ReactNode

  className?: string

  /**
   * Mengaktifkan sticky header.
   *
   * @default false
   */
  sticky?: boolean
}

export const TableHead = ({ children, className, sticky = false }: TableHeadProps) => {
  return <thead className={clsx(sticky && ["sticky", "top-0", "z-20", "bg-gray-500", "h-11"], className)}>{children}</thead>
}

//////////////////////////////////////////////////////////////
// TABLE BODY
//////////////////////////////////////////////////////////////

type TableBodyProps = {
  children: React.ReactNode

  className?: string
}

export const TableBody = ({ children, className }: TableBodyProps) => {
  return <tbody className={clsx("divide-y divide-gray-200", className)}>{children}</tbody>
}

//////////////////////////////////////////////////////////////
// TABLE HEADER CELL
//////////////////////////////////////////////////////////////

type TableHeaderCellProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  children?: React.ReactNode
}

export const TableHeaderCell = ({ children, className, ...props }: TableHeaderCellProps) => {
  return (
    <th
      className={clsx("h-11 whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600", className)}
      {...props}
    >
      {children}
    </th>
  )
}

//////////////////////////////////////////////////////////////
// TABLE ROW
//////////////////////////////////////////////////////////////

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  children: React.ReactNode
}

export const TableRow: React.FC<TableRowProps> = ({ children, className, ...props }) => {
  return (
      <tr className={clsx("transition-colors hover:bg-gray-50", className)} {...props}>
        {children}
      </tr>
  );
};

//////////////////////////////////////////////////////////////
// TABLE CELL
//////////////////////////////////////////////////////////////

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  children?: React.ReactNode
}

export const TableCell = ({ children, className, ...props }: TableCellProps) => {
  return (
    <td
      className={clsx("whitespace-nowrap px-4 py-3 text-sm text-gray-700", className)}
      {...props}
    >
      {children}
    </td>
  )
}
