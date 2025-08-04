"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
} from "@/data/mock";
import { format, parseISO } from "date-fns";
import { CalendarRange, Clock, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Leave, LeaveApi } from "@/services/api/leaves";
import { dropdownApi } from "@/services/api/dropdown";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/store/userStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function LeavesPage() {
  const queryClient = useQueryClient();
  const { user } = useUserStore()
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isMultiDay, setIsMultiDay] = useState("single");
  // Effect to sync end date with start date for single-day selection
  useEffect(() => {
    if (isMultiDay === "single" && startDate) {
      setEndDate(startDate);
    }
  }, [startDate, isMultiDay]);



  const applyLeave = useMutation({
    mutationFn: LeaveApi.applyLeave,
    onSuccess: () => {
      toast.success("Leave application submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["leavesrequest"] })
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedLeaveType("");
      setReason("");
    },
  });

  const handleApplyLeave = async () => {
    if (!startDate || !endDate || !selectedLeaveType || !reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    const applyNewLeave = {
      resourceID: Number(user.resourceID), // resourceid needs to change with logged in user id
      leaveTypeID: selectedLeaveType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      statusID: 1,
      status: "pending",
      reason: reason,
      resourceName: "reason",
      leaveTypeName: "",
      approverName: "reason",
      approverID: 0,
      created_Date: new Date().toISOString(),
    };

    applyLeave.mutate(applyNewLeave);
  };
  const { data: leaveRequests = [], isLoading } = useQuery({
    queryKey: ["leavesrequest"],
    queryFn: () => LeaveApi.fetchResourceLeaveRequests(user?.resourceID),
    enabled: !!user?.resourceID
  });

  const { data: leaveTypes = [] } = useQuery({
    queryKey: ["leaveTypes"],
    queryFn: dropdownApi.fetchLeaveTypes,
  });

  const { data: leaveBalance = [], isLoading: isLeaveBalanceLoading, error: leaveBalanceError } = useQuery({
    queryKey: ["leaveBalance", user?.resourceID],
    queryFn: () => LeaveApi.fetchLeaveBalance(user?.resourceID),
    enabled: !!user?.resourceID,
    retry: 3,
    retryDelay: 1000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Leave Management</h1>
          <CalendarRange className="w-8 h-8 text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Apply for Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Leave Type</label>
                  <Select
                    value={selectedLeaveType}
                    onValueChange={setSelectedLeaveType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <RadioGroup
                    value={isMultiDay}
                    onValueChange={setIsMultiDay}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single">Single Day</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multiple" id="multiple" />
                      <Label htmlFor="multiple">Multiple Days</Label>
                    </div>
                  </RadioGroup>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Date</label>
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          setStartDate(date);
                          if (isMultiDay === "single") {
                            setEndDate(date);
                          }
                        }}
                        className="rounded-md border"
                      />
                    </div>

                    {isMultiDay === "multiple" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          className="rounded-md border"
                          disabled={(date) => startDate ? date < startDate : false}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason</label>
                  <Textarea
                    placeholder="Enter reason for leave"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleApplyLeave}
                  disabled={!startDate || !endDate || !selectedLeaveType || !reason}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Apply for Leave
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Balance</CardTitle>
              </CardHeader>
              <CardContent>
                {leaveBalanceError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load leave balance. Please try again later.
                    </AlertDescription>
                  </Alert>
                ) : isLeaveBalanceLoading ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50 animate-pulse">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : leaveBalance.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No leave balance data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaveBalance.map((balance) => (
                      <div
                        key={balance.leaveTypeID}
                        className="p-4 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{balance.leaveTypeName}</h3>
                          <Badge variant="secondary">
                            {balance.leaveTypeName.split(' ').map(word => word[0]).join('')}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-medium">{balance.total}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Used</p>
                            <p className="font-medium">{balance.used}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Available</p>
                            <p className="font-medium">
                              {balance.total - balance.used}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leave Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pending">
                    <div className="space-y-4">
                      {leaveRequests.filter(
                        (request: Leave) =>
                          request?.status?.toLowerCase?.() === "pending"
                      ).length === 0 ? (
                        <p>No pending leave requests.</p>
                      ) : (
                        leaveRequests
                          .filter(
                            (request: Leave) =>
                              request?.status?.toLowerCase?.() === "pending"
                          )
                          .map((request: Leave) => (
                            <div
                              key={request.id}
                              className="p-4 rounded-lg bg-muted/50"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary">
                                  {request?.remarks}
                                </Badge>
                                <Badge
                                  className={getStatusColor(request.status)}
                                >
                                  {request.status}
                                </Badge>
                              </div>
                              <p className="text-sm mb-1">
                                {format(parseISO(request.startDate), "PPP")} -{" "}
                                {format(parseISO(request.endDate), "PPP")}
                              </p>
                              <p>{request.reason}</p>
                              <p>{request.leaveTypeName}</p>
                            </div>
                          ))
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="history">
                    <div className="space-y-4">
                      {leaveRequests.filter(
                        (request: Leave) =>
                          request?.status?.toLowerCase?.() !== "pending"
                      ).length === 0 ? (
                        <p>No history.</p>
                      ) : (
                        leaveRequests
                          .filter(
                            (request: Leave) =>
                              request?.status?.toLowerCase?.() !== "pending"
                          )
                          .map((request: Leave) => (
                            <div
                              key={request.id}
                              className="p-4 rounded-lg bg-muted/50"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary">
                                  {request?.remarks}
                                </Badge>
                                <Badge
                                  className={getStatusColor(request.status)}
                                >
                                  {request.status}
                                </Badge>
                              </div>
                              <p className="text-sm mb-1">
                                {format(parseISO(request.startDate), "PPP")} -{" "}
                                {format(parseISO(request.endDate), "PPP")}
                              </p>
                              <p>{request.reason}</p>
                              <p>{request.leaveTypeName}</p>
                            </div>
                          ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}