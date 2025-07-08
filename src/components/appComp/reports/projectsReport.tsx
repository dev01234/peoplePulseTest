"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./data-table";
import { Pagination } from "./pagination";
import { ReportCard } from "./report-card";
import { DownloadButton } from "./download-button";
import api from "@/lib/axiosInstance";

interface ProjectData {
  clientName: string;
  projectCode: string;
  domainLevelName: string;
  domainName: string;
  domainRoleName: string;
  endDate: string;
  locationName: string;
  manager: string;
  pmName: string;
  projectName: string;
  projectStatus: string;
  regionName: string;
  rmName: string;
  startDate: string;
  totalBaseLine: number;
  totalSupplier: number;
}

export function ProjectsReports() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchProjects = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `/Reports/projects/?pageNumber=${page}&pageSize=${pageSize}`,
        { timeout: 5000 }
      );
      const { data } = response;
      setProjects(Array.isArray(data) ? data : [data]);
      const receivedCount = Array.isArray(data) ? data.length : 1;
      setTotalPages(Math.ceil(receivedCount / pageSize));
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      if (err.code === "ECONNABORTED") {
        setError("Request timed out. Please try again later.");
      } else {
        setError("Failed to load projects. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) await fetchProjects(currentPage);
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
    setCurrentPage(1);
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

  const projectColumns = [
    { key: "projectName", label: "Project Name" },
    {key: "projectCode", label: "Project Code"},
    { key: "clientName", label: "Client Name" },
    { key: "domainName", label: "Domain" },
    { key: "domainLevelName", label: "Domain Level" },
    { key: "domainRoleName", label: "Role" },
    { key: "projectStatus", label: "Status" },
    {
      key: "startDate",
      label: "Start Date",
      render: (value: string) => formatDate(value)
    },
    {
      key: "endDate",
      label: "End Date",
      render: (value: string) => formatDate(value)
    },
    { key: "locationName", label: "Location" },
    { key: "regionName", label: "Region" },
    { key: "totalBaseLine", label: "Baseline" },
    { key: "totalSupplier", label: "Suppliers" }
  ];

  const getExportData = () => {
    return projects.map((project) => ({
      "Project Name": project.projectName,
      "Project Code":project.projectCode,
      "Client Name": project.clientName,
      "Domain": project.domainName,
      "Domain Level": project.domainLevelName,
      "Role": project.domainRoleName,
      "Status": project.projectStatus,
      "Start Date": formatDate(project.startDate),
      "End Date": formatDate(project.endDate),
      "Location": project.locationName,
      "Region": project.regionName,
      "Baseline": project.totalBaseLine,
      "Suppliers": project.totalSupplier
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
        title="Project Reports"
        action={
          <DownloadButton
            data={getExportData()}
            fileName="project-reports"
            title="Project Reports"
          />
        }
      >
        <DataTable
          columns={projectColumns}
          data={projects}
          loading={loading}
          loadingMessage="Loading project data from API..."
          emptyMessage="No projects found"
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