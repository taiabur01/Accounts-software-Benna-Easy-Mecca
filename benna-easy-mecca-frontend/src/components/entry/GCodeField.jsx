// src/components/entry/GCodeField.jsx
//
// UPDATED: onChange now passes (code, gcodeRecord) where gcodeRecord
// is the full matched G-Code row — { id, code, agency_id, agency: {...} }
// — or null. The backend's invoice/purchase/payment endpoints expect
// g_code_id (the G-Code's own id), so callers need that id, not just
// the linked agency.

import useGCodeLookup from '../../hooks/useGCodeLookup';

export default function GCodeField({ agencyType, label, gCode, onChange }) {
  const { byCode, codes, loading } = useGCodeLookup(agencyType);
  const listId = `gcode-list-${agencyType || 'all'}`;
  const matched = byCode[gCode.toUpperCase()];
  const agency = matched?.agency ?? null;

  return (
    <>
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-500 mb-1">
          G-Code (Type to Search)
        </label>
        <input
          type="text"
          list={listId}
          value={gCode}
          placeholder={loading ? 'Loading G-Codes...' : 'Search G-Code...'}
          onChange={(e) => {
            const code = e.target.value;
            onChange(code, byCode[code.toUpperCase()] ?? null);
          }}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-slate-700"
        />
        <datalist id={listId}>
          {codes.map((g) => (
            <option key={g.id} value={g.code} />
          ))}
        </datalist>
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-500 mb-1">{label}</label>
        <input
          type="text"
          readOnly
          value={agency ? agency.agency_name : ''}
          placeholder="Auto-filled from G-Code"
          className="border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 font-semibold text-slate-800 cursor-not-allowed"
        />
      </div>
    </>
  );
}
