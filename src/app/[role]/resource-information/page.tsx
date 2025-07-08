"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import api from "@/lib/axiosInstance";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { ResourceApi } from "@/services/api/resource";
import { useUserStore } from "@/store/userStore";

// Define Type for Resource
interface Resource {
  id: string;
  firstName: string;
  lastName: string;
  emailID: string;
  isActive: boolean;
}

export default function ResourceSelection() {
  const router = useRouter();
  const { user } = useUserStore()
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ["resources",user?.id],
    queryFn: () => ResourceApi.fetchResourcesByUserId(user?.id),
    enabled : !!user?.id
  });

  const handleSelect = (value: string) => {
    setSelectedResource(value);
    setIsDropdownOpen(false);
    setSearch('')
  };

  const handleSubmit = () => {
    if (selectedResource) {
      router.push(`/admin/resource-information/${selectedResource}`);
    }
  };

  const selectedResourceDetails = resources.find(
    (resource) => resource.id === selectedResource
  );

  // Filter resources based on the search query
  const filteredResources = resources.filter((resource) => {
    const fullName = `${resource.firstName} ${resource.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });
  const CommandAny = Command as any;
  const CommandListAny = CommandList as any;
  const CommandEmptyAny = CommandEmpty as any;
  const CommandItemAny = CommandItem as any;

  return (!isLoading && (
    <div className="p-16">
      <div className="container max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Select Resource</CardTitle>
            <CardDescription>
              Select a resource to view or edit their information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <CommandAny className="rounded-lg border">
                <Input
                  className="focus-visible:ring-0"
                  placeholder={
                    selectedResourceDetails
                      ? `${selectedResourceDetails.firstName} ${selectedResourceDetails.lastName}`
                      : "Search resources..."
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setIsDropdownOpen(true)}
                />
                {isDropdownOpen && (
                  <CommandListAny className="max-h-60 overflow-auto">
                    {filteredResources.length === 0 ? (
                      <CommandEmptyAny>No results found.</CommandEmptyAny>
                    ) : (
                      filteredResources.map((resource) => (
                        <CommandItemAny
                          key={resource.id}
                          onSelect={() => handleSelect(resource.id)}
                        >
                          {resource.firstName} {resource.lastName}
                        </CommandItemAny>
                      ))
                    )}
                  </CommandListAny>
                )}
              </CommandAny>
            </div>

            {selectedResourceDetails && (
              <div className="rounded-lg border p-4 mt-4">
                <h3 className="font-medium mb-2">Selected Resource</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    {selectedResourceDetails.firstName} {selectedResourceDetails.lastName}
                  </p>
                  <p>
                    <span className="text-muted-foreground">ID:</span>{" "}
                    {selectedResourceDetails.id}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {selectedResourceDetails.emailID}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    {selectedResourceDetails.isActive ? "Active" : "Not Active"}
                  </p>
                </div>
              </div>
            )}

            <Button onClick={handleSubmit} disabled={!selectedResource} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>)
  );

}
