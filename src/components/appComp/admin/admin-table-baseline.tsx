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
import { Pencil, Trash2 } from "lucide-react";
import TooltipWrapper from "../../tooltip-swrpper";
import { cn } from "@/lib/utils";
import { Skeleton } from "../../ui/skeleton";
import { BaselineApi, BaselineRow } from "@/services/api/baseline";
import api from "@/lib/axiosInstance";

const AdminTableBaseline = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showActiveBaselines, setShowActiveBaselines] = useState<boolean>(true);
  const [baselines, setBaselines] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBaselines(currentPage, pageSize, showActiveBaselines, searchTerm);
    }, 300); // Debounce search for 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, pageSize, showActiveBaselines, searchTerm]);

  const fetchBaselines = async (page = 1, size = 5, status = true, search = "") => {
    setIsLoading(true);
    try {
      const response = await api.get(`/ProjectBaseline?pageNumber=${page}&pageSize=${size}&isActive=${status}&searchText=${search}`);
      const result = await response.data;
      setBaselines(result.items);
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

  // const { data: baselines = [] } = useQuery<BaselineRow[]>({
  //   queryKey: ["baselines"],
  //   queryFn: BaselineApi.fetchBaselines,
  // });

  const deactivateBaseline = useMutation({
    mutationFn: BaselineApi.deactivateBaseline,
    onSuccess: () => {
      // Instead of invalidating query, directly refetch baselines
      fetchBaselines(currentPage, pageSize, showActiveBaselines, searchTerm);
    },
  });

  const handleEdit = (id: number) => {
    router.push(`/admin/manage-baseline/edit-baseline/${id}`);
  };

  const handleDeleteBaseline = (id: number) => {
    deactivateBaseline.mutate(id);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // reset to page 1
  };

  return (
    <div className="rounded-lg overflow-hidden h-auto bg-white dark:bg-gray-900 pb-8 shadow-bottom">
      {/* Header Section */}
      <div className="p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Baseline Management
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Show</span>
          <select
            className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            <option>5</option>
            <option>10</option>
            <option>20</option>
          </select>
          <span className="text-sm text-gray-500 dark:text-gray-400">entries</span>
        </div>

        <div className="w-full sm:w-auto flex flex-col-reverse sm:flex-row gap-4 items-start sm:items-center">
          <AdminSearchUserInput onSearch={setSearchTerm} />
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {showActiveBaselines ? "Showing Active" : "Showing Inactive"}
            </span>
            <Switch
              checked={showActiveBaselines}
              onCheckedChange={() => setShowActiveBaselines((prev) => !prev)}
              className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="relative overflow-x-auto">
        <Table className="min-w-[1400px] lg:min-w-0">
          <TableHeader className="sticky top-0 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur z-10">
            <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-transparent">
              <TableHead className="w-12 text-gray-500 dark:text-gray-400 font-medium">
                S.No.
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400 font-medium">
                Logo
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400 font-medium">
                Project
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400 font-medium">
                Type
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400 font-medium">
                Domain
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400 font-medium">
                Role
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400 font-medium">
                Level
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400 font-medium">
                Baseline
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400 font-medium">
                Role as per client
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400 font-medium">
                Notes
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400 font-medium">
                Status
              </TableHead>
              <TableHead className="text-right text-gray-500 dark:text-gray-400 font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <TableRow
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    {Array(12)
                      .fill(0)
                      .map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                      ))}
                  </TableRow>
                ))
            ) : baselines.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="text-center py-12 text-gray-500 dark:text-gray-400"
                >
                  No baselines found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              baselines.map((row: BaselineRow, index) => (
                <TableRow
                  key={row.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <TableCell className="font-medium text-gray-600 dark:text-gray-300">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-gray-800 dark:text-gray-200 font-medium">
                    {row.logoName}
                  </TableCell>
                  <TableCell className="text-gray-800 dark:text-gray-200">
                    {row.projectName}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {row.type}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {row.domainName}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {row.roleName}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {row.levelName}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {row.baseline}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {row.domainNameAsPerCustomer}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                    {row.notes}
                  </TableCell>
                  <TableCell className="shadow-right dark:shadow-dark-right">
                    <span
                      className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
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
                      <TooltipWrapper content="Deactivate baseline">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteBaseline(row.id)}
                          className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                          disabled={!row.isActive}
                        >
                          <Trash2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                      </TooltipWrapper>
                      <TooltipWrapper content="Edit baseline">
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
    </div>
  );
};

export default AdminTableBaseline;
