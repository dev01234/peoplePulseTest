"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { dropdownApi } from "@/services/api/dropdown";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalInfoSchema } from "@/lib/resource";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface PersonalInfoFormProps {
  id: string;
  initialData: any;
  onSave: (data: any) => void;
}

export default function PersonalInfoForm({ initialData, onSave, id }: PersonalInfoFormProps) {
  const { data: states = [] } = useQuery({
    queryKey: ["states"],
    queryFn: dropdownApi.fetchStates
  });

  const form = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      isActive: initialData?.isActive || false,
      joiningDate: initialData?.joiningDate?.split('T')[0] || "",
      gender: initialData?.gender || "",
      dateOfBirth: initialData?.dateOfBirth?.split('T')[0] || "",
      officialMailingAddress: initialData?.officialMailingAddress || "",
      pincode: initialData?.pincode || "",
      stateID: initialData?.stateID?.toString() || "",
      hometownAddress: initialData?.hometownAddress || "",
      alternateContactNumber: initialData?.alternateContactNumber || "",
      emergencyContactNumber: initialData?.emergencyContactNumber || "",
      fathersName: initialData?.fathersName || "",
      mothersName: initialData?.mothersName || "",
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        isActive: initialData.isActive || false,
        joiningDate: initialData.joiningDate?.split('T')[0] || "",
        gender: initialData.gender || "",
        dateOfBirth: initialData.dateOfBirth?.split('T')[0] || "",
        officialMailingAddress: initialData.officialMailingAddress || "",
        pincode: initialData.pincode || "",
        stateID: initialData.stateID?.toString() || "",
        hometownAddress: initialData.hometownAddress || "",
        alternateContactNumber: initialData.alternateContactNumber || "",
        emergencyContactNumber: initialData.emergencyContactNumber || "",
        fathersName: initialData.fathersName || "",
        mothersName: initialData.mothersName || "",
      });
    }
  }, [initialData, form]);

  const handleSave = async (data: any) => {
    const formData = {
      ...data,
      resourceInformationID: initialData?.resourceInformationID || null,
      id: initialData?.id || null
    };
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Resource Status *</FormLabel>
                    <Select
                      value={field.value ? "Active" : "InActive"}
                      onValueChange={(value) => field.onChange(value === "Active")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="InActive">InActive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="joiningDate"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Joining Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Gender *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Date of Birth *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="officialMailingAddress"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Official Mailing Address *</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Pin Code *</FormLabel>
                    <FormControl>
                      <Input type="text" maxLength={6} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stateID"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>State *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state: { id: number; name: string }) => (
                          <SelectItem key={state.id} value={state.id.toString()}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hometownAddress"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Hometown Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alternateContactNumber"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Alternate Contact Number</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContactNumber"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Emergency Contact Number *</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fathersName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Father's Name *</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mothersName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Mother's Name *</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}