import express, { Request, Response } from 'express';
import { db, paginate } from './db';
import { Agency, GCode, InvoiceMaster, PurchaseMaster, PaymentTransaction } from './types';

const router = express.Router();

function strParam(val: any): string {
  if (Array.isArray(val)) return String(val[0] || '');
  return val !== undefined && val !== null ? String(val) : '';
}

// Helper to attach agency to gCode
function populateGCode(gcode: GCode) {
  const agency = db.agencies.find((a) => a.id === gcode.agency_id && !a.deleted_at);
  return {
    ...gcode,
    agency,
  };
}

// Helper to attach gCode and agency to invoice
function populateInvoice(inv: InvoiceMaster) {
  const agency = db.agencies.find((a) => a.id === inv.agency_id);
  const rawGCode = db.gCodes.find((g) => g.id === inv.g_code_id);
  const gCode = rawGCode ? populateGCode(rawGCode) : undefined;
  const items = db.invoiceItems.filter((item) => item.invoice_master_id === inv.id);
  const allocated = db.getInvoiceAllocatedSum(inv.id);
  const due = Math.max(0, Math.round((inv.total_amount - allocated) * 100) / 100);

  return {
    ...inv,
    agency,
    g_code: gCode,
    gCode,
    items,
    attachments: [],
    allocations_sum_allocated_amount: allocated,
    due_amount: due,
  };
}

// Helper to attach gCode and agency to purchase
function populatePurchase(pur: PurchaseMaster) {
  const agency = db.agencies.find((a) => a.id === pur.agency_id);
  const rawGCode = db.gCodes.find((g) => g.id === pur.g_code_id);
  const gCode = rawGCode ? populateGCode(rawGCode) : undefined;
  const items = db.purchaseItems.filter((item) => item.purchase_master_id === pur.id);
  const allocated = db.getPurchaseAllocatedSum(pur.id);
  const due = Math.max(0, Math.round((pur.total_amount - allocated) * 100) / 100);

  return {
    ...pur,
    agency,
    g_code: gCode,
    gCode,
    items,
    attachments: [],
    allocations_sum_allocated_amount: allocated,
    due_amount: due,
  };
}

// Helper to attach relations to payment transaction
function populatePayment(pay: PaymentTransaction) {
  const agency = db.agencies.find((a) => a.id === pay.agency_id);
  const rawGCode = db.gCodes.find((g) => g.id === pay.g_code_id);
  const gCode = rawGCode ? populateGCode(rawGCode) : undefined;
  const allocated = db.getPaymentAllocatedSum(pay.id);
  const unallocated = Math.max(0, Math.round((pay.sar_amount - allocated) * 100) / 100);

  const rawAllocations = db.paymentAllocations.filter(
    (a) => a.payment_transaction_id === pay.id
  );
  const allocations = rawAllocations.map((a) => {
    const isInv =
      a.allocatable_type === 'invoice' ||
      a.allocatable_type === 'App\\Models\\InvoiceMaster';
    let docObj: any = null;
    if (isInv) {
      const doc = db.invoiceMasters.find((inv) => inv.id === a.allocatable_id);
      if (doc) docObj = populateInvoice(doc);
    } else {
      const doc = db.purchaseMasters.find((pur) => pur.id === a.allocatable_id);
      if (doc) docObj = populatePurchase(doc);
    }

    return {
      ...a,
      allocatable: docObj,
    };
  });

  return {
    ...pay,
    agency,
    g_code: gCode,
    gCode,
    allocations,
    allocations_sum_allocated_amount: allocated,
    unallocated_amount: unallocated,
  };
}

// ----------------------------------------------------
// AGENCIES ROUTES
// ----------------------------------------------------

