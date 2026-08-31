// src/components/entry/ItemRow.jsx
//
// One <tr> in the Invoice or Purchase item table. Selecting an item type
// swaps in the right inputs (from itemTypes.js), auto-calculates the row
// amount as the user types, and shows an optional note field once a type
// is chosen — mirroring the HTML prototype's addRow()/changeItemField().

import { useState } from 'react';
import { ITEM_TYPES, FIELD_META } from '../../config/itemTypes';

export default function ItemRow({ onChange, onRemove }) {
  const [itemType, setItemType] = useState('');
  const [values, setValues] = useState({});
  const [note, setNote] = useState('');

  const config = ITEM_TYPES[itemType];
  const amount = config ? config.calc(values) : 0;

  function emit(nextType, nextValues, nextNote) {
    const cfg = ITEM_TYPES[nextType];
    onChange({
      item_type: nextType,
      details: nextValues,
      note: nextNote,
      amount: cfg ? cfg.calc(nextValues) : 0,
    });
  }

  function handleTypeChange(e) {
    const type = e.target.value;
    setItemType(type);
    setValues({});
    emit(type, {}, note);
  }

  function handleFieldChange(field, val) {
    const next = { ...values, [field]: val };
    setValues(next);
    emit(itemType, next, note);
  }

  function handleNoteChange(val) {
    setNote(val);
    emit(itemType, values, val);
  }

  return (
    <tr className="border-b border-gray-200">
      <td className="p-3 align-top">
        <select
          value={itemType}
          onChange={handleTypeChange}
          className="border border-gray-300 rounded px-2 py-2 text-sm w-full"
        >
          <option value="">-- Select Item --</option>
          {Object.keys(ITEM_TYPES).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </td>
      <td className="p-3 align-top">
        {config ? (
          <div className="flex flex-wrap gap-2">
            {config.fields.map((f) => (
              <input
                key={f}
                type={FIELD_META[f].type}
                placeholder={FIELD_META[f].label}
                value={values[f] ?? ''}
                onChange={(e) => handleFieldChange(f, e.target.value)}
                className="border border-gray-300 rounded px-2 py-2 text-sm w-32"
              />
            ))}
          </div>
        ) : (
          <span className="text-sm text-gray-400">Select an item to view fields</span>
        )}
        {itemType && (
          <input
            type="text"
            placeholder="Write note here (Optional)..."
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            className="mt-2 w-full border border-dashed border-gray-400 rounded px-2 py-2 text-sm bg-gray-50"
          />
        )}
      </td>
      <td className="p-3 align-top">
        <input
          type="number"
          readOnly
          value={amount.toFixed(2)}
          className="border border-gray-300 rounded px-2 py-2 text-sm w-full bg-gray-100 font-semibold"
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
