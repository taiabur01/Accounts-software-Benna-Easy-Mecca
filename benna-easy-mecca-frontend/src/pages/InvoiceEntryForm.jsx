// src/pages/InvoiceEntryForm.jsx
//
// Confirmed against StoreInvoiceRequest.php + InvoiceController.php:
//  - invoice_date, g_code_id: correct, unchanged.
//  - items[].amount removed from the payload — the controller computes
//    amount itself via ItemAmountCalculator from items[].details, so
//    sending our client-side total was just ignored dead weight.
//  - items[].details field names now come from the corrected
//    itemTypes.js (sale_amount instead of amount).

import { useState } from 'react';
import ItemRow from '../components/entry/ItemRow';
import GCodeField from '../components/entry/GCodeField';
import api from '../api/client';

let rowId = 0;
function newRow() {
  return { id: ++rowId };
}

export default function InvoiceEntryForm() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [gCode, setGCode] = useState('');
  const [selectedGCode, setSelectedGCode] = useState(null); // full { id, code, agency: {...} }
  const [rowsMeta, setRowsMeta] = useState([newRow()]);
  const [rowData, setRowData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const items = rowsMeta.map((r) => rowData[r.id]).filter((d) => d && d.item_type);
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedGCode) {
      setMessage({ type: 'error', text: 'Select a valid G-Code first.' });
      return;
    }
    if (items.length === 0) {
      setMessage({ type: 'error', text: 'Add at least one item.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      await api.post('/invoices', {
        invoice_date: date,
        g_code_id: selectedGCode.id,
        items: items.map((d) => ({
          item_type: d.item_type,
          details: d.details,
          note: d.note,
        })),
      });
      setMessage({ type: 'success', text: 'Invoice submitted successfully.' });
      setGCode('');
      setSelectedGCode(null);
      setRowsMeta([newRow()]);
      setRowData({});
    } catch (err) {
      const errors = err.response?.data?.errors;
      const text = errors
        ? Object.values(errors).flat().join(' ')
        : err.response?.data?.message || 'Failed to submit invoice.';
      setMessage({ type: 'error', text });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-600 max-w-6xl mx-auto mb-10"
    >
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-5">
        1. Entry Form - For Invoice (Sales / Receivable)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1">Entry Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <GCodeField
          agencyType="BD"
          label="BD Agency Name"
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
            <th className="p-3 w-1/5">Item Type</th>
            <th className="p-3 w-1/2">Details & Note</th>
            <th className="p-3 w-1/5">Sale Amount (SAR)</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {rowsMeta.map((r) => (
            <ItemRow key={r.id} onChange={(data) => updateRow(r.id, data)} onRemove={() => removeRow(r.id)} />
          ))}
        </tbody>
      </table>

      <button
        type="button"
        onClick={addRow}
        className="bg-slate-700 hover:bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded mb-5"
      >
        + Add Invoice Item
      </button>

      <div className="text-right bg-gray-50 border border-gray-200 rounded p-4 mb-5">
        <span className="text-gray-600">Total Invoice Amount:</span>
        <span className="text-2xl font-bold text-blue-600 ml-3">{total.toFixed(2)}</span>
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
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-base py-3 rounded"
      >
        {submitting ? 'Submitting...' : 'Submit Invoice'}
      </button>
    </form>
  );
}
