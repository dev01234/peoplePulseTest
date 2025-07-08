import api from "@/lib/axiosInstance";

export const dropdownApi = {
    fetchRegions: async () => {
        const res = await api.get("/Master/regions");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchProjectManager: async () => {
        const res = await api.get("/Master/pmlist");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchRelationshipManager: async () => {
        const res = await api.get("/Master/rmlist");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchRMBasedPm: async (pmId:number) => {
        const res = await api.get(`/Master/rmlist?pmId=${pmId}`);
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchSuppliers: async () => {
        const res = await api.get("/Master/supplier");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchStates: async () => {
        const res = await api.get("/Master/states");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchLocations: async (stateId:number) => {
        const res = await api.get(`/Master/Location?stateID=${stateId}`);
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchAccessTypes: async () => {
        const res = await api.get("/Master/accessTypes");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchDomian: async () => {
        const res = await api.get("/Master/domain");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchDomianRoles: async () => {
        const res = await api.get("/Master/DomainRole");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchDomianBasedRoles: async (domainId:number) => {
        const res = await api.get(`/Master/DomainRole?domainId=${domainId}`);
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchClients: async () => {
        const res = await api.get("/Master/client");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchProjects: async (clientId:number) => {
        const res = await api.get(`/Master/project?clientID=${clientId}`);
        return res.data;
    },

    fetchDomianelevels: async () => {
        const res = await api.get("/Master/DomainLevel");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchContactTypes: async () => {
        const res = await api.get("/Master/ContactType");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchDeliveryMotions: async () => {
        const res = await api.get("/Master/DeliveryMotion");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchLaptopProviders: async () => {
        const res = await api.get("/Master/LaptopProvider");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchLeaveTypes: async () => {
        const res = await api.get("/Master/LeaveType");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchManagerTypes: async () => {
        const res = await api.get("/Master/ManagerType");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchPincodes: async () => {
        const res = await api.get("/Master/PinCode");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchSegments: async () => {
        const res = await api.get("/Master/segment");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchSupportTypes: async () => {
        const res = await api.get("/Master/supportType");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },

    fetchStatuses: async () => {
        const res = await api.get("/Master/statuses");
        return res.data.filter((result: { isActive: boolean }) => result.isActive);
    },
};
