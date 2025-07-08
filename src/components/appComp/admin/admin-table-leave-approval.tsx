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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Check, Pencil, Trash2, X } from "lucide-react";
import TooltipWrapper from "../../tooltip-swrpper";
import { cn } from "@/lib/utils";
import { Skeleton } from "../../ui/skeleton";
import { PManagerApi, PManagerRow } from "@/services/api/pmanager";
import { dropdownApi } from "@/services/api/dropdown";
import { Leave, LeaveApi } from "@/services/api/leaves";
import { useUserStore } from "@/store/userStore";
import api from "@/lib/axiosInstance";
import { toast } from "sonner";

const AdminTablePendingleaves = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [entriesPerPage, setEntriesPerPage] = useState<number>(5);
    const { user } = useUserStore();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedRow, setEditedRow] = useState<Partial<Leave>>({});

    const { data: pendingApprovals = [], isLoading } = useQuery<Leave[]>({
        queryKey: ["pendingApprovals"],
        queryFn: () => LeaveApi.fetchPendingApprovals(user?.roleId, user.pmID, user.rmID),
        enabled: !!user?.roleId
    });

    const { data: approveStatuses = [] } = useQuery<PManagerRow[]>({
        queryKey: ["approveStatuses"],
        queryFn: dropdownApi.fetchStatuses,
    });

    const filteredData = pendingApprovals.filter((row) => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesSearch =
            (row.resourceName ?? "").toLowerCase().includes(lowerSearchTerm)
        return matchesSearch;
    });

    const handleSave = async (item: Leave) => {
        if (!item.statusID) return;

        try {
            await api.put(`/Leave/approval/${item.id}/${user?.id}`, {
                id: item.id,
                statusID: editedRow.statusID,
                remarks: editedRow.remarks
            });

            toast.success('Item updated successfully');
            setEditingId(null);
            setEditedRow(null);
            queryClient.invalidateQueries({ queryKey: ["pendingApprovals"] });
        } catch (error) {
            console.error('Error updating item:', error);
            toast.error('Failed to update item. Please try again.');
        }
    };

    const handleInputChange = (key: keyof Leave, value: string | boolean) => {
        setEditedRow((prev) => ({
          ...prev,
          [key]: value,
        }));
      };
    

    const startEditing = (item: Leave) => {
        setEditingId(Number(item.id));
    };

    const cancelEditing = () => {
        setEditingId(null);
    };
    return (
        <div className="rounded-lg overflow-hidden h-auto bg-white dark:bg-gray-900 pb-8 shadow-bottom">
            {/* Header Section */}
            <div className="p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Approve Leaves
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Show</span>
                    <select
                        className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        value={entriesPerPage}
                        onChange={(e) => setEntriesPerPage(Number(e.target.value))}
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
                            <TableHead className="w-12 text-gray-500 dark:text-gray-400">
                                Resource Name
                            </TableHead>
                            <TableHead className="text-gray-500 dark:text-gray-400">
                                Leave Type
                            </TableHead>
                            <TableHead className="text-gray-500 dark:text-gray-400 font-medium">
                                Start Date
                            </TableHead>
                            <TableHead className="text-gray-500 dark:text-gray-400 font-medium">
                                End Date
                            </TableHead>
                            <TableHead className="text-gray-500 dark:text-gray-400 font-medium">
                                Approver Name
                            </TableHead>
                            <TableHead className="text-gray-500 dark:text-gray-400 font-medium">
                                Reason
                            </TableHead>
                            <TableHead className="text-gray-500 dark:text-gray-400 font-medium">
                                Status
                            </TableHead>
                            <TableHead className="text-gray-500 dark:text-gray-400 font-medium">
                                Remarks
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
                        ) : filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={12}
                                    className="text-center py-12 text-gray-500 dark:text-gray-400"
                                >
                                    No project managers found matching your criteria
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.slice(0, entriesPerPage).map((row: Leave, index) => (
                                <TableRow
                                    key={row.id}
                                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <TableCell className="font-medium text-gray-600 dark:text-gray-300">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="text-gray-800 dark:text-gray-200">
                                        {row.resourceName}
                                    </TableCell>
                                    <TableCell className="text-gray-800 dark:text-gray-200">
                                        {row.leaveTypeName}
                                    </TableCell>
                                    <TableCell className="text-gray-800 dark:text-gray-200">
                                        {row.startDate}
                                    </TableCell>
                                    <TableCell className="text-gray-800 dark:text-gray-200">
                                        {row.endDate}
                                    </TableCell>
                                    <TableCell className="text-gray-800 dark:text-gray-200">
                                        {row.approverName ?? ""}
                                    </TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-400">
                                        {row.reason ?? ""}
                                    </TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-400">
                                        {editingId === Number(row.id) ? (
                                            <select
                                                value={editedRow?.statusID || ""}
                                                onChange={(e) => handleInputChange("statusID", e.target.value)}
                                                className="border rounded px-2 py-1"
                                            >
                                                <option value="" disabled>
                                                    Select Status
                                                </option>
                                                {approveStatuses.map((status) => (
                                                    <option key={status.id} value={status.id}>
                                                        {status.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            row.status || ""
                                        )}
                                    </TableCell>
                                    <TableCell className="shadow-right dark:shadow-dark-right">
                                        {editingId === Number(row.id) ? (
                                            <input
                                                type="text"
                                                value={editedRow?.remarks || ""}
                                                onChange={(e) => handleInputChange("remarks", e.target.value)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        ) : (
                                            row.remarks || ""
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === Number(row.id) ? (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleSave(row)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Check className="h-4 w-4 text-green-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={cancelEditing}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <X className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => startEditing(row)}
                                            >
                                                Edit
                                            </Button>
                                        )}
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

export default AdminTablePendingleaves;
