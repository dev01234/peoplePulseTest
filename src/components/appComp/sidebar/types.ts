export type MenuItem = {
    href: string;
    icon: string;
    label: string;
    allowedRoles?: ('admin' | 'supplier')[];
  };
  
  export type SidebarGroup = {
    title: string;
    items: MenuItem[];
  };