"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dropdownApi } from "@/services/api/dropdown";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalAndProfessionalInfoSchema } from "@/lib/resource";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

interface PersonalInfoFormProps {
  id: string;
  initialData: any;
  onSave: (data: any) => void;
}

const laptopProviders = [
  { id: 1, name: "Supplier" },
  { id: 2, name: "HPE" },
  { id: 3, name: "Rented" },
  { id: 4, name: "Business Funded" }
];

export default function PersonalInfoForm({ initialData, onSave, id }: PersonalInfoFormProps) {
  const [selectedDomain, setSelectedDomain] = useState(initialData?.domainID?.toString() || "");
  const queryClient = useQueryClient();

  const { data: states = [] } = useQuery({
    queryKey: ["states"],
    queryFn: dropdownApi.fetchStates
  });

  // Fetch domain data
  const { data: domain = [] } = useQuery({
    queryKey: ["domain"],
    queryFn: dropdownApi.fetchDomian,
  });

  // Fetch domain roles based on selected domain
  const { data: domainroles = [], isLoading: isRolesLoading } = useQuery({
    queryKey: ["domainRoles", selectedDomain],
    queryFn: () => dropdownApi.fetchDomianBasedRoles(Number(selectedDomain)),
    enabled: !!selectedDomain,
  });

  // Fetch domain levels
  const { data: domainLevels = [] } = useQuery({
    queryKey: ["domainLevels"],
    queryFn: dropdownApi.fetchDomianelevels,
  });

  const form = useForm({
    resolver: zodResolver(personalAndProfessionalInfoSchema),
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
      // Professional info fields
      domainID: initialData?.domainID?.toString() || "",
      domainRoleID: initialData?.domainRoleID?.toString() || "",
      domainLevelID: initialData?.domainLevelID?.toString() || "",
      overallExperience: initialData?.overallExperience?.toString() || "",
      cwfid: initialData?.cwfid || "",
      officialEmailID: initialData?.officialEmailID || "",
      laptopProviderID: initialData?.laptopProviderID?.toString() || "",
      assetAssignedDate: initialData?.assetAssignedDate?.split('T')[0] || "",
      assetModelNo: initialData?.assetModelNo || "",
      assetSerialNo: initialData?.assetSerialNo || "",
      poNo: initialData?.poNo || "",
      poDate: initialData?.poDate?.split('T')[0] || "",
      lastWorkingDate: initialData?.lastWorkingDate?.split('T')[0] || "",
      attendanceRequired: initialData?.attendanceRequired || false,
    }
  });

  useEffect(() => {
    if (initialData && states.length > 0 && domain.length > 0 && domainLevels.length > 0) {
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
        // Professional info fields
        domainID: initialData.domainID?.toString() || "",
        domainRoleID: initialData.domainRoleID?.toString() || "",
        domainLevelID: initialData.domainLevelID?.toString() || "",
        overallExperience: initialData.overallExperience?.toString() || "",
        cwfid: initialData.cwfid || "",
        officialEmailID: initialData.officialEmailID || "",
        laptopProviderID: initialData.laptopProviderID?.toString() || "",
        assetAssignedDate: initialData.assetAssignedDate?.split('T')[0] || "",
        assetModelNo: initialData.assetModelNo || "",
        assetSerialNo: initialData.assetSerialNo || "",
        poNo: initialData.poNo || "",
        poDate: initialData.poDate?.split('T')[0] || "",
        lastWorkingDate: initialData.lastWorkingDate?.split('T')[0] || "",
        attendanceRequired: initialData.attendanceRequired || false,
      });
      
      if (initialData.domainID) {
        setSelectedDomain(initialData.domainID.toString());
      }
    }
  }, [initialData, states, domain, domainLevels, form]);

  // Watch for domain changes in the form
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'domainID') {
        setSelectedDomain(value.domainID || "");
        // Reset domainRoleID when domain changes
        form.setValue("domainRoleID", "");
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSave = async (data: any) => {
    const formData = {
      ...data,
      personal: {
        resourceInformationID: initialData?.resourceInformationID || null,
        id: initialData?.id || null,
        isActive: data.isActive,
        joiningDate: data.joiningDate,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        officialMailingAddress: data.officialMailingAddress,
        pincode: data.pincode,
        stateID: data.stateID,
        hometownAddress: data.hometownAddress,
        alternateContactNumber: data.alternateContactNumber,
        emergencyContactNumber: data.emergencyContactNumber,
        fathersName: data.fathersName,
        mothersName: data.mothersName,
      },
      professional: {
        resourceInformationID: initialData?.resourceInformationID || null,
        id: initialData?.professional?.id || null,
        domainID: data.domainID,
        domainRoleID: data.domainRoleID,
        domainLevelID: data.domainLevelID,
        overallExperience: data.overallExperience,
        cwfid: data.cwfid,
        officialEmailID: data.officialEmailID,
        laptopProviderID: data.laptopProviderID,
        assetAssignedDate: data.assetAssignedDate,
        assetModelNo: data.assetModelNo,
        assetSerialNo: data.assetSerialNo,
        poNo: data.poNo,
        poDate: data.poDate,
        lastWorkingDate: data.lastWorkingDate,
        attendanceRequired: data.attendanceRequired,
      }
    };
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal & Professional Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
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

            <h3 className="text-lg font-semibold mt-8 mb-4">Professional Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="domainID"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Domain *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {domain.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
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
                name="domainRoleID"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Role *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedDomain || isRolesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isRolesLoading ? "Loading..." : "Select role"} />
                      </SelectTrigger>
                      <SelectContent>
                        {domainroles.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
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
                name="domainLevelID"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Level *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {domainLevels.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
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
                name="overallExperience"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Overall Experience (years) *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cwfid"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>CWF ID *</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="officialEmailID"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Official Email ID *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="laptopProviderID"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Laptop Provider *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {laptopProviders.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
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
                name="assetAssignedDate"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Asset Assigned Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assetModelNo"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Asset Model No *</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assetSerialNo"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Asset Serial No *</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="poNo"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>PO No *</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="poDate"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>PO Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastWorkingDate"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Last Working Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attendanceRequired"
                render={({ field }) => (
                  <FormItem className="space-y-2 flex items-center">
                    <FormLabel className="mr-2">Attendance Required? *</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
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