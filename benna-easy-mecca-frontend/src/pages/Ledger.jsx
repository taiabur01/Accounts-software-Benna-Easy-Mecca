import { useState, useEffect } from "react";
import { fetchAllAgenciesForDropdown } from "../api/agencies";
import { fetchLedger } from "../api/ledger";
import apiClient from "../api/client";

function fmt(n) {
  return Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
}

export default function Ledger() {
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState("");
  
  const [gCodes, setGCodes] = useState([]);
  const [selectedGCode, setSelectedGCode] = useState("");
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllAgenciesForDropdown().then(setAgencies);
  }, []);

  // Update G-Code list when Agency changes
  useEffect(() => {
    setSelectedGCode("");
    setLedgerData(null);
    if (selectedAgency) {
      apiClient.get("/g-codes", { params: { agency_id: selectedAgency, per_page: 100 } })
        .then(res => setGCodes(res.data.data))
        .catch(() => setGCodes([]));
    } else {
      setGCodes([]);
    }
  }, [selectedAgency]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedAgency) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLedger(selectedAgency, {
        g_code_id: selectedGCode || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setLedgerData(data);
    } catch (err) {
      const errMsg = err.response?.data?.errors?.g_code_id?.[0] || "Failed to fetch ledger. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6 mb-6 print:hidden border-t-4 border-indigo-600">
        <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Agency Ledger & Statement</h2>
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Select Agency *</label>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              required
            >
              <option value="">-- Select Agency --</option>
              {agencies.map((a) => (
                <option key={a.id} value={a.id}>{a.agency_name} ({a.agency_type})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">G-Code (Optional)</label>
            <select
              value={selectedGCode}
              onChange={(e) => setSelectedGCode(e.target.value)}
              disabled={!selectedAgency}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-100"
            >
              <option value="">All G-Codes</option>
              {gCodes.map((g) => (
                <option key={g.id} value={g.id}>{g.code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm"/>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm"/>
          </div>
          <div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      </div>

      {ledgerData && (
        <div className="bg-white rounded-lg shadow p-8 print:shadow-none print:p-0">
          <div className="flex justify-between items-start border-b pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Statement of Account</h1>
              <p className="text-gray-600 mt-1 font-semibold">{ledgerData.summary.agency_name}</p>
              <p className="text-sm text-gray-500">Type: {ledgerData.summary.agency_type} Agency</p>
              {selectedGCode && <p className="text-sm font-bold text-indigo-600 mt-1">Filtered by G-Code: {gCodes.find(g => String(g.id) === selectedGCode)?.code}</p>}
            </div>
            <div className="text-right">
              <button onClick={() => window.print()} className="print:hidden bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded mb-2">Print / PDF</button>
              <p className="text-sm text-gray-500">Period: {startDate || "Beginning"} to {endDate || "Present"}</p>
            </div>
          </div>

          {/* Reconciled Summary Box */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 border border-gray-200 rounded p-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Opening Balance</p>
              <p className="text-lg font-bold text-slate-800">{fmt(ledgerData.summary.opening_balance)} {ledgerData.summary.opening_balance_type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Total Invoiced (Sales)</p>
              <p className="text-lg font-bold text-blue-600">{fmt(ledgerData.summary.total_invoiced)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Total Purchased (Cost)</p>
              <p className="text-lg font-bold text-red-600">{fmt(ledgerData.summary.total_purchased)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Net Closing Balance</p>
              <p className="text-lg font-bold text-indigo-700">{fmt(ledgerData.summary.closing_balance)} {ledgerData.summary.closing_balance_type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Total Received</p>
              <p className="text-lg font-bold text-green-600">{fmt(ledgerData.summary.total_received)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Total Paid</p>
              <p className="text-lg font-bold text-orange-600">{fmt(ledgerData.summary.total_paid)}</p>
            </div>
            <div className="col-span-2 border-l pl-4 border-gray-300">
              <p className="text-xs text-gray-500 font-bold uppercase">Total Reconciled / Allocated</p>
              <p className="text-xl font-bold text-emerald-600">{fmt(ledgerData.summary.total_reconciled)}</p>
              <p className="text-xs text-gray-400">Linked exactly to actual bills/invoices via Reconcile page.</p>
            </div>
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-slate-800 border-y border-gray-300">
                <th className="p-3 text-left w-24">Date</th>
                <th className="p-3 text-left">G-Code</th>
                <th className="p-3 text-left">Reference</th>
                <th className="p-3 text-left">Particulars</th>
                <th className="p-3 text-right">Debit (SAR)</th>
                <th className="p-3 text-right">Credit (SAR)</th>
                <th className="p-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 bg-gray-50/50 font-semibold text-gray-600">
                <td className="p-3" colSpan="4">Opening Balance {selectedGCode && "(Omitted for G-Code Filter)"}</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right text-slate-800">{fmt(ledgerData.summary.opening_balance)} {ledgerData.summary.opening_balance_type}</td>
              </tr>
              {ledgerData.transactions.length === 0 ? (
                <tr><td colSpan="7" className="p-6 text-center text-gray-400">No transactions found.</td></tr>
              ) : (
                ledgerData.transactions.map((tx, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">{tx.date}</td>
                    <td className="p-3 font-bold text-gray-500">{tx.g_code}</td>
                    <td className="p-3 font-medium text-slate-700">{tx.reference}</td>
                    <td className="p-3 text-gray-600">{tx.particulars}</td>
                    <td className="p-3 text-right text-red-600">{tx.debit > 0 ? fmt(tx.debit) : ""}</td>
                    <td className="p-3 text-right text-green-600">{tx.credit > 0 ? fmt(tx.credit) : ""}</td>
                    <td className="p-3 text-right font-semibold text-slate-800">{fmt(tx.balance)} {tx.balance_type}</td>
                  </tr>
                ))
              )}
              <tr className="border-t-2 border-gray-300 bg-gray-100 font-bold text-slate-800">
                <td className="p-3 text-right" colSpan="6">Closing Balance:</td>
                <td className="p-3 text-right text-indigo-700 text-base">{fmt(ledgerData.summary.closing_balance)} {ledgerData.summary.closing_balance_type}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}