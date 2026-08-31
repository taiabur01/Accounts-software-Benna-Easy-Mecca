import apiClient from "./client";

export const fetchGCodes = (params) =>
  apiClient.get("/g-codes", { params }).then((res) => res.data);

export const fetchAllGCodesForDropdown = () =>
  apiClient
    .get("/g-codes", { params: { per_page: 1000 } })
    .then((res) => res.data.data);

export const createGCode = (payload) =>
  apiClient.post("/g-codes", payload).then((res) => res.data);

export const updateGCode = (id, payload) =>
  apiClient.put(`/g-codes/${id}`, payload).then((res) => res.data);

export const deleteGCode = (id) =>
  apiClient.delete(`/g-codes/${id}`).then((res) => res.data);
