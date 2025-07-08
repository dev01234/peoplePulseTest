import api from "@/lib/axiosInstance";

export interface Leave {
  id?: string;
  resourceID: number;      // The ID of the user applying for leave
  resourceName: string;      // The ID of the user applying for leave
  leaveTypeID: string;       // For example: "sick", "vacation", etc.
  leaveTypeName: string;       // For example: "sick", "vacation", etc.
  startDate: string;       // ISO date string (e.g., "2024-04-01")
  endDate: string;         // ISO date string (e.g., "2024-04-05")
  statusID: number;
  status: string;
  approverID: number;      // The ID of the user who approves the leave
  approverName: string;      // The ID of the user who approves the leave
  created_Date: string;    // ISO date string when the request was created
  // Optional properties from fetched leave data
  remarks?: string;
  reason?: string;
  appliedOn?: string;      // ISO date string when the leave was applied
}

export const LeaveApi = {

  fetchLeaveRequest: async () => {
    const response = await api.get("/Leave/");
    return response.data
  },
  fetchResourceLeaveRequests : async (resourceId: number) => {
    const response = await api.get(`/Leave/resource-leaves?resourceId=${resourceId}`);
    return response.data
  },
  applyLeave: async (values: Leave) => {
    const response = await api.post("/Leave", values);
    return response.data;
  },
  fetchPendingApprovals: async (accessTypeId: number, pmId: number, rmId:number) => {
    const rmanagerID = rmId? rmId : 0;
    const response = await api.get(`/Leave/pending-approvals?accessTypeId=${accessTypeId}&pmId=${pmId}&rmId=${rmanagerID}`);
    return response.data;
  }
}