import { useState } from "react";
import AgencyList from "./pages/agencies/AgencyList";
import GCodeList from "./pages/gcodes/GCodeList";
import InvoiceEntryForm from "./pages/InvoiceEntryForm";
import PurchaseEntryForm from "./pages/PurchaseEntryForm";
import PaymentEntryForm from "./pages/PaymentEntryForm";
import ReconcilePayment from "./pages/ReconcilePayment";
import Ledger from "./pages/Ledger"; // <-- নতুন ইমপোর্ট

const TABS = [
  { key: "agencies", label: "Agencies" },
  { key: "gcodes", label: "G-Codes" },
  { key: "invoice", label: "Invoice Entry" },
  { key: "purchase", label: "Purchase Entry" },
  { key: "payment", label: "Payment / Receive" },
  { key: "reconcile", label: "Reconcile Payment" },
  { key: "ledger", label: "Ledger & Statement" }, // <-- নতুন ট্যাব
];

export default function App() {
  const [tab, setTab] = useState("agencies");

  return (
    <div className="min-h-screen bg-[#e9ecef]">
      <nav className="bg-[#2c3e50] px-6 py-3 flex gap-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-sm font-bold px-3 py-1.5 rounded whitespace-nowrap ${
              tab === t.key
                ? "bg-white text-[#2c3e50]"
                : "text-white hover:bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="py-8">
        {tab === "agencies" && <AgencyList />}
        {tab === "gcodes" && <GCodeList />}
        {tab === "invoice" && <InvoiceEntryForm />}
        {tab === "purchase" && <PurchaseEntryForm />}
        {tab === "payment" && <PaymentEntryForm />}
        {tab === "reconcile" && <ReconcilePayment />}
        {tab === "ledger" && <Ledger />} {/* <-- রেন্ডার অপশন */}
      </div>
    </div>
  );
}