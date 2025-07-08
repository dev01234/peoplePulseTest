"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DataTableProps {
  columns: {
    key: string;
    label: string;
    render?: (value: any, item: any) => React.ReactNode;
  }[];
  data: any[];
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
}

export function DataTable({ 
  columns, 
  data, 
  loading = false, 
  loadingMessage = "Loading data...", 
  emptyMessage = "No data found" 
}: DataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center py-4">
              {loadingMessage}
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center py-4">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((item, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={`${index}-${column.key}`}>
                  {column.render 
                    ? column.render(item[column.key], item) 
                    : item[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}