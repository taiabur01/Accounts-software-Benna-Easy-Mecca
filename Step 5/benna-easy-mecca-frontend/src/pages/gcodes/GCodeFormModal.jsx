import { useState, useEffect } from "react";
import { createGCode, updateGCode } from "../../api/gcodes";

export default function GCodeFormModal({ gCode, agencies, onClose, onSaved }) {
  const [form, setForm] = useState({ code: "", agency_id: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(gCode);

  useEffect(() => {
    if (gCode) {
      setForm({ code: gCode.code ?? "", agency_id: String(gCode.agency_id ?? "") });
    } else {
      setForm({ code: "", agency_id: agencies[0] ? String(agencies[0].id) : "" });
    }
    setErrors({});
  }, [gCode, agencies]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = { code: form.code, agency_id: Number(form.agency_id) };
      if (isEdit) {
        await updateGCode(gCode.id, payload);
      } else {
        await createGCode(payload);
      }
      onSaved();
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      } else {
        alert("Something went wrong saving the G-Code.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="border-t-4 border-[#2c3e50] rounded-t-lg px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2c3e50]">
            {isEdit ? "Edit G-Code" : "Add New G-Code"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              G-Code *
            </label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. G-101"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#34495e]"
              required
            />
            {errors.code && (
              <p className="text-red-600 text-xs mt-1">{errors.code[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Linked Agency *
            </label>
            <select
              name="agency_id"
              value={form.agency_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              required
            >
              {agencies.length === 0 && <option value="">No agencies yet</option>}
              {agencies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.agency_name} ({a.agency_type})
                </option>
              ))}
            </select>
            {errors.agency_id && (
              <p className="text-red-600 text-xs mt-1">{errors.agency_id[0]}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || agencies.length === 0}
              className="px-4 py-2 text-sm font-bold rounded bg-[#2980b9] text-white hover:bg-[#2471a3] disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Update G-Code" : "Save G-Code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
