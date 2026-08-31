import apiClient from "./client";

export const fetchLedger = (agencyId, params) =>
  apiClient.get(`/agencies/${agencyId}/ledger`, { params }).then((res) => res.data);