// GET /api/agencies
router.get('/agencies', (req: Request, res: Response) => {
  let list = db.agencies.filter((a) => !a.deleted_at);

  const search = strParam(req.query.search);
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (a) =>
        a.agency_name.toLowerCase().includes(s) ||
        (a.contact_person && a.contact_person.toLowerCase().includes(s)) ||
        (a.phone && a.phone.toLowerCase().includes(s))
    );
  }

  const type = strParam(req.query.agency_type);
  if (type) {
    list = list.filter((a) => a.agency_type === type);
  }

  list.sort((a, b) => a.agency_name.localeCompare(b.agency_name));

  const enriched = list.map((a) => {
    const gCodes = db.gCodes.filter((g) => g.agency_id === a.id);
    return {
      ...a,
      g_codes_count: gCodes.length,
      g_codes: gCodes,
    };
  });

  const page = parseInt(strParam(req.query.page), 10) || 1;
  const perPage = parseInt(strParam(req.query.per_page), 10) || 20;

  res.json(paginate(enriched, page, perPage, '/api/agencies'));
});

// GET /api/agencies/:id
router.get('/agencies/:id', (req: Request, res: Response) => {
  const id = parseInt(strParam(req.params.id), 10);
  const agency = db.agencies.find((a) => a.id === id && !a.deleted_at);
  if (!agency) {
    return res.status(404).json({ message: 'Agency not found.' });
  }

  const gCodes = db.gCodes.filter((g) => g.agency_id === agency.id);
  res.json({
    ...agency,
    g_codes_count: gCodes.length,
    g_codes: gCodes,
  });
});

// POST /api/agencies
router.post('/agencies', (req: Request, res: Response) => {
  const { agency_name, agency_type, contact_person, phone, address, opening_balance, opening_balance_type } = req.body;
  if (!agency_name || !agency_type) {
    return res.status(422).json({
      message: 'Validation failed.',
      errors: {
        agency_name: !agency_name ? ['The agency name field is required.'] : [],
        agency_type: !agency_type ? ['The agency type field is required.'] : [],
      },
    });
  }

  const created = db.createAgency({
    agency_name,
    agency_type,
    contact_person,
    phone,
    address,
    opening_balance,
    opening_balance_type,
  });

  res.status(201).json(created);
});

// PUT /api/agencies/:id
router.put('/agencies/:id', (req: Request, res: Response) => {
  const id = parseInt(strParam(req.params.id), 10);
  const updated = db.updateAgency(id, req.body);
  if (!updated) {
    return res.status(404).json({ message: 'Agency not found.' });
  }

  const gCodes = db.gCodes.filter((g) => g.agency_id === updated.id);
  res.json({
    ...updated,
    g_codes_count: gCodes.length,
    g_codes: gCodes,
  });
});

// DELETE /api/agencies/:id
router.delete('/agencies/:id', (req: Request, res: Response) => {
  const id = parseInt(strParam(req.params.id), 10);
  const hasGCodes = db.gCodes.some((g) => g.agency_id === id);
  if (hasGCodes) {
    return res.status(422).json({
      message: 'Cannot delete an agency that still has G-Codes assigned to it. Remove or reassign its G-Codes first.',
    });
  }

  const deleted = db.deleteAgency(id);
  if (!deleted) {
    return res.status(404).json({ message: 'Agency not found.' });
  }

  res.json({ message: 'Agency deleted.' });
});

// ----------------------------------------------------
// G-CODES ROUTES
// ----------------------------------------------------

// GET /api/g-codes
router.get('/g-codes', (req: Request, res: Response) => {
  let list = [...db.gCodes];

  const search = strParam(req.query.search);
  if (search) {
    const s = search.toLowerCase();
    list = list.filter((g) => g.code.toLowerCase().includes(s));
  }

  const agencyIdStr = strParam(req.query.agency_id);
  if (agencyIdStr) {
    const agencyId = parseInt(agencyIdStr, 10);
    list = list.filter((g) => g.agency_id === agencyId);
  }

  list.sort((a, b) => a.code.localeCompare(b.code));

  const enriched = list.map(populateGCode);

  const page = parseInt(strParam(req.query.page), 10) || 1;
  const perPage = parseInt(strParam(req.query.per_page), 10) || 20;

  res.json(paginate(enriched, page, perPage, '/api/g-codes'));
});

// GET /api/g-codes/:id
router.get('/g-codes/:id', (req: Request, res: Response) => {
  const id = parseInt(strParam(req.params.id), 10);
  const gcode = db.gCodes.find((g) => g.id === id);
  if (!gcode) {
    return res.status(404).json({ message: 'G-Code not found.' });
  }

  res.json(populateGCode(gcode));
});

// POST /api/g-codes
router.post('/g-codes', (req: Request, res: Response) => {
  const { code, agency_id } = req.body;
  if (!code || !agency_id) {
    return res.status(422).json({
      message: 'Validation failed.',
      errors: {
        code: !code ? ['The code field is required.'] : [],
        agency_id: !agency_id ? ['The agency_id field is required.'] : [],
      },
    });
  }

  const created = db.createGCode({ code, agency_id });
  res.status(201).json(populateGCode(created));
});

// PUT /api/g-codes/:id
router.put('/g-codes/:id', (req: Request, res: Response) => {
  const id = parseInt(strParam(req.params.id), 10);
  const updated = db.updateGCode(id, req.body);
  if (!updated) {
    return res.status(404).json({ message: 'G-Code not found.' });
  }

  res.json(populateGCode(updated));
});

// DELETE /api/g-codes/:id
router.delete('/g-codes/:id', (req: Request, res: Response) => {
  const id = parseInt(strParam(req.params.id), 10);
  const deleted = db.deleteGCode(id);
  if (!deleted) {
    return res.status(404).json({ message: 'G-Code not found.' });
  }

  res.json({ message: 'G-Code deleted.' });
});

// ----------------------------------------------------
// INVOICES ROUTES
// ----------------------------------------------------

// GET /api/invoices
router.get('/invoices', (req: Request, res: Response) => {
  const list = [...db.invoiceMasters]
    .filter((inv) => !inv.deleted_at)
    .sort((a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime());

  const enriched = list.map(populateInvoice);
  const page = parseInt(strParam(req.query.page), 10) || 1;
  const perPage = parseInt(strParam(req.query.per_page), 10) || 20;

  res.json(paginate(enriched, page, perPage, '/api/invoices'));
});

// GET /api/invoices/:id
router.get('/invoices/:id', (req: Request, res: Response) => {
  const id = parseInt(strParam(req.params.id), 10);
  const inv = db.invoiceMasters.find((i) => i.id === id && !i.deleted_at);
  if (!inv) {
    return res.status(404).json({ message: 'Invoice not found.' });
  }

  res.json(populateInvoice(inv));
});

// POST /api/invoices
router.post('/invoices', (req: Request, res: Response) => {
  const { invoice_date, g_code_id, items, notes } = req.body;
  if (!invoice_date || !g_code_id || !Array.isArray(items) || items.length === 0) {
    return res.status(422).json({
      message: 'Validation failed.',
      errors: {
        invoice_date: !invoice_date ? ['The invoice date is required.'] : [],
        g_code_id: !g_code_id ? ['The g_code_id is required.'] : [],
        items: !items || items.length === 0 ? ['At least one item is required.'] : [],
      },
    });
  }

  try {
    const created = db.createInvoice({
      invoice_date,
      g_code_id: Number(g_code_id),
      items,
      notes,
    });
    res.status(201).json(populateInvoice(created));
  } catch (err: any) {
    res.status(422).json({ message: err.message || 'Failed to create invoice.' });
  }
});

// ----------------------------------------------------
// PURCHASES ROUTES
// ----------------------------------------------------

// GET /api/purchases
router.get('/purchases', (req: Request, res: Response) => {
  const list = [...db.purchaseMasters]
    .filter((pur) => !pur.deleted_at)
    .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());

  const enriched = list.map(populatePurchase);
  const page = parseInt(strParam(req.query.page), 10) || 1;
  const perPage = parseInt(strParam(req.query.per_page), 10) || 20;

  res.json(paginate(enriched, page, perPage, '/api/purchases'));
});

