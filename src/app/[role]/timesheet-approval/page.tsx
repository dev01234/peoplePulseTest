"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import api from "@/lib/axiosInstance";
import { toast } from "sonner";
import { useUserStore } from "@/store/userStore";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Timesheet {
  resourceID: number;
  pmid: number;
  totalHours: number;
  workedHours: number;
  weekStartDate: string;
  weekEndDate: string;
  status: string;
  timesheetCode: string;
  isNotified: boolean;
  isSubmit: boolean;
  projectTimesheetDetails: any[];
  id: number;
  isActive: boolean;
}

const TimesheetApproval = () => {
  const queryClient = useQueryClient();
  const { user } = useUserStore();
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [remarks, setRemarks] = useState("");

  const { data: timesheets = [], isLoading, error } = useQuery<Timesheet[]>({
    queryKey: ["pending-timesheets"],
    queryFn: async () => {
        const response = await api.get(`/Timesheet/pm/pending-timesheets?userId=${user?.id}`);
        return response.data
    },
    enabled: !!user?.id
  });

  const handleApprove = async () => {
    if (!selectedTimesheet) return;

    try {
      const approvalData = {
        ...selectedTimesheet,
        pmRemarks: remarks,
        status:"Approved",
        approvalDate: new Date().toISOString()
      };

      await api.patch(`/Timesheet/pm/approve/`, approvalData);
      queryClient.invalidateQueries({ queryKey: ["pending-timesheets"] });
      toast.success("Timesheet approved successfully");
      setSelectedTimesheet(null);
      setRemarks("");
    } catch (error) {
      console.error("Error approving timesheet:", error);
      toast.error("Failed to approve timesheet");
    }
  };

  if (isLoading) {
    return (
      <div className="m-16 p-4 bg-white dark:bg-[#17171A]">
        <h1 className="text-2xl font-bold mb-6">Timesheet Approval</h1>
        <div className="text-center py-8">Loading timesheets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-16 p-4 bg-white dark:bg-[#17171A]">
        <h1 className="text-2xl font-bold mb-6">Timesheet Approval</h1>
        <div className="text-center py-8 text-red-500">
          Error loading timesheets. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="m-16 p-4 bg-white dark:bg-[#17171A]">
      <h1 className="text-2xl font-bold mb-6">Timesheet Approval</h1>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timesheet Code</TableHead>
              <TableHead>Week Start Date</TableHead>
              <TableHead>Week End Date</TableHead>
              <TableHead className="text-right">Total Hours</TableHead>
              <TableHead className="text-right">Worked Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(timesheets) && timesheets.length > 0 ? (
              timesheets.map((timesheet) => (
                <TableRow key={timesheet?.id}>
                  <TableCell className="font-medium">
                    {timesheet.timesheetCode}
                  </TableCell>
                  <TableCell>
                    {format(new Date(timesheet.weekStartDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(timesheet.weekEndDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">{timesheet.totalHours}</TableCell>
                  <TableCell className="text-right">{timesheet.workedHours}</TableCell>
                  <TableCell className="capitalize">{timesheet.status}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTimesheet(timesheet)}
                    >
                      Approve
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No pending timesheets found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedTimesheet} onOpenChange={() => setSelectedTimesheet(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Timesheet</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">
              Remarks
            </label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter your remarks..."
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTimesheet(null)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimesheetApproval;