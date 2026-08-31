# Hajj & Umrah ERP System — AI Prompt Reference Guide
**Stack:** Laravel (Backend/API) + React.js (Frontend) + MySQL

এই ডকুমেন্টে ধাপে ধাপে AI (Claude/ChatGPT ইত্যাদি) দিয়ে সম্পূর্ণ ERP সিস্টেম বানানোর জন্য প্রম্পটগুলো সাজানো আছে। **নিচের ক্রম অনুযায়ী প্রম্পটগুলো ব্যবহার করুন** — প্রতিটা পরবর্তী ধাপ আগের ধাপের উপর নির্ভরশীল।

---

## Execution Order Overview

| ধাপ | প্রম্পট | মডিউল | নির্ভরশীলতা |
|---|---|---|---|
| ১ | Database Schema | Migration, Models | কোনোটা না — ভিত্তি |
| ২ | API & Business Logic | Controllers, Validation | ধাপ ১ |
| ৩ | Master Data CRUD | Agency, G-Code | ধাপ ১, ২ |
| ৪ | Frontend Entry Forms | Invoice/Purchase/Payment UI | ধাপ ২, ৩ |
| ৫ | Payment Reconciliation | Allocation Engine | ধাপ ২, ৪ |
| ৬ | Ledger & Statement | Dashboard, Reports | ধাপ ৫ |
| ৭ | Edit/Delete/Audit | Soft Delete, Sync Logic | ধাপ ২, ৪ |
| ৮ | Auth & RBAC | Sanctum, Roles | সব মডিউল |
| ৯ | Print/PDF Generation | Invoice/Voucher PDF | ধাপ ২, ৪ |
| ১০ | Dashboard/KPI | Summary, Charts | ধাপ ৬ |
| ১১ | Seeder/Deployment | Demo data, .env, CORS | সবশেষে |

---

## প্রম্পট ১: ডেটাবেজ স্কিমা ও মাইগ্রেশন (Database & Schema)

```
Act as a Senior Backend Architect specializing in PHP (Laravel) and MySQL.

I am building an internal B2B ERP and Accounting System for a Hajj & Umrah Travel Agency.
The system consists of three distinct modules:
1. Sales / Invoice Entry (Receivable from BD Agencies)
2. Purchase / Bill Entry (Payable to Saudi Agencies)
3. Payment / Money Receive (Financial transactions)

Key Requirements:
- Use a Master-Detail relational database architecture to handle dynamic multi-item entries per transaction.
- Items supported in both Invoice and Purchase: UMRAH VISA, BRN CHARGE, TRANSPORT, NAQABA-FINE, ESCAPED FINE TO, HOTEL, MULTIPLE VISA.
- G-Code auto-mapping to Agency Names (agencies table linked via G-Code).
- Item details should store structured dynamic inputs (like PAX, Rates, Nights, Rooms, Passport numbers) and notes per item.
- Strict ACID transaction support with rollback mechanisms for batch inserts.

Additional Requirements:
- Add an `agencies` table field for `opening_balance` and `opening_balance_type` (Dr/Cr).
- Add a `document_type_prefix` based auto-numbering system for Invoice No, Purchase No, and Voucher No 
  (e.g., INV-2026-00001), reset per financial year.
- Add proper composite indexes on (agency_id, transaction_date) and (g_code) for all master tables, 
  since this system will scale to large transaction volumes.
- Add an `exchange_rates` table (date, rate) to store historical SAR-BDT conversion rates instead of 
  ad-hoc rate entry per transaction.
- Add `attachments` table (polymorphic) to store uploaded documents (passport copy, visa copy) linked 
  to invoice/purchase items.

Generate:
1. Complete MySQL database schema migrations (Laravel Migration files).
2. Eloquent Models with explicit relationships (InvoiceMaster, InvoiceItem, PurchaseMaster, PurchaseItem, PaymentTransaction, Agency).
```

---

## প্রম্পট ২: ব্যাকএন্ড এপিআই ও বিজনেস লজিক (API & Calculations)

```
Act as a Senior Laravel Developer. Based on the database schema generated previously, create the backend REST API controllers and service layers.

Business Logic & Formula Requirements:
1. Invoice Item Calculation:
   - HOTEL: Nights * Rooms * Rate
   - UMRAH VISA / BRN CHARGE / MULTIPLE VISA: PAX * Rate
   - TRANSPORT / NAQABA-FINE / ESCAPED FINE: Fixed Sale Amount
2. Purchase Item Calculation:
   - Identical logic to calculate Purchase Amounts per item.
3. Payment / Money Receive:
   - If Payment Type is "PAYMENT" (To Saudi Agency), calculate SAR Amount = (BD Amount in BDT / Conversion Rate).
   - If "RECEIVE", directly take the SAR Amount.
4. Batch Insertion:
   - Implement DB::transaction to process and validate all dynamic child rows in a single batch query.
   - Include validation rules for each item type.

Generate:
1. API Routes (routes/api.php).
2. Form Request Validation classes.
3. Controller methods (storeInvoice, storePurchase, storePayment).
```

---

## প্রম্পট ৩: মাস্টার ডেটা ম্যানেজমেন্ট (Agency & Setup CRUD)

```
Act as a Full-Stack Developer. I need the Master Data Management (CRUD) modules for the ERP system.

Requirements:
1. Agency Management:
   - Create interfaces to Add, Edit, View, and Delete Agencies.
   - Fields: Agency Name, Agency Type (BD or Saudi), Contact Person, Phone, Address, Opening Balance, Opening Balance Type.
2. G-Code Management:
   - Create CRUD for G-Codes and map them to specific Agencies.
3. API & Frontend:
   - Build Laravel API resources for these operations.
   - Build React.js data tables (using libraries like React Table or DataGrid) with pagination, search, and action buttons (Edit/Delete).
```

---

## প্রম্পট ৪: ফ্রন্টএন্ড ইন্টিগ্রেশন (React.js UI & Dynamic Forms)

```
Act as a Senior Full-Stack React.js Developer. Build the front-end interface matching our working prototype with 3 independent entry views:

1. Invoice Entry Form:
   - Master fields: Date, G-Code (with auto-complete search that automatically fills BD Agency Name).
   - Dynamic spreadsheet-style grid supporting 7 products: UMRAH VISA, BRN CHARGE, TRANSPORT, NAQABA-FINE, ESCAPED FINE TO, HOTEL, MULTIPLE VISA.
   - Dynamic input fields based on product selection, optional row-level Note field, auto row calculation, and Real-time Total Receivable amount at the bottom.

2. Purchase Entry Form:
   - Master fields: Date, G-Code (Auto-fills Saudi Agency Name).
   - Same 7 dynamic products calculating Total Payable amount.

3. Payment / Money Receive Form:
   - Transaction Type Toggle (Receive vs Payment).
   - For "PAYMENT", show BD Amount and Rate inputs to compute SAR automatically.
   - Note field per transaction row.

Generate clean, component-based React code using Tailwind CSS or standard CSS, with Axios integration to submit payload to the Laravel backend.
```

---

## প্রম্পট ৫: পেমেন্ট রিকনসিলিয়েশন / অ্যালোকেশন (Payment Allocation Engine)

```
Act as a Senior Backend Architect. We need a Payment Reconciliation module to link Payment/Receive 
transactions against specific Invoices or Purchase Bills.

Requirements:
1. Create a `payment_allocations` pivot table linking `payment_transactions` to `invoice_masters` 
   or `purchase_masters` (with allocated_amount per link).
2. Support both:
   - Manual Allocation: User selects which invoice(s) a payment should be applied against 
     (partial allocation allowed).
   - Auto Allocation (optional mode): FIFO-based, oldest unpaid invoice first.
3. Prevent over-allocation (allocated amount cannot exceed invoice due amount).
4. Update Agency Ledger calculation to use actual allocation records instead of simple aggregation, 
   for accurate Due/Advance status per invoice.
5. Build API endpoints: allocatePayment, getUnpaidInvoices(agencyId), getAllocationHistory.
6. Build a React UI: a "Reconcile Payment" screen showing outstanding invoices for the selected 
   agency with checkboxes/amount inputs to allocate.

Generate migrations, models, controller logic, and React component.
```

---

## প্রম্পট ৬: লেজার এবং স্টেটমেন্ট ড্যাশবোর্ড (Ledger & Statement Generation)

```
Act as an ERP Financial Logic Expert. Create the automated Agency Ledger generation endpoint and UI view.

Ledger Generation Logic:
- User filters by Agency ID (or G-Code) and Date Range.
- The system must aggregate:
  1. Total Invoiced (Sales/Receivables) from `invoice_masters`
  2. Total Billed (Purchases/Payables) from `purchase_masters`
  3. Total Money Received from `payment_transactions`
  4. Total Payments Sent from `payment_transactions`
- Compute Net Due / Advance Balance using actual `payment_allocations` records:
  Opening Balance + (Total Receivables - Total Payments Received) - (Total Payables - Total Payments Sent)
- Render an exportable, printable chronological transaction ledger table (Date, Particulars/Item, Reference/G-Code, Debit, Credit, Running Balance).

Generate the Laravel controller query using efficient SQL aggregation and the corresponding React dashboard view.
```

---

## প্রম্পট ৭: ট্রানজেকশন এডিট, ডিলিট এবং অডিট ট্রেইল (Edit Entries & Audit)

