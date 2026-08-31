import { useState, useEffect, useCallback } from "react";
import { fetchGCodes, deleteGCode } from "../../api/gcodes";
import { fetchAllAgenciesForDropdown } from "../../api/agencies";
import GCodeFormModal from "./GCodeFormModal";

export default function GCodeList() {
  const [data, setData] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [agencyFilter, setAgencyFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGCode, setEditingGCode] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchGCodes({
      search: search || undefined,
      agency_id: agencyFilter || undefined,
      page,
      per_page: 15,
    })
      .then(setData)
      .catch(() => alert("Failed to load G-Codes. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [search, agencyFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchAllAgenciesForDropdown().then(setAgencies);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, agencyFilter]);

  const handleAdd = () => {
    setEditingGCode(null);
    setModalOpen(true);
  };

  const handleEdit = (gCode) => {
    setEditingGCode(gCode);
    setModalOpen(true);
  };

  const handleDelete = async (gCode) => {
    if (!confirm(`Delete G-Code "${gCode.code}"?`)) return;
    try {
      await deleteGCode(gCode.id);
      load();
    } catch (err) {
      alert(err.response?.data?.message ?? "Failed to delete G-Code.");
    }
  };

  const handleSaved = () => {
    setModalOpen(false);
    load();
    // Agency g-code counts may have changed, but the agency list refetches
    // itself when the user navigates there, so nothing else to sync here.
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#2c3e50]">G-Codes</h1>
        <button
          onClick={handleAdd}
          disabled={agencies.length === 0}
          className="bg-[#34495e] text-white text-sm font-bold px-4 py-2 rounded hover:bg-[#2c3e50] disabled:opacity-50"
        >
          + Add G-Code
        </button>
      </div>

      {agencies.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded px-4 py-3 mb-4">
          No agencies exist yet. Add an agency first before creating a G-Code.
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#34495e]"
        />
        <select
          value={agencyFilter}
          onChange={(e) => setAgencyFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All Agencies</option>
          {agencies.map((a) => (
            <option key={a.id} value={a.id}>
              {a.agency_name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-[#2c3e50] text-xs uppercase">
              <th className="px-4 py-3">G-Code</th>
              <th className="px-4 py-3">Linked Agency</th>
              <th className="px-4 py-3">Agency Type</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && data?.data?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  No G-Codes found.
                </td>
              </tr>
            )}
            {!loading &&
              data?.data?.map((gCode) => (
                <tr key={gCode.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-[#2c3e50]">{gCode.code}</td>
                  <td className="px-4 py-3">{gCode.agency?.agency_name ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        gCode.agency?.agency_type === "BD"
                          ? "bg-blue-100 text-[#2980b9]"
                          : "bg-red-100 text-[#c0392b]"
                      }`}
                    >
                      {gCode.agency?.agency_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(gCode)}
                      className="text-[#2980b9] hover:underline text-xs font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(gCode)}
                      className="text-[#e74c3c] hover:underline text-xs font-bold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {data && data.last_page > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>
            Showing {data.from}-{data.to} of {data.total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40"
            >
              Prev
            </button>
            <span className="px-2 py-1">
              Page {data.current_page} / {data.last_page}
            </span>
            <button
              disabled={page >= data.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {modalOpen && (
        <GCodeFormModal
          gCode={editingGCode}
          agencies={agencies}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
