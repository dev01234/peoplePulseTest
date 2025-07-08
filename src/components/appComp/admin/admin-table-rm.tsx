"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../../ui/button";
import AdminSearchUserInput from "../search-input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import TooltipWrapper from "../../tooltip-swrpper";
import { cn } from "@/lib/utils";
import { Skeleton } from "../../ui/skeleton";
import { RManagerApi, RManagerRow } from "@/services/api/rmanager";
import { useUserStore } from "@/store/userStore";
import api from "@/lib/axiosInstance";

const AdminTableRManager = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUserStore();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showActiveRManagers, setShowActiveRManagers] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRManagers(user?.id, currentPage, pageSize, showActiveRManagers, searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, pageSize, showActiveRManagers, searchTerm, user?.id]);

  const fetchRManagers = async (userId = 0, page = 1, size = 5, status = true, search = "") => {
    try {
      const response = await api.get(
        `/RM?pageNumber=${page}&pageSize=${size}&isActive=${status}&searchText=${search}&userId=${userId}`
      );
      const result = await response.data;

      return {
        items: result.items,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        hasNext: result.hasNext,
        hasPrevious: result.hasPrevious,
      };
    } catch (error) {
      console.error("Error fetching RManagers:", error);
      return {
        items: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        hasNext: false,
        hasPrevious: false,
      };
    }
  };

  const { data: rmsData, isLoading } = useQuery({
    queryKey: ["rms", currentPage, pageSize, showActiveRManagers, searchTerm],
    queryFn: () => fetchRManagers(user?.id, currentPage, pageSize, showActiveRManagers, searchTerm),
  });

  const deactivateRManager = useMutation({
    mutationFn: RManagerApi.deactivateRManager,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rms"] });
    },
  });

  const handleEdit = (id: number) => {
    router.push(`/admin/manage-rms/edit-rm/${id}`);
  };

  const handleDeactivateRManager = (id: number) => {
    deactivateRManager.mutate(id);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = () => {
    setCurrentPage(1);
    setShowActiveRManagers((prev) => !prev);
  };

  return (
    <div className="rounded-lg overflow-hidden h-auto bg-white dark:bg-gray-900 pb-8 shadow-bottom">
      {/* Header Section */}
      <div className="p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Reporting Manager Management
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Show</span>
          <select
            className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span className="text-sm text-gray-500 dark:text-gray-400">entries</span>
        </div>
        <div className="w-full sm:w-auto flex flex-col-reverse sm:flex-row gap-4 items-start sm:items-center">
          <AdminSearchUserInput onSearch={handleSearch} />
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {showActiveRManagers ? "Showing Active" : "Showing Inactive"}
            </span>
            <Switch
              checked={showActiveRManagers}
              onCheckedChange={handleStatusChange}
              className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="relative overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="sticky top-0 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur z-10">
            <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-transparent">
              <TableHead>S.No.</TableHead>
              <TableHead>RM Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Project Manager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(pageSize)
                .fill(0)
                .map((_, index) => (
                  <TableRow
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <TableCell>
                      <Skeleton className="h-4 w-6" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))
            ) : rmsData?.items?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-gray-500 dark:text-gray-400"
                >
                  No reporting managers found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              rmsData?.items?.map((row: RManagerRow, index: number) => (
                <TableRow
                  key={row.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>{row.rmCode}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.projectManagerName || "-"}</TableCell>
                  <TableCell className="shadow-right dark:shadow-dark-right">
                    <span
                      className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                        row.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      )}
                    >
                      {row.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right flex gap-2 justify-end">
                    <TooltipWrapper content="Deactivate RM">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeactivateRManager(row.id)}
                        className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        disabled={!row.isActive}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipWrapper>
                    <TooltipWrapper content="Edit RM">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        onClick={() => handleEdit(row.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipWrapper>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {rmsData?.items?.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, rmsData?.totalCount || 0)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{rmsData?.totalCount || 0}</span>{" "}
                results
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!rmsData?.hasPrevious}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!rmsData?.hasNext}
                variant="outline"
                size="sm"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTableRManager;