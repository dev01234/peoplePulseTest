"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Briefcase,
  Users,
  Calendar,
  Bell,
  Clock,
  Award,
  Building,
  GraduationCap,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { UsersApi } from "@/services/api/users";
import api from "@/lib/axiosInstance";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const resignationFormSchema = z.object({
  laptopHandover: z.boolean().default(false),
  idCardHandover: z.boolean().default(false),
  ktNotes: z.string().min(1, "KT handover notes are required"),
  notes: z.string().optional(),
});

export default function Home() {
  const { user } = useUserStore();
  const [avatarUrl, setAvatarUrl] = useState("https://github.com/shadcn.png");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resignationForm = useForm<z.infer<typeof resignationFormSchema>>({
    resolver: zodResolver(resignationFormSchema),
    defaultValues: {
      laptopHandover: false,
      idCardHandover: false,
      ktNotes: "",
      notes: "",
    },
  });

  const { data: resourceData } = useQuery({
    queryKey: ["resource", user?.id],
    queryFn: () => {
      if (!user?.id) {
        throw new Error("User ID is not available");
      }
      return UsersApi.fetchUserDetails(user.id);
    },
    enabled: !!user?.id,
  });

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatarUrl(imageUrl);
    }
  };

  const notifications = [
    { title: "Project Review", message: "Digital Transformation project review at 2 PM", time: "1h ago" },
    { title: "Team Meeting", message: "Weekly team sync with Cloud Migration team", time: "3h ago" },
    { title: "Document Update", message: "New documentation needs your approval", time: "5h ago" }
  ];

  const handleResignationFormSubmit = async (values: z.infer<typeof resignationFormSchema>) => {
    try {
      await api.post(`/Resignation/${resourceData.resourceId}/assetClearance`, {
        isLaptopHandedover: values.laptopHandover,
        isIDCardHandedover: values.idCardHandover,
        ktNotes: values.ktNotes,
        notes: values.notes,
      });
      toast.success("Resignation form submitted successfully");
      resignationForm.reset();
    } catch (error) {
      console.error("Error submitting resignation form:", error);
      toast.error("Failed to submit resignation form");
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="relative pb-24">
                {/* Cover Image */}
                <div className="absolute inset-0 h-32 bg-gradient-to-r from-blue-300 to-blue-500 rounded-t-lg dark:bg-gradient-to-r dark:from-gray-600 dark:to-gray-800" />

                {/* Profile Info */}
                <div className="relative mt-12 flex items-end space-x-4">
                  <div className="relative group">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <button
                      onClick={handleImageClick}
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-2xl font-bold text-gray-900">{resourceData?.name}</h2>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {resourceData?.designation}
                      </Badge>
                    </div>
                    <p className="flex items-center mt-1">
                      <Mail className="w-4 h-4 mr-2" />
                      {resourceData?.email}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* <div className="prose max-w-none">
                  </div> */}

                  {/* Work Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Clock className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Current Client</p>
                        <p className="font-medium">{resourceData?.currentClient}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Award className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Current Project</p>
                        <p className="font-medium">{resourceData?.currentProject}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Building className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Current Project Manager</p>
                        <p className="font-medium">{resourceData?.currentProjectManager}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Current Reporting Manager</p>
                        <p className="font-medium">{resourceData?.currentReportingManager}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Card */}
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Notifications</h3>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  3 New
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification, i) => (
                    <div key={i} className="flex items-start space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-gray-400 dark">{notification.title}</p>
                        <p className="text-sm text-gray-500">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Mark as read
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <h3 className="text-lg font-semibold">Overview</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Active Projects</p>
                        <p className="text-xl font-bold">12</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Team Members</p>
                        <p className="text-xl font-bold">47</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Completed Projects</p>
                        <p className="text-xl font-bold">143</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <h3 className="text-lg font-semibold">Recent Projects</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Digital Transformation', status: 'In Progress', date: 'Due in 2 weeks' },
                    { name: 'Cloud Migration', status: 'In Review', date: 'Due in 1 month' },
                    { name: 'Mobile App', status: 'Planning', date: 'Starts next week' }
                  ].map((project, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">{project.name}</span>
                        <Badge variant="outline" className={
                          project.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                            project.status === 'In Review' ? 'bg-yellow-50 text-yellow-700' :
                              'bg-gray-50 text-gray-700'
                        }>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">{project.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resignation Card */}
            {resourceData?.status && (
              <Card className="shadow-lg">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Resignation {resourceData.status === 6 && (<span className="text-yellow-500">Under Review</span>)} </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {resourceData.status !== 5 && (
                      <p className="text-gray-600">
                        If you wish to resign from your current role or project, please submit your resignation request below.
                      </p>
                    )}

                    {resourceData.status === 6 ? (
                      <Form {...resignationForm}>
                        <form
                          onSubmit={resignationForm.handleSubmit(handleResignationFormSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={resignationForm.control}
                            name="laptopHandover"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Laptop Handover
                                </FormLabel>
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

                          <FormField
                            control={resignationForm.control}
                            name="idCardHandover"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  ID Card Handover
                                </FormLabel>
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

                          <FormField
                            control={resignationForm.control}
                            name="ktNotes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  KT Handover Notes *
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    rows={4}
                                    placeholder="Enter KT handover notes..."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={resignationForm.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Additional Notes
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    rows={3}
                                    placeholder="Enter any additional notes..."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button type="submit" className="w-full">
                            Submit
                          </Button>
                        </form>
                      </Form>
                    ) : (
                      <p>Resigned</p>
                    )}

                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
