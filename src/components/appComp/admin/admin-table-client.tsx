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
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import TooltipWrapper from "../../tooltip-swrpper";
import { cn } from "@/lib/utils";
import { Skeleton } from "../../ui/skeleton";
import { format } from "date-fns";
import { ClientApi, ClientRow } from "@/services/api/client";
import api from "@/lib/axiosInstance";

const AdminTableClient = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showActiveClients, setShowActiveClients] = useState<boolean>(true);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchClients(currentPage, pageSize, showActiveClients, searchTerm);
    }, 300); // Debounce search for 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, pageSize, showActiveClients, searchTerm]);

  const fetchClients = async (page = 1, size = 5, status = true, search = "") => {
    setIsLoading(true);
    try {
      const response = await api.get(`/client?pageNumber=${page}&pageSize=${size}&isActive=${status}&searchText=${search}`);
      const result = await response.data;

      setClients(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
      setHasNext(result.hasNext);
      setHasPrevious(result.hasPrevious);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/manage-client/edit-client/${id}`);
  };

  const handleDeactivateClient = async (id: number) => {
    try {
      await ClientApi.deactivateClients(id);
      fetchClients(currentPage, pageSize, showActiveClients, searchTerm);
    } catch (error) {
      console.error("Error deactivating client:", error);
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
    setShowActiveClients((prev) => !prev);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="rounded-lg overflow-hidden h-auto bg-white dark:bg-gray-900 pb-8 shadow-bottom">
      {/* Header Section */}
      <div className="p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Client Management
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
              {showActiveClients ? "Showing Active" : "Showing Inactive"}
            </span>
            <Switch
              checked={showActiveClients}
              onCheckedChange={handleStatusChange}
              className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="relative overflow-x-auto">
        <Table className="min-w-[1200px] lg:min-w-0">
          <TableHeader className="sticky top-0 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur z-10">
            <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-transparent">
              <TableHead className="w-12">Code</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Notes</TableHead>
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
                    {Array(10)
                      .fill(0)
                      .map((_, i) => (
                        <TableCell key={i}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                  </TableRow>
                ))
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-12 text-gray-500 dark:text-gray-400"
                >
                  No clients found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              clients.map((row: ClientRow, index) => (
                <TableRow
                  key={row.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >

                  <TableCell>{row.clientCode}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{formatDate(row.startDate)}</TableCell>
                  <TableCell>{formatDate(row.endDate)}</TableCell>
                  <TableCell>{row.locationName}</TableCell>
                  <TableCell className="max-w-96">
                    <div className="flex flex-col">
                      <span>{row.address}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {row.stateName}, {row.regionName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {row.notes}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex px-3 py-1 rounded-full text-xs font-medium",
                        row.isActive
                          ? "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      )}
                    >
                      {row.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <TooltipWrapper content="Deactivate client">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeactivateClient(row.id)}
                          className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                          disabled={!row.isActive}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipWrapper>
                      <TooltipWrapper content="Edit client">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                          onClick={() => handleEdit(row.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipWrapper>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {clients.length > 0 && (
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

export default AdminTableClient;