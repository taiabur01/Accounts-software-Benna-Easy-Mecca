// src/api/paymentAllocations.js
//
// Thin wrappers around the Step 5 reconciliation endpoints, following the
// same pattern as api/agencies.js (each function returns res.data directly).

import apiClient from './client';

// GET /api/payments?agency_id=X&per_page=100
// Paginated response (Laravel paginator) — callers should read .data for the array.
export const fetchPaymentsForAgency = (agencyId) =>
  apiClient
    .get('/payments', { params: { agency_id: agencyId, per_page: 100 } })
    .then((res) => res.data.data);

// GET /api/agencies/{agency}/unpaid-invoices -> plain array
export const fetchUnpaidInvoices = (agencyId) =>
  apiClient.get(`/agencies/${agencyId}/unpaid-invoices`).then((res) => res.data);

// GET /api/agencies/{agency}/unpaid-purchases -> plain array
export const fetchUnpaidPurchases = (agencyId) =>
  apiClient.get(`/agencies/${agencyId}/unpaid-purchases`).then((res) => res.data);

// POST /api/payment-allocations
// payload: { payment_transaction_id, allocations: [{ allocatable_type, allocatable_id, allocated_amount }] }
export const allocatePayment = (payload) =>
  apiClient.post('/payment-allocations', payload).then((res) => res.data);

// DELETE /api/payment-allocations/{allocation}
export const reverseAllocation = (allocationId) =>
  apiClient.delete(`/payment-allocations/${allocationId}`).then((res) => res.data);

// GET /api/payment-transactions/{payment}/allocations
export const fetchAllocationHistory = (paymentId) =>
  apiClient.get(`/payment-transactions/${paymentId}/allocations`).then((res) => res.data);
