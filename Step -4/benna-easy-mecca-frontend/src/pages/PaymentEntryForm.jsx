// src/pages/PaymentEntryForm.jsx
//
// Confirmed against StorePaymentRequest.php + PaymentController.php:
//  - transaction_date, transaction_type, g_code_id, mode_of_payment,
//    note, bd_amount, exchange_rate: all correct, unchanged.
//  - RECEIVE amount field corrected: "amount" -> "sar_amount" (this was
//    the one guessed field, now confirmed from the Form Request rule
//    `'sar_amount' => ['required_if:transaction_type,RECEIVE', ...]`).
//  - Structure confirmed correct: PaymentController::storePayment creates
//    exactly one PaymentTransaction per request, so this form still
//    posts each row as its own request, one after another.

import { useState } from 'react';
import PaymentRow from '../components/entry/PaymentRow';
import GCodeField from '../components/entry/GCodeField';
import api from '../api/client';

let rowId = 0;
function newRow() {
  return { id: ++rowId };
}

export default function PaymentEntryForm() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [txnType, setTxnType] = useState('RECEIVE');
  const [gCode, setGCode] = useState('');
  const [selectedGCode, setSelectedGCode] = useState(null);
  const [rowsMeta, setRowsMeta] = useState([newRow()]);
  const [rowData, setRowData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const items = rowsMeta.map((r) => rowData[r.id]).filter(Boolean);
  const total = items.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  function updateRow(id, data) {
    setRowData((prev) => ({ ...prev, [id]: data }));
  }
  function addRow() {
    setRowsMeta((prev) => [...prev, newRow()]);
  }
  function removeRow(id) {
    setRowsMeta((prev) => prev.filter((r) => r.id !== id));
    setRowData((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }
  function handleTxnTypeChange(type) {
    setTxnType(type);
    setRowsMeta([newRow()]);
    setRowData({});
  }

  function buildPayload(row) {
    const base = {
      transaction_date: date,
      transaction_type: txnType,
      g_code_id: selectedGCode.id,
      mode_of_payment: row.mode_of_payment,
      note: row.note,
    };
    if (txnType === 'PAYMENT') {
      return { ...base, bd_amount: row.bd_amount, exchange_rate: row.rate };
    }
    return { ...base, sar_amount: row.amount };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedGCode) {
      setMessage({ type: 'error', text: 'Select a valid G-Code first.' });
      return;
    }
    if (items.length === 0) {
      setMessage({ type: 'error', text: 'Add at least one transaction row.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    let successCount = 0;
    const failMessages = [];

    for (const row of items) {
      try {
        await api.post('/payments', buildPayload(row));
        successCount += 1;
      } catch (err) {
        const errors = err.response?.data?.errors;
        const text = errors
          ? Object.values(errors).flat().join(' ')
          : err.response?.data?.message || 'Failed to submit a row.';
        failMessages.push(text);
      }
    }

    if (failMessages.length === 0) {
      setMessage({ type: 'success', text: `${successCount} transaction(s) submitted successfully.` });
      setGCode('');
      setSelectedGCode(null);
      setRowsMeta([newRow()]);
      setRowData({});
    } else {
      setMessage({
        type: 'error',
        text: `${successCount} succeeded, ${failMessages.length} failed. ${failMessages.join(' | ')}`,
      });
    }
    setSubmitting(false);
  }

  const isPayment = txnType === 'PAYMENT';

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow p-6 border-t-4 border-green-600 max-w-6xl mx-auto mb-10"
    >
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-5">
        3. Payment Form / Money Receive Form
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1">Entry Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1">Transaction Type</label>
          <select
            value={txnType}
            onChange={(e) => handleTxnTypeChange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="RECEIVE">Money Receive (From Agency)</option>
            <option value="PAYMENT">Payment (To Agency)</option>
          </select>
        </div>
        <GCodeField
          label="Agency Name"
          gCode={gCode}
          onChange={(code, gcode) => {
            setGCode(code);
            setSelectedGCode(gcode);
          }}
        />
      </div>

      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="bg-gray-50 text-left text-xs text-slate-800">
            <th className="p-3">Mode of Payment</th>
            {isPayment && (
              <>
                <th className="p-3">BD Amount</th>
                <th className="p-3">Rate</th>
              </>
            )}
            <th className="p-3">Note</th>
            <th className="p-3">Amount (SAR)</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {rowsMeta.map((r) => (
            <PaymentRow
              key={r.id}
              txnType={txnType}
              onChange={(data) => updateRow(r.id, data)}
              onRemove={() => removeRow(r.id)}
            />
          ))}
        </tbody>
      </table>

      <button
        type="button"
        onClick={addRow}
        className="bg-slate-700 hover:bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded mb-5"
      >
        + Add Transaction
      </button>

      <div className="text-right bg-gray-50 border border-gray-200 rounded p-4 mb-5">
        <span className="text-gray-600">Total Transaction Amount:</span>
        <span className="text-2xl font-bold text-green-600 ml-3">{total.toFixed(2)}</span>
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
        type="submit"
        disabled={submitting}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold text-base py-3 rounded"
      >
        {submitting ? 'Submitting...' : 'Submit Transaction'}
      </button>
    </form>
  );
}
