// src/data/mock.ts

// Mock projects data
export const mockProjects = [
    { id: "project1", name: "Project Alpha" },
    { id: "project2", name: "Project Beta" },
    { id: "project3", name: "Project Gamma" },
  ];
  
  // Mock resources data
  export const mockResources = [
    { id: "resource1", name: "Alice Johnson" },
    { id: "resource2", name: "Bob Smith" },
    { id: "resource3", name: "Charlie Brown" },
  ];
  
  // Mock shifts data (if needed; you might also define local shift data in the component)
  export const mockShifts = [
    {
      id: 1,
      date: "2023-10-05",
      shift: "morning",
      resourceId: "resource1",
    },
    {
      id: 2,
      date: "2023-10-05",
      shift: "afternoon",
      resourceId: "resource2",
    },
    {
      id: 3,
      date: "2023-10-05",
      shift: "night",
      resourceId: "resource3",
    },
    // Add more shift entries as needed
  ];
  
  // Mock holidays data
  export const mockHolidays = [
    {
      id: "holiday1",
      date: "2023-10-10",
      name: "Thanksgiving",
      description: "Mock Thanksgiving holiday",
    },
    {
      id: "holiday2",
      date: "2023-12-25",
      name: "Christmas",
      description: "Mock Christmas holiday",
    },
    // Add more holidays if needed
  ];
  

  export const mockLeaveTypes = [
    { id: 1, name: "Sick Leave", code: "SL" },
    { id: 2, name: "Casual Leave", code: "CL" },
    { id: 3, name: "Earned Leave", code: "EL" },
  ];
  
  // Mock leave balance (for each leave type)
  export const mockLeaveBalance = [
    { id: 1, leaveTypeId: 1, total: 10, used: 4, pending: 1 },
    { id: 2, leaveTypeId: 2, total: 12, used: 3, pending: 2 },
    { id: 3, leaveTypeId: 3, total: 15, used: 5, pending: 0 },
  ];
  
  // Mock leave requests
  // Note: For pending requests, we use the property `leaveType` (as expected by your pending tab).
  // For history requests, we use `leaveTypeId` (as expected by your history tab).
  export const mockLeaveRequests = [
    // Pending request
    {
      id: "lr-pending-1",
      leaveType: 1, // For pending requests, use "leaveType"
      startDate: "2023-09-01",
      endDate: "2023-09-02",
      reason: "Medical appointment",
      status: "pending",
      created_Date: "2023-08-28",
    },
    // History requests
    {
      id: "lr-history-1",
      leaveTypeId: 2,
      startDate: "2023-08-01",
      endDate: "2023-08-03",
      reason: "Family function",
      status: "approved",
      appliedOn: "2023-07-25",
    },
    {
      id: "lr-history-2",
      leaveTypeId: 3,
      startDate: "2023-07-10",
      endDate: "2023-07-11",
      reason: "Vacation",
      status: "rejected",
      appliedOn: "2023-07-05",
    },
  ];