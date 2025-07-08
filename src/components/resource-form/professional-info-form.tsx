"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { dropdownApi } from "@/services/api/dropdown";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { professionalInfoSchema } from "@/lib/resource";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ProfessionalInfoFormProps {
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

export default function ProfessionalInfoForm({
  id,
  initialData,
  onSave,
}: ProfessionalInfoFormProps) {
  const [selectedDomain, setSelectedDomain] = useState(initialData?.domainID?.toString() || "");
  const isMounted = useRef(false);

  const form = useForm({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: {
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

  // Fetch data first
  const { data: domain = [] } = useQuery({
    queryKey: ["domain"],
    queryFn: dropdownApi.fetchDomian,
  });

  const { data: domainroles = [], isLoading: isRolesLoading } = useQuery({
    queryKey: ["domainRoles", selectedDomain],
    queryFn: () => dropdownApi.fetchDomianBasedRoles(Number(selectedDomain)),
    enabled: !!selectedDomain,
  });

  const { data: domainLevels = [] } = useQuery({
    queryKey: ["domainLevels"],
    queryFn: dropdownApi.fetchDomianelevels,
  });

  // Update form data when initial data changes
  useEffect(() => {
    if (initialData && domain.length > 0 && domainLevels.length > 0) {
      form.reset({
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
    }
  }, [initialData, domain, domainLevels, form]);

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
      resourceInformationID: initialData?.resourceInformationID || 0,
      id: initialData?.id || 0
    };
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
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