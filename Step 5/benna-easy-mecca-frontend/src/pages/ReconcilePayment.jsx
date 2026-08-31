// src/pages/ReconcilePayment.jsx
//
// Step 5 — Payment Reconciliation screen. Flow (agency-first, per confirmed decision):
//   1. Pick a G-Code -> resolves an Agency (BD or SAUDI).
//      - BD agency   -> relevant documents are Invoices, relevant payments are RECEIVE.
//      - SAUDI agency -> relevant documents are Purchase Bills, relevant payments are PAYMENT.
//   2. Load that agency's unallocated payments + outstanding (due > 0) documents.
//   3. User selects ONE payment to work on, then enters allocation amounts against
//      one or more outstanding documents (checkboxes are implicit: amount > 0 = selected).
//   4. Submit -> POST /payment-allocations. Backend re-validates everything (this is
//      just UX help, not the source of truth).

import { useState, useEffect, useCallback } from 'react';
import GCodeField from '../components/entry/GCodeField';
import {
  fetchPaymentsForAgency,
  fetchUnpaidInvoices,
  fetchUnpaidPurchases,
  allocatePayment,
} from '../api/paymentAllocations';

function fmt(n) {
  return Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
}

// Backend returns dates as full ISO timestamps (e.g. "2026-08-31T00:00:00.000000Z").
// Display just the date part.
function fmtDate(d) {
  if (!d) return '-';
  return String(d).slice(0, 10);
}

