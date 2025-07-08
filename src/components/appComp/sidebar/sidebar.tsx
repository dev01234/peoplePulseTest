"use client";
import {
  LayoutDashboard,
  User2,
  LogOut,
  Clock5,
  FolderOpenDot,
  Container,
  Notebook,
  CalendarFold,
  CalendarDays,
  CalendarDaysIcon,
  Info,
  Users,
  Grid,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "../../ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import SidebarListItem from "./sidebar-listitem";
import { useUserStore } from "@/store/userStore";
import {  MAIN_MENU, ICON_MAP } from "./constants";
import api from "@/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export function AppSidebar() {
  const params = usePathname();
  const router = useRouter();
  const [activeItem, setActiveItem] = useState<string>(params);
  const { user, logout } = useUserStore();
  const { open, state } = useSidebar();

    // Fetch menu items using useQuery with queryKey and async function
    const { data: menuData } = useQuery({
      queryKey: ["menuItems", user?.id],
      queryFn: async () => {
        const response = await api.get(`MenuItem?accessTypeId=${user?.roleId}`);
        return response.data; // Return API data
      },
      enabled: !!user?.id, // Enable fetching only if userId exists
    });
  
    // Transform API response into menu items, if menuData is present
    const transformedItems = menuData?.map((item) => {
      const menuName = item.menuItem?.name || "";
      const href = (item.menuItem?.href || "").replace("{accessTypeName}", user?.role).replace("{id}",user?.resourceID);
      const icon = ICON_MAP[item.menuItem?.icon?.toLowerCase()] || LayoutDashboard;
  
      return {
        href: `${href}`,
        icon: icon,
        label: item.menuItem?.label || "Menu Item",
      };
    }) || [];

  const handleLogout = async () => {
    console.log("logged out");
    // Clear the accessToken cookie
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    // Clear user state (e.g., Zustand store)
    logout();

    // Use the already defined router to redirect to the login page
    router.push('/login');

  };

  return (
    <Sidebar collapsible="icon" className="shadow-right">
      {state === "expanded" ? (
        <>
          <SidebarHeader className="flex gap-y-4 pt-5 w-full">
            <div className="flex w-full items-center">
              <SidebarTrigger />
              <div className="flex w-full justify-between items-center">
                <SidebarGroupLabel className="text-2xl text-primary-one font-medium">
                  {MAIN_MENU.title}
                </SidebarGroupLabel>
                <SidebarGroupLabel className="gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="border border-black rounded-sm h-7 w-7"
                          onClick={handleLogout}
                        >
                          <LogOut className="border-black" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Logout</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </SidebarGroupLabel>
              </div>
            </div>
          </SidebarHeader>

          {/* Main Menu Group */}
          <SidebarGroup className="pt-8">
            <SidebarContent className="flex flex-row justify-start items-center w-full">
              <div className="w-full">
                <ul className="w-full px-4">
                   {transformedItems.map((item) => (
                    <SidebarListItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      isActive={activeItem === item.href}
                      onClick={() => setActiveItem(item.href)}
                    />
                  ))}
                </ul>
              </div>
            </SidebarContent>
          </SidebarGroup>
        
        </>
      ) : (
        <div className="flex flex-col w-full h-full py-2 justify-between items-center">
          <SidebarTrigger />
          <Button
            variant="ghost"
            size="icon"
            className="border border-black rounded-sm h-7 w-7"
            onClick={handleLogout}
          >
            <LogOut className="border-black" />
          </Button>
        </div>
      )}
    </Sidebar>
  );
}
