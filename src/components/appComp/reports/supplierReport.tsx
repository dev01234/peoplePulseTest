"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./data-table";
import { Pagination } from "./pagination";
import { ReportCard } from "./report-card";
import { DownloadButton } from "./download-button";
import api from "@/lib/axiosInstance";

interface SupplierData {
  supplierName: string;
  supplierID: string;
  sidDate: string;
  address: string;
  state: string | null;
  gstid: string;
  panid: string;
  tanid: string;
  client: string | null;
  project: string | null;
  region: string | null;
  totalDeployment: number | null;
  projectManager: string | null;
  rm: string | null;
}

export function SupplierReports() {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchSuppliers = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `/Reports/suppliers/?pageNumber=${page}&pageSize=${pageSize}`,
        { timeout: 5000 }
      );
      const data = response.data;
      setSuppliers(Array.isArray(data) ? data : [data]);
      const receivedCount = Array.isArray(data) ? data.length : 1;
      setTotalPages(receivedCount < pageSize ? page : page + 1);
    } catch (err: any) {
      console.error("Error fetching suppliers:", err);

      if (err.code === "ECONNABORTED") {
        setError("Request timed out. Please try again later.");
      } else {
        setError("Failed to load suppliers. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await fetchSuppliers(currentPage);
      }
    };
    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (e) {
      return dateString;
    }
  };

  const supplierColumns = [
    {
      key: "supplierName",
      label: "Supplier Name",
      render: (value: string) => <span className="font-medium">{value}</span>
    },
    { key: "supplierID", label: "Supplier ID" },
    {
      key: "sidDate",
      label: "Date",
      render: (value: string) => formatDate(value)
    },
    { key: "address", label: "Address" },
    { key: "state", label: "State" },
    { key: "gstid", label: "GST ID" },
    { key: "panid", label: "PAN ID" },
    { key: "tanid", label: "TAN ID" }
  ];

  const getExportData = () => {
    return suppliers.map((supplier) => ({
      "Supplier Name": supplier.supplierName,
      "Supplier ID": supplier.supplierID,
      "Date": formatDate(supplier.sidDate),
      "Address": supplier.address,
      "State": supplier.state,
      "GST ID": supplier.gstid,
      "PAN ID": supplier.panid,
      "TAN ID": supplier.tanid
    }));
  };

  return (
    <>
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <ReportCard
        title="Supplier Reports"
        action={
          <DownloadButton
            data={getExportData()}
            fileName="supplier-reports"
            title="Supplier Reports"
          />
        }
      >
        <DataTable
          columns={supplierColumns}
          data={suppliers}
          loading={loading}
          loadingMessage="Loading supplier data from API..."
          emptyMessage="No suppliers found"
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[5, 10, 25, 50]}
        />
      </ReportCard>
    </>
  );
}
