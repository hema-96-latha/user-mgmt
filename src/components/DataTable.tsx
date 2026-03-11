
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  globalFilter?: string;
}

export function DataTable<T>({ data, columns, globalFilter }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
    
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        {table.getAllColumns().filter((c) => c.getCanHide()).map((col) => (
          <label key={col.id} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", cursor: "pointer", padding: "0.25rem 0.6rem", border: "1px solid var(--border)", borderRadius: "4px", background: col.getIsVisible() ? "var(--accent-muted)" : "transparent", color: "var(--text-muted)" }}>
            <input
              type="checkbox"
              checked={col.getIsVisible()}
              onChange={col.getToggleVisibilityHandler()}
              style={{ accentColor: "var(--accent)" }}
            />
            {col.id}
          </label>
        ))}
      </div>

     
      <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid var(--border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} style={{ background: "var(--table-head-bg)" }}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      cursor: header.column.getCanSort() ? "pointer" : "default",
                      borderBottom: "1px solid var(--border)",
                      whiteSpace: "nowrap",
                      userSelect: "none",
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc" ? " ↑" : header.column.getIsSorted() === "desc" ? " ↓" : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                  No users found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  style={{
                    background: i % 2 === 0 ? "var(--table-row-even)" : "var(--table-row-odd)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--table-row-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "var(--table-row-even)" : "var(--table-row-odd)")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={{ padding: "0.7rem 1rem", borderBottom: "1px solid var(--border)", color: "var(--text)" }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}





// import React, { useState } from "react";
// import {
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getSortedRowModel,
//   useReactTable,
//   type ColumnDef,
//   type SortingState,
//   type ColumnFiltersState,
//   type VisibilityState,
// } from "@tanstack/react-table";

// interface DataTableProps<T> {
//   data: T[];
//   columns: ColumnDef<T, any>[];
//   globalFilter?: string;
//   renderInlineRow?: (row: T) => React.ReactNode;
//   isEditingRow?: (row: T) => boolean;
// }

// export function DataTable<T>({ data, columns, globalFilter, renderInlineRow, isEditingRow }: DataTableProps<T>) {
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
//   const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

//   const table = useReactTable({
//     data,
//     columns,
//     state: { sorting, columnFilters, columnVisibility, globalFilter },
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     onColumnVisibilityChange: setColumnVisibility,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//   });

//   return (
//     <div>
//       <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
//         {table.getAllColumns().filter((c) => c.getCanHide()).map((col) => (
//           <label
//             key={col.id}
//             style={{
//               display: "flex", alignItems: "center", gap: "0.3rem",
//               fontSize: "0.78rem", cursor: "pointer", padding: "0.25rem 0.6rem",
//               border: "1px solid var(--border)", borderRadius: "4px",
//               background: col.getIsVisible() ? "var(--accent-muted)" : "transparent",
//               color: "var(--text-muted)",
//             }}
//           >
//             <input
//               type="checkbox"
//               checked={col.getIsVisible()}
//               onChange={col.getToggleVisibilityHandler()}
//               style={{ accentColor: "var(--accent)" }}
//             />
//             {col.id}
//           </label>
//         ))}
//       </div>

//       <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid var(--border)" }}>
//         <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
//           <thead>
//             {table.getHeaderGroups().map((hg) => (
//               <tr key={hg.id} style={{ background: "var(--table-head-bg)" }}>
//                 {hg.headers.map((header) => (
//                   <th
//                     key={header.id}
//                     onClick={header.column.getToggleSortingHandler()}
//                     style={{
//                       padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600,
//                       color: "var(--text-muted)", cursor: header.column.getCanSort() ? "pointer" : "default",
//                       borderBottom: "1px solid var(--border)", whiteSpace: "nowrap", userSelect: "none",
//                     }}
//                   >
//                     {flexRender(header.column.columnDef.header, header.getContext())}
//                     {header.column.getIsSorted() === "asc" ? " ↑" : header.column.getIsSorted() === "desc" ? " ↓" : ""}
//                   </th>
//                 ))}
//               </tr>
//             ))}
//           </thead>
//           <tbody>
//             {table.getRowModel().rows.length === 0 ? (
//               <tr>
//                 <td colSpan={columns.length} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
//                   No users found.
//                 </td>
//               </tr>
//             ) : (
//               table.getRowModel().rows.map((row, i) => {
               
//                 if (renderInlineRow && isEditingRow && isEditingRow(row.original)) {
//                   const inlineRow = renderInlineRow(row.original);
//                   return React.isValidElement(inlineRow)
//                     ? React.cloneElement(inlineRow as React.ReactElement, { key: row.id })
//                     : inlineRow;
//                 }

//                 return (
//                   <tr
//                     key={row.id}
//                     style={{
//                       background: i % 2 === 0 ? "var(--table-row-even)" : "var(--table-row-odd)",
//                       transition: "background 0.15s",
//                     }}
//                     onMouseEnter={(e) => (e.currentTarget.style.background = "var(--table-row-hover)")}
//                     onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "var(--table-row-even)" : "var(--table-row-odd)")}
//                   >
//                     {row.getVisibleCells().map((cell) => (
//                       <td
//                         key={cell.id}
//                         style={{ padding: "0.7rem 1rem", borderBottom: "1px solid var(--border)", color: "var(--text)" }}
//                       >
//                         {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                       </td>
//                     ))}
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }