import api from "@/lib/axiosInstance";
import { z } from "zod";

export interface ResourceType {
  id: string;
  firstName: string;
  lastName: string;
  emailID: string;
  mobileNumber: string;
  resourceCode: string;
  hireDate: string;
  isActive: boolean;
  status: number;
  comment?: string;
  pmComment?: string;
  isProfileInfoAdded?: boolean
}

export type PaginatedResponse = ResourceType[];

export const resourceFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required."),
  emailID: z.string().email("Invalid email address."),
  mobileNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits."),
  clientID: z.number().min(1, "Client is required"),
  projectID: z.number().min(1, "Project is required"),
  pmid: z.number().min(1, "Project Manager is required"),
  rmid: z.number(),
  supplierID: z.number().min(1, "Supplier is required"),
});

export const ResourceApi = {

  fetchResources: async () => {
    const response = await api.get("/Resource");
    return response.data.items;
  },

  fetchResourcesByUserId: async (userId: number) => {
    const response = await api.get(`/Resource?userId=${userId}&status=2`);
    return response.data.items;
  },

  fetchResourcesPaginated: async (pageNumber: number, pageSize: number): Promise<PaginatedResponse> => {
    const response = await api.get(`/Resource?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  },

  deactivateResources: async (id: string) => {
    await api.patch("/Resource", { id, isActive: false });
  },

  createResource: async (values: z.infer<typeof resourceFormSchema>) => {
    return await api.post("/Resource", values);
  },

  updateResource: async (values: z.infer<typeof resourceFormSchema>, id: string) => {
    return await api.put(`/Resource/${id}`, values);
  },

  fetchResource: async (id: number) => {
    const response = await api.get(`/Resource/${id}`);
    return response.data;
  },
  addReview: async (resourceId: string, comment: string) => {
    return await api.post(`/Resource/${resourceId}/review/2`, { comment });
  },

  acceptResource: async (resourceId: string, pmcomment: string) => {
    return await api.post(`/Resource/${resourceId}/review/2`, { pmcomment, status: 3 });
  },

  acceptResourceOnboarding: async (resourceId: string, pmcomment: string) => {
    return await api.post(`/Resource/${resourceId}/review/2`, { pmcomment, status: 4 });
  },

  acceptResourceResignation: async (resourceId: string, comment: string) => {
    return await api.post(`/Resource/${resourceId}/review/5`, { comment });
  },

  reviewResourceResignationAccepted: async (resourceId: string, supcomment: string) => {
    return await api.post(`/Resignation/${resourceId}/UpdateStatus/2`, { supcomment });
  },

  reviewResourceResignationReject: async (resourceId: string, supcomment: string) => {
    return await api.post(`/Resignation/${resourceId}/UpdateStatus/3`, { supcomment });
  },

  reviewResourceResignationRetain: async (resourceId: string, supcomment: string) => {
    return await api.post(`/Resignation/${resourceId}/UpdateStatus/4`, { supcomment });
  },

  rejectResource: async (resourceId: string, pmcomment: string) => {
    return await api.post(`/Resource/${resourceId}/review/2`, { pmcomment, status: 2 });
  },


}