"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { format, parseISO, isValid, startOfDay, set } from "date-fns";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  PublicHolidayApi,
  publicHolidayFormSchema,
} from "@/services/api/publicholiday";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/ui/loader";

export type Holiday = {
  id: string;
  name: string;
  description: string;
  phDate: string;
  isPublic: boolean;
};

export default function HolidaysPage() {
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [showAll, setShowAll] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof publicHolidayFormSchema>>({
    resolver: zodResolver(publicHolidayFormSchema),
    defaultValues: {
      name: "",
      description: "",
      phDate: new Date(),
      isPublic: true,
      isActive: true,
    },
  });

  useEffect(() => {
    if (editingHoliday) {
      const date = parseISO(editingHoliday.phDate);
      // Set the time to noon to avoid timezone issues
      const adjustedDate = set(date, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });
      
      form.reset({
        name: editingHoliday.name,
        description: editingHoliday.description,
        phDate: adjustedDate,
        isPublic: editingHoliday.isPublic,
      });
    }
  }, [editingHoliday, form]);

  const { data: holidays = [], isLoading: isHolidaysLoading } = useQuery({
    queryKey: ["holidays"],
    queryFn: PublicHolidayApi.fetchHoliday,
  });

  const createHolidayMutation = useMutation({
    mutationFn: PublicHolidayApi.createholiday,
    onSuccess: () => {
      toast.success("Holiday added successfully");
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      form.reset();
      setEditingHoliday(null);
    },
    onError: () => {
      toast.error("Error adding holiday");
    },
  });

  const updateHolidayMutation = useMutation({
    mutationFn: (values: z.infer<typeof publicHolidayFormSchema>) =>
      PublicHolidayApi.updateholiday(values, editingHoliday!.id),
    onSuccess: () => {
      toast.success("Holiday updated successfully");
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      form.reset();
      setEditingHoliday(null);
    },
    onError: () => {
      toast.error("Error updating holiday");
    },
  });

  const deleteHoliday = useMutation({
    mutationFn: PublicHolidayApi.deleteHoliday,
    onSuccess: () => {
      toast.success("Holiday deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
    onError: () => {
      toast.error("Error deleting holiday");
    },
  });

  const handleDeleteHoliday = (id: number) => {
    deleteHoliday.mutate(id);
  };

  const onSubmit = (values: z.infer<typeof publicHolidayFormSchema>) => {
    // Set the time to noon to avoid timezone issues
    const adjustedDate = set(values.phDate, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });
    
    const holidayData = {
      ...values,
      phDate: adjustedDate,
      isActive: true,
    };

    if (editingHoliday) {
      updateHolidayMutation.mutate({ ...holidayData, id: editingHoliday.id });
    } else {
      createHolidayMutation.mutate(holidayData);
    }
  };

  const isHoliday = (date: Date) => {
    return holidays.some((holiday: Holiday) => {
      if (!holiday.phDate) return false;
      const parsed = parseISO(holiday.phDate);
      if (!isValid(parsed)) return false;
      return format(parsed, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
    });
  };

  const filteredHolidays = showAll
    ? holidays
    : holidays.filter((holiday: Holiday) => {
        const phDate = parseISO(holiday.phDate);
        if (!isValid(phDate)) return false;
        const holidayStart = startOfDay(phDate);
        const todayStart = startOfDay(new Date());
        return holidayStart >= todayStart;
      });

  if (isHolidaysLoading) {
    return <Loader/>
  }

  return (
    <div className="p-16">
      <main className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Holiday Management</h1>
          <CalendarDays className="w-8 h-8 text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingHoliday ? "Edit Holiday" : "Add Holiday"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Holiday Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter holiday name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter holiday description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Date</FormLabel>
                        <FormControl>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                // Set the time to noon to avoid timezone issues
                                const adjustedDate = set(date, { 
                                  hours: 12, 
                                  minutes: 0, 
                                  seconds: 0, 
                                  milliseconds: 0 
                                });
                                field.onChange(adjustedDate);
                              }
                            }}
                            className="rounded-md border"
                            modifiers={{ holiday: isHoliday }}
                            modifiersStyles={{ holiday: { color: "red" } }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    {editingHoliday ? (
                      <>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Holiday
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Holiday
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Holiday List</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Show Upcoming" : "Show All"}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {filteredHolidays.map((holiday: Holiday, index: number) => (
                  <div
                    key={holiday.id || index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div>
                      <h3 className="font-medium">{holiday.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {holiday.phDate && isValid(parseISO(holiday.phDate))
                          ? format(parseISO(holiday.phDate), "PPP")
                          : "No date available"}
                      </p>
                      {holiday.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {holiday.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingHoliday(holiday)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteHoliday(Number(holiday.id))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}