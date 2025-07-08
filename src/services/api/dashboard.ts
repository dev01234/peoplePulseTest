import api from "@/lib/axiosInstance";

export const DashBoardApi = {
     getDashboardDetails: async () => {
        const response = await api.get("/Dashboard");
        return response.data;
      },



      //make sure to add fetchclient(singular)
}