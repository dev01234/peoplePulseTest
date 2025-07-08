"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../../ui/button";
import AdminSearchUserInput from "../search-input";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import TooltipWrapper from "../../tooltip-swrpper";
import { cn } from "@/lib/utils";
import { Skeleton } from "../../ui/skeleton";
import { ProjectApi, ProjectType } from "@/services/api/projects";
import api from "@/lib/axiosInstance";

const AdminTableProject = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showActiveProjects, setShowActiveProjects] = useState<boolean>(true);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProjects(currentPage, pageSize, showActiveProjects, searchTerm);
    }, 300); // Debounce search for 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, pageSize, showActiveProjects, searchTerm]);

  const fetchProjects = async (page = 1, size = 5, status = true, search = "") => {
    setIsLoading(true);
    try {
      const response = await api.get(`/project?pageNumber=${page}&pageSize=${size}&isActive=${status}&searchText=${search}`);
      const result = await response.data;

      setProjects(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
      setHasNext(result.hasNext);
      setHasPrevious(result.hasPrevious);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/manage-project/edit-project/${id}`);
  };

  const handleDeactivateProject = async (id: number) => {
    try {
      await ProjectApi.deactivateProjects(id);
      fetchProjects(currentPage, pageSize, showActiveProjects, searchTerm);
    } catch (error) {
      console.error("Error deactivating project:", error);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // reset to page 1
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusChange = () => {
    setCurrentPage(1);
    setShowActiveProjects((prev) => !prev);
  };

  return (
    <div className="rounded-lg overflow-hidden h-auto bg-white dark:bg-gray-900 pb-8 shadow-bottom">
      {/* Header Section */}
      <div className="p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Project Management
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
              {showActiveProjects ? "Showing Active" : "Showing Inactive"}
            </span>
            <Switch
              checked={showActiveProjects}
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
              <TableHead className="w-10">Code</TableHead>
              <TableHead>Project Name</TableHead>
              <TableHead>Client Code</TableHead>
              <TableHead>Starting Date</TableHead>
              <TableHead>Ending Date</TableHead>
              <TableHead>Project Manager</TableHead>
              <TableHead>Relationship Manager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
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
                      <Skeleton className="h-4 w-10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-12 text-gray-500 dark:text-gray-400"
                >
                  No projects found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              projects.map((row, index) => (
                <TableRow
                  key={row.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <TableCell>{row.projectCode}</TableCell>
                  <TableCell>{row.name || "N/A"}</TableCell>
                  <TableCell>{row.clientCode}</TableCell>
                  <TableCell>
                    {format(new Date(row.startDate), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(row.endDate), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{row.pmName}</TableCell>
                  <TableCell>{row.rmName}</TableCell>
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
                    <TooltipWrapper content="Deactivate Project">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeactivateProject(row.id)}
                        disabled={!row.isActive}
                        className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipWrapper>
                    <TooltipWrapper content="Edit Project">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(row.id)}
                        className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:bg-blue-900/30"
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
      {projects.length > 0 && (
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
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{totalCount}</span>{" "}
                results
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrevious}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNext}
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

export default AdminTableProject;