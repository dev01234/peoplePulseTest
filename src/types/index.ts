export interface User {
  id: number;
  name: string;
  email: string;
  userProfileUrl: string;
  role: string ;
  roleId: number ;
  resourceID?: number ;
  pmID?: number ;
  rmID?: number ;
  supplierID?: number ;
  token: string
}

export interface Resource {
  id: string;
  name: string;
  role: string;
  skills: string[];
  imageUrl: string;
  availability: boolean;
  currentProject?: string;
}

export interface Shift {
  id: string;
  resourceId: string;
  projectId: string;
  startTime: string;
  endTime: string;
  type: 'morning' | 'afternoon' | 'night';
  date: string;
}

export interface Holiday {
  id: string;
  name: string;
  phDate: string;
  description: string;
  isPublic: boolean;
}

export type Comment = {
  id: string;
  employeeId: string;
  text: string;
  timestamp: Date;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  comments?: Comment[];
};

export type Project = {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  team: {
    rm: Employee;
    pms: Employee[];
    tls: Employee[];
    developers: Employee[];
  };
};