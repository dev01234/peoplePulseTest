"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Building2, Package, Briefcase, Users } from "lucide-react";
import {ClientReports} from "@/components/appComp/reports/clientsReport";
import { SupplierReports } from "@/components/appComp/reports/supplierReport";
import { ResourceReports } from "@/components/appComp/reports/resouresReports";
import { ProjectsReports } from "@/components/appComp/reports/projectsReport";

// Mock data for timesheet
const getCurrentWeek = () => {
  const now = new Date();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(now);
    day.setDate(now.getDate() - now.getDay() + i);
    days.push(day);
  }
  return days;
};

const timesheet = getCurrentWeek().map(day => ({
  date: day,
  hours: day.getDay() === 0 || day.getDay() === 6 ? 0 : 9,
  project: day.getDay() === 0 || day.getDay() === 6 ? "Weekend" : "Main Project",
  status: day.getDay() === 0 || day.getDay() === 6 ? "Weekend" : "Completed"
}));


const getStatusBadge = (status: string) => {
  const styles = {
    Approved: "bg-green-100 text-green-800 hover:bg-green-200",
    Pending: "bg-amber-100 text-amber-800 hover:bg-amber-200",
    Rejected: "bg-red-100 text-red-800 hover:bg-red-200",
    Weekend: "bg-gray-100 text-gray-800",
    Completed: "bg-blue-100 text-blue-800"
  };
  return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
};

export default function ReportPage() {
  return (
    <div className="container m-5 py-10">
      <h1 className="text-3xl font-bold mb-8">Employee Reports</h1>
      
      <Tabs defaultValue="timesheet" className="space-y-4">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="timesheet">
            <Clock className="mr-2 h-4 w-4" />
            Timesheet
          </TabsTrigger>
          <TabsTrigger value="clients">
            <Building2 className="mr-2 h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            <Package className="mr-2 h-4 w-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="resources">
            <Users className="mr-2 h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Briefcase className="mr-2 h-4 w-4" />
            Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timesheet">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Timesheet</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timesheet.map((day, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {day.date.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </TableCell>
                      <TableCell>{day.hours}</TableCell>
                      <TableCell>{day.project}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(day.status)}>
                          {day.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
        <ClientReports />
        </TabsContent>
        <TabsContent value="suppliers">
        <SupplierReports />
        </TabsContent>
        <TabsContent value="resources">
        <ResourceReports />
        </TabsContent>
        <TabsContent value="projects">
        <ProjectsReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}