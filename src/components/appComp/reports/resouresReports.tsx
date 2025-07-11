"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./data-table";
import { Pagination } from "./pagination";
import { ReportCard } from "./report-card";
import { DownloadButton } from "./download-button";
import api from "@/lib/axiosInstance";

interface ResourceData {
  resourceStatus: string;
  resourceCode: string;
  fullName: string;
  mobile: string;
  personalMail: string;
  projectID: string | null;
  reportingManager: string;
  supplierName: string;
  joiningDate: string;
  joiningLocation: number;
  gender: string;
  dob: string;
  officialMailingAddress: string;
  pinCode: string | null;
  state: string;
  hometownAddress: string;
  altContactNumber: string;
  emergencyContactNumber: string;
  fathersName: string;
  mothersName: string;
  overallExperience: number;
  domain: number;
  role: number;
  level: number;
  attendanceRequired: boolean;
  cwfid: string;
  officialEmailID: string;
  laptop: string | null;
  assetAssignedDate: string;
  assetModelNo: string;
  assetSerialNo: string;
  poNo: string;
  poDate: string;
  lastWorkingDate: string;
}

export function ResourceReports() {
  const [resources, setResources] = useState<ResourceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchResources = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `/Reports/resources/?pageNumber=${page}&pageSize=${pageSize}`,
        { timeout: 5000 }
      );
      const data = response.data;
      setResources(Array.isArray(data) ? data : [data]);
      const receivedCount = Array.isArray(data) ? data.length : 1;
      setTotalPages(receivedCount < pageSize ? page : page + 1);
    } catch (err: any) {
      console.error("Error fetching resources:", err);
      if (err.code === "ECONNABORTED") {
        setError("Request timed out. Please try again later.");
      } else {
        setError("Failed to load resources. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await fetchResources(currentPage);
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
    setCurrentPage(1); // Reset to first page when page size changes
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

  const resourceColumns = [
    {
      key: "resourceCode",
      label: "Resource Code",
      render: (value: string) => <span className="font-medium">{value}</span>
    },
    { key: "fullName", label: "Full Name" },
    { key: "resourceStatus", label: "Status" },
    { key: "mobile", label: "Mobile" },
    { key: "personalMail", label: "Email" },
    {
      key: "joiningDate",
      label: "Joining Date",
      render: (value: string) => formatDate(value)
    },
    { key: "gender", label: "Gender" },
    {
      key: "dob",
      label: "DOB",
      render: (value: string) => formatDate(value)
    },
    { key: "state", label: "State" }
  ];

  const getExportData = () => {
    return resources.map((resource) => ({
      "Resource Code": resource.resourceCode,
      "Full Name": resource.fullName,
      "Status": resource.resourceStatus,
      "Mobile": resource.mobile,
      "Email": resource.personalMail,
      "Joining Date": formatDate(resource.joiningDate),
      "Joining Location": resource.joiningLocation,
      "Gender": resource.gender,
      "DOB": formatDate(resource.dob),
      "State": resource.state
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
        title="Resource Reports"
        action={
          <DownloadButton
            data={getExportData()}
            fileName="resource-reports"
            title="Resource Reports"
          />
        }
      >
        <DataTable
          columns={resourceColumns}
          data={resources}
          loading={loading}
          loadingMessage="Loading resource data from API..."
          emptyMessage="No resources found"
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
