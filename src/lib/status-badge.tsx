export function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      // Timesheet statuses
      "Approved": "bg-green-100 text-green-800 hover:bg-green-200",
      "Pending": "bg-amber-100 text-amber-800 hover:bg-amber-200",
      "Rejected": "bg-red-100 text-red-800 hover:bg-red-200",
      "Weekend": "bg-gray-100 text-gray-800",
      "Completed": "bg-blue-100 text-blue-800",
      
      // Client/Supplier statuses
      "Active": "bg-green-100 text-green-800",
      "Inactive": "bg-gray-100 text-gray-800",
      
      // Resource statuses
      "Available": "bg-green-100 text-green-800",
      "Assigned": "bg-blue-100 text-blue-800",
      "On Leave": "bg-amber-100 text-amber-800",
      
      // Project statuses
      "On Hold": "bg-amber-100 text-amber-800",
      "Planning": "bg-purple-100 text-purple-800"
    };
    
    return styles[status] || "bg-gray-100 text-gray-800";
  }