```
Act as a Senior Backend Architect. The core entry modules (Invoice, Purchase, Payment) are built, but we need the ability to update and manage existing records securely.

Requirements:
1. Update & Delete Logic:
   - Create Laravel API endpoints to Edit and Delete existing `invoice_masters`, `purchase_masters`, and `payment_transactions` along with their child items.
   - When updating an invoice, the system must properly sync (add/update/remove) the dynamic child rows (JSON details and amounts) without breaking the ledger balance.
2. Frontend Edit Mode:
   - Update the React Entry Forms to support "Edit Mode" (pre-filling existing data into the dynamic grid).
3. Audit Trail (Soft Deletes):
   - Implement Soft Deletes in Laravel so deleted financial records are hidden but kept in the database for auditing.
   - Prevent deletion of an invoice if a payment has already been linked/reconciled against it (optional strict mode).
```

---

## প্রম্পট ৮: লগইন, সিকিউরিটি এবং ইউজার রোল (Auth & Role-Based Access)

```
Act as a Laravel Security & Authentication Expert. Implement Role-Based Access Control (RBAC) for the ERP system.

Requirements:
1. Authentication:
   - Implement secure login/logout using Laravel Sanctum (API token authentication) for the React frontend.
2. User Roles & Permissions:
   - Create two primary roles: "Admin" and "Staff".
   - Admin: Has full access to CRUD operations, Ledger, and can delete entries.
   - Staff: Can only Add/View entries. Cannot Delete or Edit finalized transactions without Admin approval.
3. Frontend Route Protection:
   - Implement protected routes in React (e.g., using React Router) to redirect unauthorized users to the login screen.
   - Hide "Delete" and "Edit" buttons in the UI if the logged-in user is a "Staff".
```

---

## প্রম্পট ৯: ভাউচার/ইনভয়েস প্রিন্ট ও ডকুমেন্ট জেনারেশন

```
Act as a Full-Stack Laravel Developer. Build individual document print/export functionality.

Requirements:
1. Generate a printable Invoice PDF (Company Letterhead, Agency details, itemized table, total, 
   signature area) using Laravel DomPDF or similar.
2. Generate a Purchase Bill PDF (Saudi Agency format).
3. Generate a Payment Voucher/Receipt PDF.
4. Add a "Print" and "Download PDF" button on each entry's detail view in React.
5. Include company branding (logo, header, footer) as configurable settings from an admin panel.

Generate the Laravel PDF service class and corresponding React trigger buttons.
```

---

## প্রম্পট ১০: ড্যাশবোর্ড ও KPI সামারি

```
Act as a Senior Full-Stack Developer. Build the main Dashboard (landing page after login).

Requirements:
1. Backend: Create a DashboardController with aggregated queries for:
   - Total Receivable (all-time and current month)
   - Total Payable (all-time and current month)
   - Today's Cash In / Cash Out
   - Top 5 Agencies by Outstanding Due
   - Monthly Invoice vs Purchase trend (last 6 months)
2. Optimize these queries using indexed columns and caching (cache for 5-10 minutes, 
   invalidate on new transaction).
3. Frontend: Build a React dashboard with summary cards and charts (using Recharts or Chart.js).

Generate the Laravel controller with optimized SQL and the React dashboard page.
```

---

## প্রম্পট ১১: এনভায়রনমেন্ট, সিডার ও ডিপ্লয়মেন্ট

```
Act as a DevOps-aware Laravel Developer. Prepare the project for local development and deployment.

Requirements:
1. Create Laravel Database Seeders with realistic demo data (Agencies, G-Codes, sample Invoices/
   Purchases/Payments) for testing.
2. Provide a sample `.env.example` with necessary variables (DB, Sanctum domain, mail if needed).
3. Provide instructions for CORS configuration (Sanctum + React on separate origin/port).
4. Provide a basic production build guide: React build → served via Laravel public or separate 
   Nginx config; Laravel queue/cache setup recommendations for production.

Generate the seeder files, .env.example, and a short deployment checklist.
```

---

## ব্যবহারের নির্দেশনা (How to Use)

1. প্রতিটা প্রম্পট **একটা নতুন AI conversation-এ** আলাদাভাবে দিন — তবে আগের ধাপের generated schema/code পরবর্তী প্রম্পটের সাথে context হিসেবে দিতে হবে (বিশেষত প্রম্পট ২ থেকে ১১ পর্যন্ত, কারণ এগুলো প্রম্পট ১-এর schema-র উপর নির্ভরশীল)।
2. প্রতিটা ধাপের কোড **generate হওয়ার পরপরই টেস্ট করে** পরবর্তী ধাপে যান — শেষে সব একসাথে ডিবাগ করা কঠিন হয়ে যাবে।
3. প্রম্পট ৫ (Payment Reconciliation) স্কিপ করবেন না — এটা ছাড়া Ledger-এর Due/Advance হিসাব ভুল হবে।
4. প্রোডাকশনে যাওয়ার আগে প্রম্পট ১-এর `attachments`, `exchange_rates`, এবং `document_type_prefix` অংশগুলো অবশ্যই implement করুন — এগুলো পরে যোগ করা কঠিন হয়ে যায় কারণ existing data-র সাথে migrate করতে হবে।

---

*Generated for Al-Maqam Hajj & Umrah ERP System — Laravel + React.js Stack*
