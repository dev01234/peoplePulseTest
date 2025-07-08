"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

interface DownloadButtonProps {
  data: any[];
  fileName: string;
  title: string;
}

export function DownloadButton({ data, fileName, title }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (format: string) => {
    setDownloading(format);
    
    setTimeout(() => {
      if (format === 'excel') {
        // Create CSV file using PapaParse
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `${fileName}.csv`);
      } else if (format === 'pdf') {
        // Create PDF file using jsPDF
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text(title, 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        
        // Add table
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          autoTable(doc, {
            head: [headers],
            body: data.map(row => Object.values(row).map(val => val?.toString() || "")),
            startY: 40,
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [66, 66, 66] }
          });
        }
        
        // Save PDF
        doc.save(`${fileName}.pdf`);
      }
      
      setDownloading(null);
    }, 1000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {downloading ? (
            <>
              <span className="animate-spin mr-1">⏳</span>
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download Report
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload('excel')} disabled={!!downloading}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span>CSV Format (Excel)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload('pdf')} disabled={!!downloading}>
          <FileText className="mr-2 h-4 w-4" />
          <span>PDF Format</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}