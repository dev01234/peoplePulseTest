import api from "@/lib/axiosInstance";
import { z } from "zod";


export const userFormSchema = z.object({
  firstName: z.string().min(2, { message: "First Name must be at least 2 characters." }),
  lastName: z.string().optional(),
  email: z.string().min(1, { message: "This field has to be filled." }).email("This is not a valid email."),
  contactNumber: z.string().min(10, { message: "Contact number is required." }),
  accessTypeID: z.number().min(1, { message: "Access Type is required. Please select a valid option." }),
  isActive: z.boolean(),
  pmid: z.number().optional(),
});

export interface UserRow {
  id: number;
  firstName: string | null;
  lastName: string | null;
  userName: string | null;
  email: string;
  accessTypeID: number | null;
  accessTypeName: string | null;
  isActive: boolean;
}

export type PaginatedResponse = UserRow[];


export const UsersApi = {

  fetchUsers: async () => {
    const response = await api.get("/User");
    return response.data;
  },

  fetchUsersPaginated: async (pageNumber: number, pageSize: number): Promise<PaginatedResponse> => {
    const response = await api.get(`/User?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  },

  deactivateUser: async (id: number) => {
    await api.patch("/User", { id, isActive: false });
  },

  createUser: async (values: z.infer<typeof userFormSchema>) => {
    return await api.post("/User", values);
  },

  updateUser: async (values: z.infer<typeof userFormSchema>, id: string) => {
    return await api.put(`/User`, values);
  },

  fetchUser: async (id: number) => {
    const response = await api.get(`/User/${id}`);
    return response.data;
  },

  fetchUserDetails: async (id: number) => {
    const response = await api.get(`Profile/userId?userId=${id}`);
    return response.data;
  }
  //make sure to add fetchuser(singular)
}