'use client'
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import AdminSearchUserInput from "../search-input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCheck, CheckCircle, ChevronLeft, ChevronRight, Clock, Eye, Info, MessageSquare, Pencil, Trash2, X, XCircle } from "lucide-react";
import TooltipWrapper from "../../tooltip-swrpper";
import { cn } from "@/lib/utils";
import { Skeleton } from "../../ui/skeleton";
import { ResourceApi, ResourceType } from "@/services/api/resource";
import api from "@/lib/axiosInstance";
import { useUserStore } from "@/store/userStore";
import CommentDialog from "./comment-dialog";
import ViewCommentDialog from "./view-comment-dialog";
import { toast } from "sonner";
import { getResourceStatusLabel } from "@/utils/resourceStatus";
import { on } from "events";


const AdminTableResource = () => {
    const router = useRouter();
    const { user } = useUserStore();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [resources, setResources] = useState<ResourceType[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Dialog state
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        resourceId: string;
        actionType: 'reject' | 'accept' | 'review' | 'onboarding';
        title: string;
        description: string;
    }>({
        isOpen: false,
        resourceId: '',
        actionType: 'reject',
        title: '',
        description: ''
    });

    // View comment dialog state
    const [viewCommentDialog, setViewCommentDialog] = useState<{
        isOpen: boolean;
        comment: string;
        resourceCode: string;
    }>({
        isOpen: false,
        comment: '',
        resourceCode: ''
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchResources(user?.id, currentPage, pageSize, statusFilter, searchTerm);
        }, 300); // Debounce search for 300ms

        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, pageSize, statusFilter, searchTerm, user?.id]);

    const fetchResources = async (userId = 0, page = 1, size = 5, status = "", search = "") => {
        setIsLoading(true);
        try {
            let url = `/Resource?pageNumber=${page}&pageSize=${size}&searchText=${search}&userId=${userId}`;
            if (status) {
                url += `&status=${status}`;
            }
            const response = await api.get(url);
            const result = await response.data;

            setResources(result.items);
            setTotalCount(result.totalCount);
            setTotalPages(result.totalPages);
            setCurrentPage(result.currentPage);
            setHasNext(result.hasNext);
            setHasPrevious(result.hasPrevious);
        } catch (error) {
            console.error("Error fetching resources:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (id: string) => {
        router.push(`/admin/manage-resource/edit-resource/${id}`);
    };

    const handleDeactivateResource = async (id: string) => {
        try {
            await ResourceApi.deactivateResources(id);
            fetchResources(user?.id, currentPage, pageSize, statusFilter, searchTerm);
        } catch (error) {
            console.error("Error deactivating resource:", error);
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

    const handleStatusFilterChange = (value: string) => {
        setCurrentPage(1);
        setStatusFilter(value);
    };

    const handleClearFilter = () => {
        setCurrentPage(1);
        setStatusFilter("");
    };

    const openDialog = (resourceId: string, actionType: 'reject' | 'accept' | 'review' | 'onboarding') => {
        const titles = {
            reject: 'Reject Resource',
            accept: 'Accept Resource',
            review: 'Add Review',
            onboarding: 'Accept Onboarding'
        };

        const descriptions = {
            reject: 'Please provide a reason for rejecting this resource.',
            accept: 'Please add any comments for accepting this resource.',
            review: 'Please add your review for this resource.',
            onboarding: 'Please add any comments for accepting the onboarding of this resource.'
        };

        setDialogState({
            isOpen: true,
            resourceId,
            actionType,
            title: titles[actionType],
            description: descriptions[actionType]
        });
    };

    const closeDialog = () => {
        setDialogState(prev => ({ ...prev, isOpen: false }));
    };

    const openViewCommentDialog = (comment: string, resourceCode: string) => {
        setViewCommentDialog({
            isOpen: true,
            comment,
            resourceCode
        });
    };

    const closeViewCommentDialog = () => {
        setViewCommentDialog(prev => ({ ...prev, isOpen: false }));
    };


    const handleDialogSubmit = async (PmComment: string) => {
        const { resourceId, actionType } = dialogState;

        try {
            switch (actionType) {
                case 'reject':
                    await ResourceApi.rejectResource(resourceId, PmComment);
                    toast.success('Resource rejected successfully');
                    break;
                case 'accept':
                    await ResourceApi.acceptResource(resourceId, PmComment);
                    toast.success('Resource accepted successfully');
                    break;
                case 'review':
                    await ResourceApi.addReview(resourceId, PmComment);
                    toast.success('Review added successfully');
                    break;
                case 'onboarding':
                    await ResourceApi.acceptResourceOnboarding(resourceId, PmComment);
                    toast.success('Onboarding accepted successfully');
                    break;
            }

            // Refresh the table data
            fetchResources(user?.id, currentPage, pageSize, statusFilter, searchTerm);
        } catch (error) {
            console.error(`Error ${actionType}ing resource:`, error);
            toast.error(`Failed to ${actionType} resource`);
            throw error; // Re-throw to handle in dialog
        }
    };

    return (
        <>
            <div className="rounded-lg overflow-hidden h-auto bg-white dark:bg-gray-900 pb-8 shadow-bottom">
                {/* Header Section */}
                <div className="p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                        Resource Approval
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
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <AdminSearchUserInput onSearch={handleSearch} />
                        <div className="flex items-center gap-2">
                            <ToggleGroup
                                type="single"
                                value={statusFilter}
                                variant="outline"
                                className="gap-0"
                                onValueChange={handleStatusFilterChange}
                            >
                                <TooltipWrapper content="Pending">
                                    <ToggleGroupItem value="0" aria-label="Pending" className="p-2">
                                        <Clock className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipWrapper>
                                <TooltipWrapper content="Under Review">
                                    <ToggleGroupItem value="1" aria-label="Under Review" className="p-2">
                                        <Eye className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipWrapper>
                                <TooltipWrapper content="Accepted">
                                    <ToggleGroupItem value="2" aria-label="Accepted" className="p-2">
                                        <CheckCircle className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipWrapper>
                                <TooltipWrapper content="Rejected">
                                    <ToggleGroupItem value="3" aria-label="Rejected" className="p-2">
                                        <XCircle className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipWrapper>
                            </ToggleGroup>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearFilter}
                                className="text-xs"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="relative overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader className="sticky top-0 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur z-10">
                            <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-transparent">
                                <TableHead>Code</TableHead>
                                <TableHead>First Name</TableHead>
                                <TableHead>Last Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
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
                                                <Skeleton className="h-4 w-32" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-24" />
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
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                            ) : resources.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-12 text-gray-500 dark:text-gray-400"
                                    >
                                        No resources found matching your criteria
                                    </TableCell>
                                </TableRow>
                            ) : (
                                resources.map((row, index) => (
                                    <TableRow
                                        key={row.id}
                                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <TableCell>{row.resourceCode}</TableCell>
                                        <TableCell>{row.firstName}</TableCell>
                                        <TableCell>{row.lastName}</TableCell>
                                        <TableCell>{row.emailID}</TableCell>
                                        <TableCell>{row.mobileNumber}</TableCell>
                                        <TableCell>
                                            {getResourceStatusLabel(row.status)}
                                        </TableCell>
                                        <TableCell className="text-right flex gap-2 justify-end">
                                            {row.status === 1 && (<>
                                                <TooltipWrapper content="Reject Resource">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => openDialog(row.id, 'reject')}
                                                        className="bg-red-50 text-red-600 dark:bg-red-900/20 hover:bg-red-100/50 dark:text-red-400 dark:hover:bg-red-900/30"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipWrapper>
                                                <TooltipWrapper content="Accept Resource">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="bg-green-50 text-green-600 dark:bg-green-900/20 hover:bg-green-100/50 dark:text-green-400 dark:hover:bg-green-900/30"
                                                        onClick={() => openDialog(row.id, 'accept')}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                </TooltipWrapper>
                                                <TooltipWrapper content="Add Review">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                                        onClick={() => openDialog(row.id, 'review')}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </TooltipWrapper>
                                            </>
                                            )}

                                            {row.isProfileInfoAdded === true && row.status !== 2 && (<>
                                                <TooltipWrapper content="View Info">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                                        onClick={() => router.push(`/admin/resource-information/${row.id}`)}
                                                    >
                                                        <Info className="h-4 w-4" />
                                                    </Button>
                                                </TooltipWrapper>
                                                <TooltipWrapper content="Accept onboarding">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                                        onClick={() => openDialog(row.id, 'onboarding')}
                                                    >
                                                        <CheckCheck className="h-4 w-4" />
                                                    </Button>
                                                </TooltipWrapper>
                                            </>)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                {resources.length > 0 && (
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

            <CommentDialog
                isOpen={dialogState.isOpen}
                onClose={closeDialog}
                onSubmit={handleDialogSubmit}
                title={dialogState.title}
                description={dialogState.description}
                actionType={dialogState.actionType}
            />
        </>
    );
};

export default AdminTableResource;