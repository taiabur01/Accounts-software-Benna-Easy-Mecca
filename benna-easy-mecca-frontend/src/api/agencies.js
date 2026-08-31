import apiClient from "./client";

export const fetchAgencies = (params) =>
  apiClient.get("/agencies", { params }).then((res) => res.data);

export const fetchAllAgenciesForDropdown = () =>
  apiClient
    .get("/agencies", { params: { per_page: 1000 } })
    .then((res) => res.data.data);

export const createAgency = (payload) =>
  apiClient.post("/agencies", payload).then((res) => res.data);

export const updateAgency = (id, payload) =>
  apiClient.put(`/agencies/${id}`, payload).then((res) => res.data);

export const deleteAgency = (id) =>
  apiClient.delete(`/agencies/${id}`).then((res) => res.data);
