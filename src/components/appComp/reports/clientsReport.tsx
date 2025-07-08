"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "./data-table";
import { Pagination } from "./pagination";
import { ReportCard } from "./report-card";
import { DownloadButton } from "./download-button";
import { getStatusBadge } from "@/lib/status-badge";
import api from "@/lib/axiosInstance";

interface ClientData {
  project: string;
  logo: string;
  clientCode: string;
  pm: string;
  manager: string;
  rM1: string;
  region: string;
  location: string;
  projectStartDate: string;
  projectEndDate: string;
  logoStatus: string;
  projectStatus: string;
}

export function ClientReports() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchClients = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `/Reports/clients/?pageNumber=${page}&pageSize=${pageSize}`,
        { timeout: 5000 }
      );

      const data = response.data;
      setClients(Array.isArray(data) ? data : [data]);
      const receivedCount = Array.isArray(data) ? data.length : 1;
      setTotalPages(receivedCount < pageSize ? page : page + 1);

    } catch (err: any) {
      console.error("Error fetching clients:", err);

      if (err.code === "ECONNABORTED") {
        setError("Request timed out. Please try again later.");
      } else {
        setError("Failed to load clients. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchClients(currentPage);
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

  const clientColumns = [
    { key: "logo", label: "Logo Name" },
    { key: "project", label: "Project", render: (value: string) => <span className="font-medium">{value}</span> },
    { key: "pm", label: "Project Manager" },

    { key: "region", label: "Region" },
    { key: "location", label: "Location" },
    {
      key: "projectStartDate",
      label: "Start Date",
      render: (value: string) => formatDate(value)
    },
    {
      key: "projectEndDate",
      label: "End Date",
      render: (value: string) => formatDate(value)
    },
    {
      key: "projectStatus",
      label: "Status",
      render: (value: string) => (
        <Badge className={getStatusBadge(value)}>{value}</Badge>
      )
    }
  ];

  const getExportData = () => {
    return clients.map(client => ({
      "Project": client.project,
      "Logo Code": client.clientCode,
      "Project Manager": client.pm,
      "Manager": client.manager,
      "Resource Manager": client.rM1,
      "Region": client.region,
      "Location": client.location,
      "Start Date": formatDate(client.projectStartDate),
      "End Date": formatDate(client.projectEndDate),
      "Logo Status": client.logoStatus,
      "Project Status": client.projectStatus
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
        title="Client Projects"
        action={
          <DownloadButton
            data={getExportData()}
            fileName="client-projects-report"
            title="Client Projects Report"
          />
        }
      >
        <DataTable
          columns={clientColumns}
          data={clients}
          loading={loading}
          loadingMessage="Loading client projects data from API..."
          emptyMessage="No client projects found"
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
