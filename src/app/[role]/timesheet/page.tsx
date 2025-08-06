// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Clock, Save, Lock } from "lucide-react";
import {
  format,
  startOfWeek,
  addDays,
  isAfter,
  startOfToday,
  isWeekend,
  endOfWeek,
  isFuture,
} from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ResourceApi } from "@/services/api/resource";
import { ProjectApi, ProjectType } from "@/services/api/projects";
import { useUserStore } from "@/store/userStore";
import { TimesheetApi } from "@/services/api/timesheet";
import { toast } from "sonner";
import api from "@/lib/axiosInstance";

interface Project {
  id: string;
  name: string;
}

interface TimeEntry {
  projectId: string;
  hours: { [key: string]: number };
}

interface TimeRange {
  [key: string]: {
    start: string;
    end: string;
  };
}

/**
 * Helper: calculate hours difference (in decimal hours)
 * from a time range given as strings ("HH:mm").
 */
function calculateHoursFromTimeRange(start: string, end: string): number {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  // Create dates on an arbitrary day.
  const startDate = new Date(0, 0, 0, startHour, startMinute);
  const endDate = new Date(0, 0, 0, endHour, endMinute);
  let diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  if (diff < 0) diff = 0;
  return Math.round(diff * 100) / 100; // Round to 2 decimal places
}