// GET /api/purchases/:id
router.get('/purchases/:id', (req: Request, res: Response) => {
  const id = parseInt(strParam(req.params.id), 10);
  const pur = db.purchaseMasters.find((p) => p.id === id && !p.deleted_at);
  if (!pur) {
    return res.status(404).json({ message: 'Purchase not found.' });
  }

  res.json(populatePurchase(pur));
});

// POST /api/purchases
router.post('/purchases', (req: Request, res: Response) => {
  const { purchase_date, g_code_id, items, notes } = req.body;
  if (!purchase_date || !g_code_id || !Array.isArray(items) || items.length === 0) {
    return res.status(422).json({
      message: 'Validation failed.',
      errors: {
        purchase_date: !purchase_date ? ['The purchase date is required.'] : [],
        g_code_id: !g_code_id ? ['The g_code_id is required.'] : [],
        items: !items || items.length === 0 ? ['At least one item is required.'] : [],
      },
    });
  }

  try {
    const created = db.createPurchase({
      purchase_date,
      g_code_id: Number(g_code_id),
      items,
      notes,
    });
    res.status(201).json(populatePurchase(created));
  } catch (err: any) {
    res.status(422).json({ message: err.message || 'Failed to create purchase.' });
  }
});

// ----------------------------------------------------
// PAYMENTS ROUTES
// ----------------------------------------------------

// GET /api/payments
router.get('/payments', (req: Request, res: Response) => {
  let list = [...db.paymentTransactions];

  const agencyIdStr = strParam(req.query.agency_id);
  if (agencyIdStr) {
    const agencyId = parseInt(agencyIdStr, 10);
    list = list.filter((p) => p.agency_id === agencyId);
  }

  const txnType = strParam(req.query.transaction_type);
  if (txnType) {
    list = list.filter((p) => p.transaction_type === txnType);
  }

  list.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

  const enriched = list.map(populatePayment);
  const page = parseInt(strParam(req.query.page), 10) || 1;
  const perPage = parseInt(strParam(req.query.per_page), 10) || 20;

  res.json(paginate(enriched, page, perPage, '/api/payments'));
});

// POST /api/payments
router.post('/payments', (req: Request, res: Response) => {
  const { transaction_date, g_code_id, transaction_type, mode_of_payment, bd_amount, exchange_rate, sar_amount, note } = req.body;
  if (!transaction_date || !g_code_id || !transaction_type || !mode_of_payment) {
    return res.status(422).json({
      message: 'Validation failed.',
      errors: {
        transaction_date: !transaction_date ? ['The transaction date is required.'] : [],
        g_code_id: !g_code_id ? ['The g_code_id is required.'] : [],
        transaction_type: !transaction_type ? ['The transaction type is required.'] : [],
        mode_of_payment: !mode_of_payment ? ['The mode of payment is required.'] : [],
      },
    });
  }

  try {
    const created = db.createPayment({
      transaction_date,
      g_code_id: Number(g_code_id),
      transaction_type,
      mode_of_payment,
      bd_amount: bd_amount ? Number(bd_amount) : undefined,
      exchange_rate: exchange_rate ? Number(exchange_rate) : undefined,
      sar_amount: sar_amount ? Number(sar_amount) : undefined,
      note,
    });
    res.status(201).json(populatePayment(created));
  } catch (err: any) {
    res.status(422).json({ message: err.message || 'Failed to record payment.' });
  }
});

// ----------------------------------------------------
// PAYMENT RECONCILIATION / ALLOCATION ROUTES
// ----------------------------------------------------

