// src/components/entry/PaymentRow.jsx
//
// One row in the Payment / Money Receive table. When txnType is
// "PAYMENT" it shows BD Amount + Rate and auto-computes
// SAR Amount = BD Amount / Rate (per Prompt 2's business logic).
// When txnType is "RECEIVE", the SAR amount is entered directly.

import { useEffect, useState } from 'react';

const PAYMENT_MODES = ['Cash (IN HAND)', 'Bank Transfer', 'ATM'];

export default function PaymentRow({ txnType, onChange, onRemove }) {
  const isPayment = txnType === 'PAYMENT';
  const [mode, setMode] = useState(PAYMENT_MODES[0]);
  const [bdAmount, setBdAmount] = useState('');
  const [rate, setRate] = useState('');
  const [sarAmount, setSarAmount] = useState('');
  const [note, setNote] = useState('');

  const computedSar = isPayment
    ? (Number(bdAmount) > 0 && Number(rate) > 0 ? Number(bdAmount) / Number(rate) : 0)
    : Number(sarAmount) || 0;

  useEffect(() => {
    onChange({
      mode_of_payment: mode,
      bd_amount: isPayment ? Number(bdAmount) || 0 : null,
      rate: isPayment ? Number(rate) || 0 : null,
      note,
      amount: computedSar,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, bdAmount, rate, sarAmount, note, isPayment]);

  return (
    <tr className="border-b border-gray-200">
      <td className="p-3 align-top">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="border border-gray-300 rounded px-2 py-2 text-sm w-full"
        >
          {PAYMENT_MODES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </td>
      {isPayment && (
        <>
          <td className="p-3 align-top">
            <input
              type="number"
              placeholder="BD Amount"
              value={bdAmount}
              onChange={(e) => setBdAmount(e.target.value)}
              className="border border-gray-300 rounded px-2 py-2 text-sm w-full"
            />
          </td>
          <td className="p-3 align-top">
            <input
              type="number"
              placeholder="Rate"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-2 text-sm w-full"
            />
          </td>
        </>
      )}
      <td className="p-3 align-top">
        <input
          type="text"
          placeholder="Write note here (e.g. Check No, Sender Name)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="border border-gray-300 rounded px-2 py-2 text-sm w-full"
        />
      </td>
      <td className="p-3 align-top">
        <input
          type="number"
          readOnly={isPayment}
          value={isPayment ? computedSar.toFixed(2) : sarAmount}
          onChange={(e) => !isPayment && setSarAmount(e.target.value)}
          className={`border border-gray-300 rounded px-2 py-2 text-sm w-full ${
            isPayment ? 'bg-gray-100 font-semibold' : ''
          }`}
        />
      </td>
      <td className="p-3 align-top">
        <button
          type="button"
          onClick={onRemove}
          className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded"
        >
          X
        </button>
      </td>
    </tr>
  );
}
