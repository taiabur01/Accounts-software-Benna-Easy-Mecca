import { useState, useEffect } from "react";
import { createAgency, updateAgency } from "../../api/agencies";

const emptyForm = {
  agency_name: "",
  agency_type: "BD",
  contact_person: "",
  phone: "",
  address: "",
  opening_balance: "0",
  opening_balance_type: "DR",
};

export default function AgencyFormModal({ agency, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(agency);

  useEffect(() => {
    if (agency) {
      setForm({
        agency_name: agency.agency_name ?? "",
        agency_type: agency.agency_type ?? "BD",
        contact_person: agency.contact_person ?? "",
        phone: agency.phone ?? "",
        address: agency.address ?? "",
        opening_balance: String(agency.opening_balance ?? "0"),
        opening_balance_type: agency.opening_balance_type ?? "DR",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [agency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (isEdit) {
        await updateAgency(agency.id, form);
      } else {
        await createAgency(form);
      }
      onSaved();
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      } else {
        alert("Something went wrong saving the agency.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="border-t-4 border-[#2c3e50] rounded-t-lg px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2c3e50]">
            {isEdit ? "Edit Agency" : "Add New Agency"}
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
              Agency Name *
            </label>
            <input
              name="agency_name"
              value={form.agency_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#34495e]"
              required
            />
            {errors.agency_name && (
              <p className="text-red-600 text-xs mt-1">{errors.agency_name[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Agency Type *
              </label>
              <select
                name="agency_type"
                value={form.agency_type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="BD">BD</option>
                <option value="SAUDI">SAUDI</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Phone
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Contact Person
            </label>
            <input
              name="contact_person"
              value={form.contact_person}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Opening Balance
              </label>
              <input
                type="number"
                step="0.01"
                name="opening_balance"
                value={form.opening_balance}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Balance Type
              </label>
              <select
                name="opening_balance_type"
                value={form.opening_balance_type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="DR">DR</option>
                <option value="CR">CR</option>
              </select>
            </div>
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
              disabled={saving}
              className="px-4 py-2 text-sm font-bold rounded bg-[#2980b9] text-white hover:bg-[#2471a3] disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Update Agency" : "Save Agency"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