// GET /api/agencies/:agency/unpaid-invoices
router.get('/agencies/:agency/unpaid-invoices', (req: Request, res: Response) => {
  const agencyId = parseInt(strParam(req.params.agency), 10);
  const list = db.invoiceMasters
    .filter((inv) => inv.agency_id === agencyId && !inv.deleted_at)
    .sort((a, b) => new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime())
    .map(populateInvoice)
    .filter((inv) => (inv.due_amount || 0) > 0);

  res.json(list);
});

// GET /api/agencies/:agency/unpaid-purchases
router.get('/agencies/:agency/unpaid-purchases', (req: Request, res: Response) => {
  const agencyId = parseInt(strParam(req.params.agency), 10);
  const list = db.purchaseMasters
    .filter((pur) => pur.agency_id === agencyId && !pur.deleted_at)
    .sort((a, b) => new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime())
    .map(populatePurchase)
    .filter((pur) => (pur.due_amount || 0) > 0);

  res.json(list);
});

// POST /api/payment-allocations
router.post('/payment-allocations', (req: Request, res: Response) => {
  const { payment_transaction_id, allocations } = req.body;
  if (!payment_transaction_id || !Array.isArray(allocations) || allocations.length === 0) {
    return res.status(422).json({
      message: 'Validation failed.',
      errors: {
        payment_transaction_id: !payment_transaction_id ? ['The payment transaction ID is required.'] : [],
        allocations: !allocations || allocations.length === 0 ? ['At least one allocation is required.'] : [],
      },
    });
  }

  try {
    const created = db.createAllocations({
      payment_transaction_id: Number(payment_transaction_id),
      allocations,
    });

    const enriched = created.map((a) => {
      const isInv = a.allocatable_type === 'App\\Models\\InvoiceMaster';
      let docObj: any = null;
      if (isInv) {
        const doc = db.invoiceMasters.find((i) => i.id === a.allocatable_id);
        if (doc) docObj = populateInvoice(doc);
      } else {
        const doc = db.purchaseMasters.find((p) => p.id === a.allocatable_id);
        if (doc) docObj = populatePurchase(doc);
      }

      const pay = db.paymentTransactions.find((p) => p.id === a.payment_transaction_id);

      return {
        ...a,
        allocatable: docObj,
        payment_transaction: pay ? populatePayment(pay) : null,
        paymentTransaction: pay ? populatePayment(pay) : null,
      };
    });

    res.status(201).json(enriched);
  } catch (err: any) {
    res.status(422).json({
      message: err.message,
      errors: {
        allocations: [err.message],
      },
    });
  }
});

// DELETE /api/payment-allocations/:id
router.delete('/payment-allocations/:id', (req: Request, res: Response) => {
  const id = parseInt(strParam(req.params.id), 10);
  const deleted = db.deleteAllocation(id);
  if (!deleted) {
    return res.status(404).json({ message: 'Allocation not found.' });
  }

  res.json({ message: 'Allocation reversed.' });
});

// GET /api/payment-transactions/:payment/allocations
router.get('/payment-transactions/:payment/allocations', (req: Request, res: Response) => {
  const id = parseInt(strParam(req.params.payment), 10);
  const pay = db.paymentTransactions.find((p) => p.id === id);
  if (!pay) {
    return res.status(404).json({ message: 'Payment transaction not found.' });
  }

  res.json(populatePayment(pay));
});

// ----------------------------------------------------
// LEDGER STATEMENT ROUTE
// ----------------------------------------------------

