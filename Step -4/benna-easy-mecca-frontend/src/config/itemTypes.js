// src/config/itemTypes.js
//
// FIELD NAMES CONFIRMED against StoreInvoiceRequest.php / StorePurchaseRequest.php
// (not guessed). Key change: the fixed-amount field is "sale_amount",
// not "amount" — items.*.details.sale_amount is what the backend
// validates for TRANSPORT, NAQABA-FINE and ESCAPED FINE TO.
//
// NOTE: "name" and "passport" (for ESCAPED FINE TO / MULTIPLE VISA) are
// collected here for the UI but are NOT in the backend's validation
// rules, so Laravel's $request->validated() currently strips them
// before saving. They're kept in the form in case the backend rules
// get updated to include them — until then they won't persist.

export const ITEM_TYPES = {
  'UMRAH VISA': {
    fields: ['pax', 'rate'],
    calc: (v) => (Number(v.pax) || 0) * (Number(v.rate) || 0),
  },
  'BRN CHARGE': {
    fields: ['pax', 'rate'],
    calc: (v) => (Number(v.pax) || 0) * (Number(v.rate) || 0),
  },
  TRANSPORT: {
    fields: ['sale_amount'],
    calc: (v) => Number(v.sale_amount) || 0,
  },
  'NAQABA-FINE': {
    fields: ['sale_amount'],
    calc: (v) => Number(v.sale_amount) || 0,
  },
  'ESCAPED FINE TO': {
    fields: ['name', 'passport', 'sale_amount'],
    calc: (v) => Number(v.sale_amount) || 0,
  },
  HOTEL: {
    fields: ['nights', 'rooms', 'rate'],
    calc: (v) => (Number(v.nights) || 0) * (Number(v.rooms) || 0) * (Number(v.rate) || 0),
  },
  'MULTIPLE VISA': {
    fields: ['name', 'passport', 'pax', 'rate'],
    calc: (v) => (Number(v.pax) || 0) * (Number(v.rate) || 0),
  },
};

// Label + input type per field key, used to render inputs generically
// inside ItemRow without repeating markup per item type.
export const FIELD_META = {
  pax: { label: 'PAX', type: 'number' },
  rate: { label: 'Rate', type: 'number' },
  sale_amount: { label: 'Amount', type: 'number' },
  nights: { label: 'Nights', type: 'number' },
  rooms: { label: 'Rooms', type: 'number' },
  name: { label: 'Name', type: 'text' },
  passport: { label: 'Passport', type: 'text' },
};
