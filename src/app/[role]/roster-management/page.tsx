"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  mockProjects,
  mockResources,
  mockShifts,
  mockHolidays,
} from "@/data/mock";
import {
  format,
  addWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isBefore,
} from "date-fns";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock, Download, Send } from "lucide-react";
import { DateRange } from "react-day-picker";
import Image from "next/image";

export default function RosterManagement() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedResource, setSelectedResource] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<string>("morning");
  const [view, setView] = useState<string>("weekly");
  const [selectionMode, setSelectionMode] = useState<"single" | "range">(
    "single"
  );

  const shiftTimes = {
    morning: { start: "09:00", end: "17:00" },
    afternoon: { start: "13:00", end: "21:00" },
    night: { start: "21:00", end: "05:00" },
  };

  const handleAllocateShift = () => {
    if (
      !dateRange?.from ||
      !selectedProject ||
      !selectedResource ||
      !selectedShift
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const allocatedShift = {
      project: selectedProject,
      resource: selectedResource,
      shift: selectedShift,
      fromDate: dateRange.from,
      toDate: dateRange.to
    };
    // In a real app, this would be an API call
    toast.success("Shift allocated successfully");
  };

  const handleExportMatrix = () => {
    // In a real app, this would generate and download a shift matrix report
    toast.success("Shift matrix exported successfully");
  };

  const handleCommunicateShifts = () => {
    // In a real app, this would send notifications to resources
    toast.success("Shift details communicated to resources");
  };

  const isHoliday = (date: Date) => {
    return mockHolidays.some(
      (holiday) =>
        format(new Date(holiday.date), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
    );
  };

  const getExistingShifts = (date: Date) => {
    return mockShifts.filter(
      (shift) =>
        format(new Date(shift.date), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
    );
  };

  const handleDateSelect = (value: DateRange | undefined) => {
    if (selectionMode === "single" && value?.from) {
      setDateRange({ from: value.from, to: undefined });
    } else {
      setDateRange(value);
    }
  };

  const renderShiftMatrix = () => {
    if (!dateRange?.from) return null;

    let days: Date[];
    if (selectionMode === "range" && dateRange.to) {
      days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    } else {
      const start = startOfWeek(dateRange.from);
      const end =
        view === "weekly"
          ? endOfWeek(dateRange.from)
          : endOfWeek(addWeeks(dateRange.from, 3));
      days = eachDayOfInterval({ start, end });
    }

    // Mock data for different shifts
    const shiftData = {
      morning: [
        {
          id: 1,
          name: "Devanjan Nanda",
          imageUrl:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        },
      ],
      afternoon: [
        {
          id: 3,
          name: "Durga Prasad",
          imageUrl:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
        },
      ],
      night: [
        {
          id: 5,
          name: "Rajesh",
          imageUrl:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        },
      ],
    };

    return (
      <div className="mt-6 overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-t-lg flex gap-x-2 justify-between flex-wrap">
              <p className="text-sm font-medium text-blue-700">
                Morning: Start: {shiftTimes.morning.start} AM
              </p>
              <p className="text-sm font-medium text-blue-700">
                Morning: End: {shiftTimes.morning.end} PM
              </p>
              <p className="text-sm font-medium text-red-700">
                Afternoon: Start: {shiftTimes.afternoon.start} PM
              </p>
              <p className="text-sm font-medium text-red-700">
                Afternoon: End: {shiftTimes.afternoon.end} PM
              </p>
              <p className="text-sm font-medium text-green-700">
                Night: Start: {shiftTimes.night.start} PM
              </p>
              <p className="text-sm font-medium text-green-700">
                Night: End: {shiftTimes.night.end} AM
              </p>
            </div>
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-muted/50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold"
                  >
                    Morning
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold"
                  >
                    Afternoon
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold"
                  >
                    Night
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {days.map((day) => {
                  return (
                    <tr
                      key={day.toISOString()}
                      className={isHoliday(day) ? "bg-red-50" : ""}
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                        {format(day, "MMM dd, yyyy")}
                      </td>
                      {["morning", "afternoon", "night"].map((shift) => (
                        <td
                          key={shift}
                          className="whitespace-nowrap px-3 py-4 text-sm"
                        >
                          {shiftData[shift]?.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center space-x-2"
                            >
                              <Image
                                src={s.imageUrl}
                                alt={s.name}
                                height={48}
                                width={48}
                                className="rounded-full"
                                unoptimized
                              />
                              <span>{s.name}</span>
                            </div>
                          ))}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-16">
      <div className="space-y-6">
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={handleExportMatrix}>
            <Download className="w-4 h-4 mr-2" />
            Export Matrix
          </Button>
          <Button variant="outline" onClick={handleCommunicateShifts}>
            <Send className="w-4 h-4 mr-2" />
            Communicate Shifts
          </Button>
        </div>

        <Tabs defaultValue="allocate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="allocate">Allocate Shifts</TabsTrigger>
            <TabsTrigger value="matrix">Shift Matrix</TabsTrigger>
          </TabsList>

          <TabsContent value="allocate">
            <Card>
              <CardHeader>
                <CardTitle>Shift Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Select Project
                      </label>
                      <Select
                        value={selectedProject}
                        onValueChange={setSelectedProject}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockProjects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Select Resource
                      </label>
                      <Select
                        value={selectedResource}
                        onValueChange={setSelectedResource}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a resource" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockResources.map((resource) => (
                            <SelectItem key={resource.id} value={resource.id}>
                              {resource.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Select Shift
                      </label>
                      <Select
                        value={selectedShift}
                        onValueChange={setSelectedShift}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift timing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">
                            Morning (9 AM - 5 PM)
                          </SelectItem>
                          <SelectItem value="afternoon">
                            Afternoon (1 PM - 9 PM)
                          </SelectItem>
                          <SelectItem value="night">
                            Night (9 PM - 5 AM)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleAllocateShift}
                      disabled={
                        !dateRange?.from ||
                        !selectedProject ||
                        !selectedResource ||
                        !selectedShift
                      }
                    >
                      Allocate Shift
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <Select
                        value={selectionMode}
                        onValueChange={(value: "single" | "range") => {
                          setSelectionMode(value);
                          setDateRange({
                            from: dateRange?.from || new Date(),
                            to: undefined,
                          });
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select date mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single Date</SelectItem>
                          <SelectItem value="range">Date Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Calendar
                      mode={selectionMode === "range" ? "range" : "single" as any}
                      selected={dateRange}
                      numberOfMonths={2}
                      onSelect={handleDateSelect}
                      className="rounded-md border"
                      modifiers={{
                        holiday: (date) => isHoliday(date),
                      }}
                      modifiersStyles={{
                        holiday: { color: "red" },
                      }}
                    />

                    {selectionMode === "range" &&
                      dateRange?.from &&
                      dateRange?.to && (
                        <div className="bg-muted/50 p-3 rounded-md">
                          <p className="text-sm text-muted-foreground">
                            Selected Range:{" "}
                            {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                            {format(dateRange.to, "MMM dd, yyyy")}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matrix">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Shift Matrix</CardTitle>
                <div className="flex space-x-4">
                  <Select
                    value={selectionMode}
                    onValueChange={(value: "single" | "range") => {
                      setSelectionMode(value);
                      setDateRange({
                        from: dateRange?.from || new Date(),
                        to: undefined,
                      });
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select date mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Date</SelectItem>
                      <SelectItem value="range">Date Range</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectionMode === "single" && (
                    <Select value={view} onValueChange={setView}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly View</SelectItem>
                        <SelectItem value="monthly">Monthly View</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent>{renderShiftMatrix()}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