// GET /api/agencies/:agency/ledger
router.get('/agencies/:agency/ledger', (req: Request, res: Response) => {
  const agencyId = parseInt(strParam(req.params.agency), 10);
  const agency = db.agencies.find((a) => a.id === agencyId && !a.deleted_at);
  if (!agency) {
    return res.status(404).json({ message: 'Agency not found.' });
  }

  const startDate = strParam(req.query.start_date);
  const endDate = strParam(req.query.end_date);
  const gCodeIdStr = strParam(req.query.g_code_id);
  const gCodeId = gCodeIdStr ? parseInt(gCodeIdStr, 10) : undefined;

  // G-Code Isolation Verification
  if (gCodeId) {
    const valid = db.gCodes.some((g) => g.id === gCodeId && g.agency_id === agency.id);
    if (!valid) {
      return res.status(422).json({
        errors: {
          g_code_id: ['This G-Code does not belong to the selected agency.'],
        },
      });
    }
  }

  // 1. Initial Opening Balance
  let openingBalance = gCodeId ? 0 : Number(agency.opening_balance || 0);
  if (!gCodeId && agency.opening_balance_type === 'CR') {
    openingBalance = -openingBalance;
  }

  // 2. Adjust Opening Balance for prior dates
  if (startDate) {
    const priorInvoices = db.invoiceMasters
      .filter((inv) => !inv.deleted_at && inv.agency_id === agency.id)
      .filter((inv) => !gCodeId || inv.g_code_id === gCodeId)
      .filter((inv) => inv.invoice_date < startDate)
      .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

    const priorPurchases = db.purchaseMasters
      .filter((pur) => !pur.deleted_at && pur.agency_id === agency.id)
      .filter((pur) => !gCodeId || pur.g_code_id === gCodeId)
      .filter((pur) => pur.purchase_date < startDate)
      .reduce((sum, pur) => sum + Number(pur.total_amount || 0), 0);

    const priorPaymentsIn = db.paymentTransactions
      .filter((pay) => pay.agency_id === agency.id && pay.transaction_type === 'RECEIVE')
      .filter((pay) => !gCodeId || pay.g_code_id === gCodeId)
      .filter((pay) => pay.transaction_date < startDate)
      .reduce((sum, pay) => sum + Number(pay.sar_amount || 0), 0);

    const priorPaymentsOut = db.paymentTransactions
      .filter((pay) => pay.agency_id === agency.id && pay.transaction_type === 'PAYMENT')
      .filter((pay) => !gCodeId || pay.g_code_id === gCodeId)
      .filter((pay) => pay.transaction_date < startDate)
      .reduce((sum, pay) => sum + Number(pay.sar_amount || 0), 0);

    openingBalance += priorInvoices;
    openingBalance -= priorPurchases;
    openingBalance -= priorPaymentsIn;
    openingBalance += priorPaymentsOut;
  }

  // 3. Transactions within Date Range
  const invoicesRaw = db.invoiceMasters
    .filter((inv) => !inv.deleted_at && inv.agency_id === agency.id)
    .filter((inv) => !gCodeId || inv.g_code_id === gCodeId)
    .filter((inv) => !startDate || inv.invoice_date >= startDate)
    .filter((inv) => !endDate || inv.invoice_date <= endDate);

  const purchasesRaw = db.purchaseMasters
    .filter((pur) => !pur.deleted_at && pur.agency_id === agency.id)
    .filter((pur) => !gCodeId || pur.g_code_id === gCodeId)
    .filter((pur) => !startDate || pur.purchase_date >= startDate)
    .filter((pur) => !endDate || pur.purchase_date <= endDate);

  const paymentsRaw = db.paymentTransactions
    .filter((pay) => pay.agency_id === agency.id)
    .filter((pay) => !gCodeId || pay.g_code_id === gCodeId)
    .filter((pay) => !startDate || pay.transaction_date >= startDate)
    .filter((pay) => !endDate || pay.transaction_date <= endDate);

  const gCodeMap = new Map(db.gCodes.map((g) => [g.id, g.code]));

  const invoices = invoicesRaw.map((inv) => ({
    date: inv.invoice_date,
    type: 'INVOICE',
    reference: inv.invoice_no,
    particulars: 'Invoice / Sales',
    g_code: gCodeMap.get(inv.g_code_id) || '',
    debit: Number(inv.total_amount || 0),
    credit: 0,
    created_at: inv.created_at,
  }));

  const purchases = purchasesRaw.map((pur) => ({
    date: pur.purchase_date,
    type: 'PURCHASE',
    reference: pur.purchase_no,
    particulars: 'Purchase / Bill',
    g_code: gCodeMap.get(pur.g_code_id) || '',
    debit: 0,
    credit: Number(pur.total_amount || 0),
    created_at: pur.created_at,
  }));

  const payments = paymentsRaw.map((pay) => {
    const isReceive = pay.transaction_type === 'RECEIVE';
    return {
      date: pay.transaction_date,
      type: 'PAYMENT',
      reference: pay.voucher_no,
      particulars: `Payment ${isReceive ? 'Received' : 'Sent'} - ${pay.mode_of_payment}`,
      g_code: gCodeMap.get(pay.g_code_id) || '',
      debit: isReceive ? 0 : Number(pay.sar_amount || 0),
      credit: isReceive ? Number(pay.sar_amount || 0) : 0,
      created_at: pay.created_at,
    };
  });

  // 4. Merge, Sort, and Calculate Running Balance
  const transactions = [...invoices, ...purchases, ...payments].sort((a, b) => {
    const dDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dDiff !== 0) return dDiff;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  let runningBalance = openingBalance;
  const ledger = transactions.map((t) => {
    runningBalance += t.debit;
    runningBalance -= t.credit;
    return {
      ...t,
      balance: Math.round(Math.abs(runningBalance) * 100) / 100,
      balance_type: runningBalance >= 0 ? 'DR' : 'CR',
    };
  });

  // 5. Allocation sum
  const invoiceIds = new Set(invoicesRaw.map((i) => i.id));
  const purchaseIds = new Set(purchasesRaw.map((p) => p.id));
  const paymentIds = new Set(paymentsRaw.map((p) => p.id));

  const totalReconciled = db.paymentAllocations
    .filter((a) => {
      if (paymentIds.has(a.payment_transaction_id)) return true;
      const isInv =
        a.allocatable_type === 'invoice' ||
        a.allocatable_type === 'App\\Models\\InvoiceMaster';
      if (isInv && invoiceIds.has(a.allocatable_id)) return true;
      const isPur =
        a.allocatable_type === 'purchase' ||
        a.allocatable_type === 'App\\Models\\PurchaseMaster';
      if (isPur && purchaseIds.has(a.allocatable_id)) return true;
      return false;
    })
    .reduce((sum, a) => sum + Number(a.allocated_amount || 0), 0);

  const totalInvoiced = invoicesRaw.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);
  const totalPurchased = purchasesRaw.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
  const totalReceived = paymentsRaw
    .filter((p) => p.transaction_type === 'RECEIVE')
    .reduce((sum, p) => sum + Number(p.sar_amount || 0), 0);
  const totalPaid = paymentsRaw
    .filter((p) => p.transaction_type === 'PAYMENT')
    .reduce((sum, p) => sum + Number(p.sar_amount || 0), 0);

  res.json({
    summary: {
      agency_name: agency.agency_name,
      agency_type: agency.agency_type,
      opening_balance: Math.round(Math.abs(openingBalance) * 100) / 100,
      opening_balance_type: openingBalance >= 0 ? 'DR' : 'CR',
      total_invoiced: Math.round(totalInvoiced * 100) / 100,
      total_purchased: Math.round(totalPurchased * 100) / 100,
      total_received: Math.round(totalReceived * 100) / 100,
      total_paid: Math.round(totalPaid * 100) / 100,
      total_reconciled: Math.round(totalReconciled * 100) / 100,
      closing_balance: Math.round(Math.abs(runningBalance) * 100) / 100,
      closing_balance_type: runningBalance >= 0 ? 'DR' : 'CR',
    },
    transactions: ledger,
  });
});

export default router;