export default function ReconcilePayment() {
  const [gCode, setGCode] = useState('');
  const [selectedGCode, setSelectedGCode] = useState(null); // { id, code, agency: {...} }

  const [payments, setPayments] = useState([]);
  const [docs, setDocs] = useState([]); // outstanding invoices or purchases
  const [loading, setLoading] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [allocAmounts, setAllocAmounts] = useState({}); // { docId: "123.45" }

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const agency = selectedGCode?.agency ?? null;
  const isBD = agency?.agency_type === 'BD';
  const expectedTxnType = isBD ? 'RECEIVE' : 'PAYMENT';
  const allocatableType = isBD ? 'invoice' : 'purchase';
  const docLabel = isBD ? 'Invoice' : 'Purchase Bill';
  const docNoKey = isBD ? 'invoice_no' : 'purchase_no';
  const docDateKey = isBD ? 'invoice_date' : 'purchase_date';

  const loadAgencyData = useCallback((agencyRecord, { resetMessage = true } = {}) => {
    if (!agencyRecord) return;
    setLoading(true);
    setSelectedPayment(null);
    setAllocAmounts({});
    if (resetMessage) setMessage(null);

    const docsPromise =
      agencyRecord.agency_type === 'BD'
        ? fetchUnpaidInvoices(agencyRecord.id)
        : fetchUnpaidPurchases(agencyRecord.id);

    Promise.all([fetchPaymentsForAgency(agencyRecord.id), docsPromise])
      .then(([paymentList, docList]) => {
        const relevantTxnType = agencyRecord.agency_type === 'BD' ? 'RECEIVE' : 'PAYMENT';
        setPayments(
          paymentList.filter(
            (p) => p.transaction_type === relevantTxnType && Number(p.unallocated_amount) > 0.001
          )
        );
        setDocs(docList);
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load agency data. Is the backend running?' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (agency) loadAgencyData(agency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agency?.id]);

  function selectPayment(payment) {
    setSelectedPayment(payment);
    setAllocAmounts({});
    setMessage(null);
  }

  function setAmount(docId, value) {
    setAllocAmounts((prev) => ({ ...prev, [docId]: value }));
    setMessage(null);
  }

  function fillFull(doc) {
    const already = totalAllocated - (Number(allocAmounts[doc.id]) || 0);
    const remainingOnPayment = Math.max(
      (Number(selectedPayment?.unallocated_amount) || 0) - already,
      0
    );
    const amount = Math.min(Number(doc.due_amount) || 0, remainingOnPayment);
    setAmount(doc.id, amount > 0 ? amount.toFixed(2) : '');
  }

  const totalAllocated = docs.reduce((sum, d) => sum + (Number(allocAmounts[d.id]) || 0), 0);
  const remainingOnPayment = selectedPayment
    ? Number(selectedPayment.unallocated_amount) - totalAllocated
    : 0;

  async function handleSubmit() {
    if (!selectedPayment) {
      setMessage({ type: 'error', text: 'Select a payment to reconcile first.' });
      return;
    }

    const allocations = docs
      .filter((d) => Number(allocAmounts[d.id]) > 0)
      .map((d) => ({
        allocatable_type: allocatableType,
        allocatable_id: d.id,
        allocated_amount: Number(allocAmounts[d.id]),
      }));

    if (allocations.length === 0) {
      setMessage({ type: 'error', text: 'Enter at least one allocation amount.' });
      return;
    }
    if (totalAllocated > Number(selectedPayment.unallocated_amount) + 0.001) {
      setMessage({ type: 'error', text: 'Total allocated exceeds this payment\'s remaining balance.' });
      return;
    }
    const overDoc = docs.find(
      (d) => Number(allocAmounts[d.id]) > Number(d.due_amount) + 0.001
    );
    if (overDoc) {
      setMessage({
        type: 'error',
        text: `Allocated amount for ${overDoc[docNoKey]} exceeds its due amount.`,
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      await allocatePayment({
        payment_transaction_id: selectedPayment.id,
        allocations,
      });
      setMessage({ type: 'success', text: 'Allocation saved successfully.' });
      loadAgencyData(agency, { resetMessage: false });
    } catch (err) {
      const errors = err.response?.data?.errors;
      const text = errors
        ? Object.values(errors).flat().join(' ')
        : err.response?.data?.message || 'Failed to save allocation.';
      setMessage({ type: 'error', text });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-600 max-w-6xl mx-auto mb-10">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-5">
        Reconcile Payment
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <GCodeField
          label="Agency Name"
          gCode={gCode}
          onChange={(code, gcode) => {
            setGCode(code);
            setSelectedGCode(gcode);
          }}
        />
        {agency && (
          <div className="flex flex-col justify-end">
            <span
              className={`inline-block w-fit px-2 py-1 rounded text-xs font-bold ${
                isBD ? 'bg-blue-100 text-[#2980b9]' : 'bg-red-100 text-[#c0392b]'
              }`}
            >
              {agency.agency_type} Agency — matching {isBD ? 'Invoices' : 'Purchase Bills'} &{' '}
              {expectedTxnType} payments
            </span>
          </div>
        )}
      </div>

      {message && !selectedPayment && (
        <div
          className={`mb-4 text-sm px-4 py-2 rounded ${
            message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {!agency && (
        <p className="text-sm text-gray-400 text-center py-10">
          Search a G-Code above to load its agency's unallocated payments and outstanding{' '}
          {docLabel.toLowerCase()}s.
        </p>
      )}

      {agency && loading && (
        <p className="text-sm text-gray-400 text-center py-10">Loading...</p>
      )}

      {agency && !loading && (
        <>
          {/* Step 1: pick a payment */}
          <h3 className="text-sm font-bold text-slate-700 mb-2">
            Unallocated {expectedTxnType} Payments
          </h3>
          <table className="w-full border-collapse mb-6 text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-slate-800">
                <th className="p-3">Voucher No</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Amount (SAR)</th>
                <th className="p-3 text-right">Unallocated</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-400">
                    No unallocated {expectedTxnType.toLowerCase()} payments for this agency.
                  </td>
                </tr>
              )}
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b border-gray-100 ${
                    selectedPayment?.id === p.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="p-3 font-semibold">{p.voucher_no}</td>
                  <td className="p-3">{fmtDate(p.transaction_date)}</td>
                  <td className="p-3 text-right">{fmt(p.sar_amount)}</td>
                  <td className="p-3 text-right font-bold text-blue-700">
                    {fmt(p.unallocated_amount)}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => selectPayment(p)}
                      className={`text-xs font-bold px-3 py-1.5 rounded ${
                        selectedPayment?.id === p.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {selectedPayment?.id === p.id ? 'Selected' : 'Select'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Step 2: allocate against outstanding docs */}
          {selectedPayment && (
            <>
              <h3 className="text-sm font-bold text-slate-700 mb-2">
                Outstanding {docLabel}s — allocating voucher {selectedPayment.voucher_no}
              </h3>
              <table className="w-full border-collapse mb-4 text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-slate-800">
                    <th className="p-3">{docLabel} No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3 text-right">Due</th>
                    <th className="p-3 text-right w-40">Allocate Amount</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {docs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-400">
                        No outstanding {docLabel.toLowerCase()}s for this agency.
                      </td>
                    </tr>
                  )}
                  {docs.map((d) => (
                    <tr key={d.id} className="border-b border-gray-100">
                      <td className="p-3 font-semibold">{d[docNoKey]}</td>
                      <td className="p-3">{fmtDate(d[docDateKey])}</td>
                      <td className="p-3 text-right">{fmt(d.total_amount)}</td>
                      <td className="p-3 text-right font-bold text-red-600">{fmt(d.due_amount)}</td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={allocAmounts[d.id] ?? ''}
                          onChange={(e) => setAmount(d.id, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full text-right"
                        />
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => fillFull(d)}
                          className="text-xs font-bold text-blue-700 hover:underline"
                        >
                          Full
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded p-4 mb-5 text-sm">
                <span>
                  Payment Unallocated Balance:{' '}
                  <strong>{fmt(selectedPayment.unallocated_amount)}</strong>
                </span>
                <span>
                  Total Allocated Now: <strong>{fmt(totalAllocated)}</strong>
                </span>
                <span className={remainingOnPayment < 0 ? 'text-red-600 font-bold' : ''}>
                  Remaining After Save: <strong>{fmt(remainingOnPayment)}</strong>
                </span>
              </div>

              {message && (
                <div
                  className={`mb-4 text-sm px-4 py-2 rounded ${
                    message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-base py-3 rounded"
              >
                {submitting ? 'Saving...' : 'Save Allocation'}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