function TimesheetTable({
  projects,
  timeEntries,
  timeRanges,
  weekDays,
  onTimeChange,
  onTimeRangeChange,
  readOnly = false,
  hasWeekendPermission = false,
}: {
  projects: Project[];
  timeEntries: TimeEntry[];
  timeRanges: TimeRange;
  weekDays: Date[];
  onTimeChange: (projectId: string, date: string, hours: number) => void;
  onTimeRangeChange: (date: string, field: "start" | "end", value: string) => void;
  readOnly?: boolean;
  hasWeekendPermission?: boolean;
}) {
  // Calculate daily totals from time ranges (in/out time)
  const dailyTotals = weekDays.reduce((totals, day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const timeRange = timeRanges[dateStr];
    if (timeRange && timeRange.start && timeRange.end) {
      totals[dateStr] = calculateHoursFromTimeRange(timeRange.start, timeRange.end);
    } else {
      totals[dateStr] = 0;
    }
    return totals;
  }, {} as { [key: string]: number });

  // Calculate project totals for validation
  const projectTotals = weekDays.reduce((totals, day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    totals[dateStr] = timeEntries.reduce((sum, entry) => {
      return sum + (entry.hours[dateStr] || 0);
    }, 0);
    return totals;
  }, {} as { [key: string]: number });

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 bg-muted">Project</th>
            {weekDays.map((day) => (
              <th
                key={day.toString()}
                className={`border p-2 ${isWeekend(day) ? "bg-muted/80" : "bg-muted"}`}
              >
                <div>
                  {format(day, "EEE dd/MM")}
                  {isWeekend(day) && !hasWeekendPermission && (
                    <Lock className="inline ml-1 w-3 h-3" />
                  )}
                </div>
              </th>
            ))}
            <th className="border p-2 bg-muted">Total</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const projectEntry = timeEntries.find(
              (entry) => entry.projectId === project.id
            );
            const total = weekDays.reduce((sum, day) => {
              return sum + (projectEntry?.hours[format(day, "yyyy-MM-dd")] || 0);
            }, 0);

            return (
              <tr key={project.id}>
                <td className="border p-2">{project.name}</td>
                {weekDays.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const isWeekendDay = isWeekend(day);
                  const isDisabled = isWeekendDay && !hasWeekendPermission;
                  const hours = projectEntry?.hours[dateStr] || "";
                  const dailyLimit = dailyTotals[dateStr] || 0;
                  const currentProjectTotal = projectTotals[dateStr] || 0;
                  const otherProjectsTotal = currentProjectTotal - (projectEntry?.hours[dateStr] || 0);
                  const maxAllowed = Math.max(0, dailyLimit - otherProjectsTotal);
                  const isFutureDate = isFuture(day);

                  return (
                    <td key={dateStr} className="border p-2">
                      <input
                        type="number"
                        min="0"
                        max={dailyLimit > 0 ? maxAllowed.toString() : "24"}
                        step="0.5"
                        className={`w-16 p-1 border rounded ${readOnly || isDisabled ? "bg-gray-100" : ""
                          } ${isWeekendDay ? "bg-muted/50" : ""}`}
                        value={hours}
                        onChange={(e) =>
                          onTimeChange(project.id, dateStr, Math.round(Number(e.target.value) * 100) / 100)
                        }
                        readOnly={readOnly || isDisabled || isFutureDate}
                        disabled={isDisabled || isFutureDate}
                        title={dailyLimit > 0 ? `Maximum allowed: ${maxAllowed.toFixed(2)} hours (Daily limit: ${dailyLimit.toFixed(2)})` : ""}
                      />
                    </td>
                  );
                })}
                <td className="border p-2 font-bold">{total}</td>
              </tr>
            );
          })}
          <tr className="bg-muted/20">
            <td className="border p-2 font-bold">Daily Total</td>
            {weekDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dailyHours = dailyTotals[dateStr] || 0;
              return (
                <td
                  key={dateStr}
                  className="border p-2 font-bold"
                >
                  {dailyHours.toFixed(2)}
                </td>
              );
            })}
            <td className="border p-2 font-bold">
              {Object.values(dailyTotals).reduce((sum, hours) => sum + hours, 0).toFixed(2)}
            </td>
          </tr>
          <tr className="bg-muted/10">
            <td className="border p-2 font-bold">In Time</td>
            {weekDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const timeRange = timeRanges[dateStr] || { start: "", end: "" };
              const isWeekendDay = isWeekend(day);
              const isDisabled = isWeekendDay && !hasWeekendPermission;
              const isFutureDate = isFuture(day);
              return (
                <td key={dateStr} className="border p-2">
                  <input
                    type="time"
                    className={`w-full p-1 border rounded ${isDisabled || isFutureDate ? "bg-gray-100" : ""}`}
                    value={timeRange.start}
                    onChange={(e) =>
                      onTimeRangeChange(dateStr, "start", e.target.value)
                    }
                    disabled={isDisabled || isFutureDate}
                  />
                </td>
              );
            })}
            <td className="border p-2">-</td>
          </tr>
          <tr className="bg-muted/10">
            <td className="border p-2 font-bold">Out Time</td>
            {weekDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const timeRange = timeRanges[dateStr] || { start: "", end: "" };
              const isWeekendDay = isWeekend(day);
              const isDisabled = isWeekendDay && !hasWeekendPermission;
              const isFutureDate = isFuture(day);
              return (
                <td key={dateStr} className="border p-2">
                  <input
                    type="time"
                    className={`w-full p-1 border rounded ${isDisabled || isFutureDate ? "bg-gray-100" : ""}`}
                    value={timeRange.end}
                    onChange={(e) =>
                      onTimeRangeChange(dateStr, "end", e.target.value)
                    }
                    disabled={isDisabled || isFutureDate}
                  />
                </td>
              );
            })}
            <td className="border p-2">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function Home() {
  const { user } = useUserStore();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [timeRanges, setTimeRanges] = useState<TimeRange>({});
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasWeekendPermission] = useState(false);
  // Store the timesheet id returned by the backend (if any)
  const [timesheetData, setTimesheetData] = useState<any>(null);


  const { data: resourceData } = useQuery({
    queryKey: ["resource", user?.resourceID],
    queryFn: () => ResourceApi.fetchResource(user!.resourceID),
    enabled: !!user?.id,
  });

  const { data: initialProject } = useQuery({
    queryKey: ["project", resourceData?.data.projectID],
    queryFn: () => ProjectApi.fetchProject(resourceData?.data.projectID),
    enabled: !!resourceData?.data.projectID,
  });

  const { data: availableProjects } = useQuery<ProjectType[]>({
    queryKey: ["available-projects"],
    queryFn: ProjectApi.fetchProjects,
  });

  useEffect(() => {
    if (initialProject && !projects.some((p) => p.id === initialProject.id)) {
      setProjects([initialProject]);
    }
  }, [initialProject]);

  const startDate = startOfWeek(addDays(new Date(), currentWeekOffset * 7), {
    weekStartsOn: 1,
  });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  const futurestartDate = startOfWeek(addDays(startDate, 7), { weekStartsOn: 1 })
  const isFutureWeek = isAfter(futurestartDate, startOfToday());

  const availableProjectsToAdd = availableProjects?.filter(
    (availableProject) => !projects.some((p) => p.id === availableProject.id)
  );

  const handleAddProject = () => {
    if (selectedProjectId) {
      const projectToAdd = availableProjects?.find((p) => p.id === selectedProjectId);
      if (projectToAdd) {
        setProjects((prev) => [...prev, projectToAdd]);
        setSelectedProjectId("");
        setDialogOpen(false);
      }
    }
  };

  // When a user manually changes hours for a project on a given day.
  const handleTimeChange = (projectId: string, date: string, hours: number) => {
    // Round to 2 decimal places
    const roundedHours = Math.round(hours * 100) / 100;
    
    // Get daily limit from time range
    const timeRange = timeRanges[date];
    let dailyLimit = 0;
    if (timeRange && timeRange.start && timeRange.end) {
      dailyLimit = calculateHoursFromTimeRange(timeRange.start, timeRange.end);
    }
    
    // Calculate current total for other projects on this date
    const otherProjectsTotal = timeEntries
      .filter(entry => entry.projectId !== projectId)
      .reduce((sum, entry) => sum + (entry.hours[date] || 0), 0);
    
    // Check if the new hours would exceed daily limit
    if (dailyLimit > 0 && (roundedHours + otherProjectsTotal) > dailyLimit) {
      const maxAllowed = Math.max(0, dailyLimit - otherProjectsTotal);
      toast.error(`Cannot exceed daily limit of ${dailyLimit.toFixed(2)} hours. Maximum allowed for this project: ${maxAllowed.toFixed(2)} hours`);
      return;
    }

    setTimeEntries((prev) => {
      const projectEntry =
        prev.find((entry) => entry.projectId === projectId) || { projectId, hours: {} };
      const updatedEntry = {
        ...projectEntry,
        hours: { ...projectEntry.hours, [date]: roundedHours },
      };
      return [...prev.filter((entry) => entry.projectId !== projectId), updatedEntry];
    });
  };

  /**
   * When a time range is changed, update the state and recalc the daily hours
   * (using the helper) for every project for that day.
   */
  const handleTimeRangeChange = (date: string, field: "start" | "end", value: string) => {
    setTimeRanges((prev) => {
      const newRanges = { ...prev, [date]: { ...prev[date], [field]: value } };
      const { start, end } = newRanges[date] || {};
      if (start && end) {
        const computedHours = calculateHoursFromTimeRange(start, end);
        // When time range changes, redistribute hours proportionally if they exceed the new limit
        setTimeEntries((prevEntries) =>
          prevEntries.map((entry) => {
            const currentHours = entry.hours[date] || 0;
            const totalCurrentHours = prevEntries.reduce((sum, e) => sum + (e.hours[date] || 0), 0);
            
            // If total exceeds new limit, proportionally reduce
            if (totalCurrentHours > computedHours && computedHours > 0) {
              const proportion = computedHours / totalCurrentHours;
              const newHours = Math.round(currentHours * proportion * 100) / 100;
              return {
                ...entry,
                hours: { ...entry.hours, [date]: newHours },
              };
            }
            
            return entry;
          })
        );
      }
      return newRanges;
    });
  };

  // When the week changes (or on initial load), fetch timesheet data.
  useEffect(() => {
    async function fetchTimesheet() {
      if (resourceData?.data.id) {
        const weekStartStr = format(startDate, "yyyy-MM-dd");
        console.log("Fetching timesheet for", resourceData.data.id, weekStartStr);
        try {
          const response = await api.get(
            `/Timesheet/timesheet/${resourceData.data.id}/${weekStartStr}`
          );
          console.log("Fetched timesheet:", response.data);
          if (response?.data) {
            setTimesheetData(response.data);
            // Map API response to local state.
            const projectsFromResponse = response.data.projectTimesheetDetails.map(
              (detail: any) => ({
                id: String(detail.projectID),
                name:
                  availableProjects?.find(
                    (p) => p.id === String(detail.projectID)
                  )?.name || `Project ${detail.projectID}`,
              })
            );
            setProjects(projectsFromResponse);
            const newTimeEntries = response.data.projectTimesheetDetails.map(
              (detail: any) => ({
                projectId: String(detail.projectID),
                hours: detail.timesheetDetails.reduce(
                  (acc: { [key: string]: number }, day: any) => {
                    const dateStr = day.workDate.split("T")[0];
                    acc[dateStr] = day.hoursWorked;
                    return acc;
                  },
                  {}
                ),
              })
            );
            setTimeEntries(newTimeEntries);
            setTimeRanges({});
          }
        } catch (error) {
          console.error("Error fetching timesheet:", error);
        }
      }
    }
    fetchTimesheet();
  }, [resourceData, currentWeekOffset]);

  // Mutation for saving/updating the timesheet.
  const saveOrUpdateTimesheetMutation = useMutation({
    mutationFn: (values: any) => {
      if (timesheetData && timesheetData.id) {
        return TimesheetApi.updateTimesheet(values, timesheetData.id);
      } else {
        return TimesheetApi.saveTimesheet(values);
      }
    },
    onSuccess: (data) => {
      toast("Timesheet saved successfully");
      // Update timesheetData if new timesheet was created.
      if (!timesheetData && data?.id) {
        setTimesheetData(data);
      }
    },
    onError: () => {
      toast("Error saving timesheet");
    },
  });

  // Build the payload for saving/submission.
  const buildPayload = () => {
    const totalHours = weekDays.reduce((total, day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayTotal = timeEntries.reduce((sum, entry) => {
        const value = entry.hours[dateStr] || 0;
        return sum + parseFloat(value);
      }, 0);
      return total + dayTotal;
    }, 0);

    return {
      id: timesheetData?.id || 0,
      resourceID: resourceData?.data.id || 0,
      totalHours: 40,
      workedHours: parseFloat(totalHours.toFixed(2)),
      status: "pending",
      pmid: resourceData?.data.pmid,
      rmid: resourceData?.data.rmid,
      isActive: true,
      isNotified: true,
      isSubmit: false, // to be set later in handlers
      weekStartDate: format(startDate, "yyyy-MM-dd") + "T00:00:00",
      weekEndDate:
        format(endOfWeek(startDate, { weekStartsOn: 1 }), "yyyy-MM-dd") + "T00:00:00",
      projectTimesheetDetails: projects.map((project) => {
        const existingProjectDetail = timesheetData?.projectTimesheetDetails?.find(
          (detail: any) => String(detail.projectID) === project.id
        );
        return {
          projectID: Number(project.id),
          timesheetID: existingProjectDetail ? existingProjectDetail.timesheetID : 0,
          id: existingProjectDetail ? existingProjectDetail.id : 0,
          isActive: existingProjectDetail?.isActive ?? null,
          timesheetDetails: weekDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            let existingDetail;
            if (existingProjectDetail) {
              existingDetail = existingProjectDetail.timesheetDetails.find(
                (d: any) => d.workDate.split("T")[0] === dateStr
              );
            }
            return {
              id: existingDetail ? existingDetail.id : 0,
              timesheet_ProjectTimesheetDetailID: existingDetail ? existingDetail.timesheet_ProjectTimesheetDetailID : 0,
              workDate: dateStr + "T00:00:00",
              hoursWorked:
                timeEntries.find((e) => e.projectId === project.id)?.hours[dateStr] || 0,
              isHoliday: existingDetail ? existingDetail.isHoliday : null,
              isActive: existingDetail ? existingDetail.isActive : null,
            };
          }),
        };
      }),
    };
  };


  // Save as a draft.
  const handleSaveDraft = async () => {
    const payload = buildPayload();
    // Ensure draft save has isSubmit: false.
    payload.isSubmit = false;
    saveOrUpdateTimesheetMutation.mutate(payload);
  };

  // Final submission.
  const handleSubmit = async () => {
    const payload = buildPayload();
    // For final submission, set isSubmit: true.
    payload.isSubmit = true;
    saveOrUpdateTimesheetMutation.mutate(payload);
  };

  // Determine if Friday is filled (assume Friday is the 5th day).
  const fridayDate = format(weekDays[4], "yyyy-MM-dd");
  const isFridayFilled = timeEntries.some((entry) => entry.hours[fridayDate] > 0);

  const handleWeekChange = (offset: number) => {
    setCurrentWeekOffset(offset);
  };

  const isEditableWeek = currentWeekOffset === 0;

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              Weekly Attendace - {resourceData?.data.firstName} {resourceData?.data.lastName}
            </CardTitle>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => handleWeekChange(currentWeekOffset - 1)}>
                Previous Week
              </Button>
              <Button variant="outline" onClick={() => handleWeekChange(0)} disabled={currentWeekOffset === 0}>
                Current Week
              </Button>
              <Button variant="outline" onClick={() => handleWeekChange(currentWeekOffset + 1)} disabled={isFutureWeek}>
                Next Week
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex gap-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={!availableProjectsToAdd?.length}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Project to Timesheet</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProjectsToAdd?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleAddProject} disabled={!selectedProjectId}>
                        Add Project
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveDraft} variant="default" disabled={!isEditableWeek}>
                <Save className="w-4 h-4 mr-2" />
                Save Timesheet
              </Button>
              {isFridayFilled && (
                <Button onClick={handleSubmit} variant="default" disabled={!isEditableWeek}>
                  <Lock className="w-4 h-4 mr-2" />
                  Submit Timesheet
                </Button>
              )}
            </div>
          </div>
          <TimesheetTable
            projects={projects}
            timeEntries={timeEntries}
            timeRanges={timeRanges}
            weekDays={weekDays}
            onTimeChange={handleTimeChange}
            onTimeRangeChange={handleTimeRangeChange}
            hasWeekendPermission={hasWeekendPermission}
          />
        </CardContent>
      </Card>
    </div>
  );
}