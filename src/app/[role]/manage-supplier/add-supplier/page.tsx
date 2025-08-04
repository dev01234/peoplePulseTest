"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  SupplierApi,
  supplierContactSchema,
  supplierFormSchema,
} from "@/services/api/supplier";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dropdownApi } from "@/services/api/dropdown";

// Define a mapping for contact types
const contactTypes = [
  { id: 1, name: "HR" },
  { id: 2, name: "Escalation" },
  { id: 3, name: "Sales" },
  { id: 4, name: "Deals" },
  { id: 5, name: "SPOC" },
  { id: 6, name: "Sr Mgmt" },
];

// Extend the form schema to include application access fields
const extendedFormSchema = supplierFormSchema.extend({
  setApplicationAccess: z.boolean().default(false),
  userName: z.string().optional(),
});

export default function AddSupplier() {
  const router = useRouter();
  const [contactOpen, setContactOpen] = useState(false);
  const queryClient = useQueryClient();
  const [showAppAccess, setShowAppAccess] = useState(false);


  const form = useForm<z.infer<typeof extendedFormSchema>>({
    resolver: zodResolver(extendedFormSchema),
    defaultValues: {
      name: "",
      sid: "",
      contactNumber: "",
      address: "",
      stateID: 0,
      gst: "",
      pan: "",
      tan: "",
      stateName: "",
      contactInformation: [],
      setApplicationAccess: false,
      userName: "",
      email: "",
    },
  });

  const { data: states = [] } = useQuery({
    queryKey: ["states"],
    queryFn: dropdownApi.fetchStates,
  });

  const createSupplier = useMutation({
    mutationFn: SupplierApi.createSupplier,
    onSuccess: (data) => {
      form.reset();
      toast.success("Supplier created successfully.");
      router.push("/admin/manage-supplier");
    },
    onError: (error: any) => {
      // error may not always have a .response property, so log the whole error
      console.error("Error creating supplier:");
      toast.error(error.response.data.error);
    }
  });

  // Watch the supplier name and hasApplicationAccess to auto-populate username
  const supplierName = form.watch("name");
  const hasApplicationAccess = form.watch("setApplicationAccess");

  useEffect(() => {
    if (hasApplicationAccess && supplierName) {
      form.setValue(
        "userName",
        supplierName.toLowerCase().replace(/\s+/g, "_")
      );
    }
  }, [supplierName, hasApplicationAccess, form]);

  const onSubmit = async (values: z.infer<typeof extendedFormSchema>) => {
    const [password] = values.email.split("@");
    let supplierData = {
      isActive: true,
      name: values.name,
      sid: values.sid,
      address: values.address,
      stateID: values.stateID,
      gst: values.gst,
      pan: values.pan,
      tan: values.tan,
      contactNumber: values.contactNumber,
      stateName: values.stateName,
      contactInformation: values.contactInformation,
      setApplicationAccess: values.setApplicationAccess,
      userName: values.userName,
      email: values.email,
      password: password,
    };

    // Create supplier
    await createSupplier.mutateAsync(supplierData);
  };

  return (
    <div className="m-16 p-4 bg-white dark:bg-[#17171A]">
      <h1 className="text-2xl mb-6">Add Supplier</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-3/5"
        >
          {/* Existing form fields */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter supplier name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SID *</FormLabel>
                <FormControl>
                  <Input {...field} type="text" placeholder="Enter SID" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="Email address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter contact number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stateID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State *</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      const stateId = Number(value);
                      const selectedState = states.find((s) => s.id === stateId);
                      field.onChange(stateId); // Updates stateID
                      form.setValue("stateName", selectedState?.name || ""); // Updates stateName
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {states.map((state: any) => (
                        <SelectItem key={state.id} value={String(state.id)}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gst"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GST ID *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter GST ID" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PAN ID *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter PAN ID" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TAN ID *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter TAN ID" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Matrix */}
          <FormField
            control={form.control}
            name="contactInformation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Matrix *</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {field.value.map((contact, index) => (
                      <div key={index} className="p-4 border rounded">
                        <p>
                          Type:{" "}
                          {
                            contactTypes.find((ct) => ct.id === contact.contactTypeID)
                              ?.name
                          }
                        </p>
                        <p>Name: {contact.name}</p>
                        <p>Number: {contact.contactNumber}</p>
                        <p>Email: {contact.contactEmail}</p>
                      </div>
                    ))}

                    <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" type="button">
                          + Add Contact
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Contact</DialogTitle>
                        </DialogHeader>
                        <ContactForm
                          onSubmit={(contact) => {
                            const updatedContacts = [...field.value, contact];
                            field.onChange(updatedContacts);
                            setContactOpen(false);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Application Access Section */}
          <div className="space-y-4 border-t pt-4">
            <FormField
              control={form.control}
              name="setApplicationAccess"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setShowAppAccess(checked as boolean);
                      }}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Grant application access to this supplier
                  </FormLabel>
                </FormItem>
              )}
            />

            {showAppAccess && (
              <div className="space-y-4 pl-7">
                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}

// Contact Form Component
function ContactForm({
  onSubmit,
}: {
  onSubmit: (values: z.infer<typeof supplierContactSchema>) => void;
}) {
  const contactForm = useForm<z.infer<typeof supplierContactSchema>>({
    resolver: zodResolver(supplierContactSchema),
    defaultValues: {
      id: 0,
      isActive: true,
      contactTypeID: contactTypes[0].id,
      name: "",
      contactNumber: "",
      contactEmail: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof supplierContactSchema>) => {
    onSubmit(values);
    contactForm.reset();
  };

  return (
    <Form {...contactForm}>
      <form
        onSubmit={contactForm.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <FormField
          control={contactForm.control}
          name="contactTypeID"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Type</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={String(field.value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact type" />
                </SelectTrigger>
                <SelectContent>
                  {contactTypes.map((ct) => (
                    <SelectItem key={ct.id} value={String(ct.id)}>
                      {ct.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={contactForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={contactForm.control}
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter contact number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={contactForm.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Add Contact</Button>
      </form>
    </Form>
  );
}
