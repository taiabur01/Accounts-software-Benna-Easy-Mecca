// src/hooks/useGCodeLookup.js
//
// REPLACES useAgencyLookup.js — delete that old file, it assumed G-Code
// was a field on the agency itself. It isn't: G-Codes are their own
// table (src/api/gcodes.js), each one linked to one agency via
// agency_id, and GET /g-codes returns each record with its agency
// nested: { id, code, agency_id, agency: { id, agency_name, agency_type } }.
//
// This hook loads all G-Codes once and builds:
//  - codes: the list, optionally filtered to one agency_type ("BD"/"SAUDI")
//  - byCode: a { "G-101": {g-code record incl. .agency} } lookup map

import { useEffect, useState, useMemo } from 'react';
import { fetchAllGCodesForDropdown } from '../api/gcodes';

export default function useGCodeLookup(agencyType) {
  const [gcodes, setGcodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAllGCodesForDropdown()
      .then((list) => {
        if (!cancelled) {
          setGcodes(list || []);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => (agencyType ? gcodes.filter((g) => g.agency?.agency_type === agencyType) : gcodes),
    [gcodes, agencyType]
  );

  const byCode = useMemo(() => {
    const map = {};
    filtered.forEach((g) => {
      map[g.code] = g;
    });
    return map;
  }, [filtered]);

  return { codes: filtered, byCode, loading, error };
}
