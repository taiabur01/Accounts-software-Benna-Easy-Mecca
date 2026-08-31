import {
  Agency,
  GCode,
  InvoiceMaster,
  InvoiceItem,
  PurchaseMaster,
  PurchaseItem,
  PaymentTransaction,
  PaymentAllocation,
  DocumentNumberSequence,
} from './types';

// In-Memory Database
export class InMemoryDB {
  agencies: Agency[] = [
    {
      id: 1,
      agency_name: 'Test BD Agency',
      agency_type: 'BD',
      contact_person: null,
      phone: null,
      address: null,
      opening_balance: 0.0,
      opening_balance_type: 'DR',
      created_at: '2026-08-30T13:00:00.000Z',
      updated_at: '2026-08-30T13:00:00.000Z',
      deleted_at: null,
    },
    {
      id: 2,
      agency_name: 'Test Saudi Agency',
      agency_type: 'SAUDI',
      contact_person: null,
      phone: null,
      address: null,
      opening_balance: 0.0,
      opening_balance_type: 'DR',
      created_at: '2026-08-30T13:00:00.000Z',
      updated_at: '2026-08-30T13:00:00.000Z',
      deleted_at: null,
    },
  ];

  gCodes: GCode[] = [
    {
      id: 1,
      code: 'G001',
      agency_id: 1,
      created_at: '2026-08-30T13:00:00.000Z',
      updated_at: '2026-08-30T13:00:00.000Z',
    },
    {
      id: 2,
      code: 'G002',
      agency_id: 2,
      created_at: '2026-08-30T13:00:00.000Z',
      updated_at: '2026-08-30T13:00:00.000Z',
    },
  ];

  sequences: DocumentNumberSequence[] = [
    { id: 1, document_type: 'INV', financial_year: '2026', last_number: 3 },
    { id: 2, document_type: 'PUR', financial_year: '2026', last_number: 4 },
    { id: 3, document_type: 'VOU', financial_year: '2026', last_number: 4 },
  ];

  invoiceMasters: InvoiceMaster[] = [
    {
      id: 1,
      invoice_no: 'INV-2026-00001',
      invoice_date: '2026-08-30',
      agency_id: 1,
      g_code_id: 1,
      total_amount: 7500.0,
      notes: null,
      created_at: '2026-08-30T13:33:56.000Z',
      updated_at: '2026-08-30T13:33:56.000Z',
      deleted_at: null,
    },
    {
      id: 2,
      invoice_no: 'INV-2026-00002',
      invoice_date: '2026-08-31',
      agency_id: 1,
      g_code_id: 1,
      total_amount: 312.0,
      notes: null,
      created_at: '2026-08-30T23:43:57.000Z',
      updated_at: '2026-08-30T23:43:57.000Z',
      deleted_at: null,
    },
    {
      id: 3,
      invoice_no: 'INV-2026-00003',
      invoice_date: '2026-08-31',
      agency_id: 1,
      g_code_id: 1,
      total_amount: 1100.0,
      notes: null,
      created_at: '2026-08-31T00:56:58.000Z',
      updated_at: '2026-08-31T00:56:58.000Z',
      deleted_at: null,
    },
  ];

  invoiceItems: InvoiceItem[] = [
    {
      id: 1,
      invoice_master_id: 1,
      item_type: 'UMRAH VISA',
      details: { pax: 5, rate: 1500 },
      note: null,
      amount: 7500.0,
      created_at: '2026-08-30T13:33:56.000Z',
      updated_at: '2026-08-30T13:33:56.000Z',
    },
    {
      id: 2,
      invoice_master_id: 2,
      item_type: 'UMRAH VISA',
      details: { pax: 1, rate: 312 },
      note: null,
      amount: 312.0,
      created_at: '2026-08-30T23:43:57.000Z',
      updated_at: '2026-08-30T23:43:57.000Z',
    },
    {
      id: 3,
      invoice_master_id: 3,
      item_type: 'UMRAH VISA',
      details: { pax: 12, rate: 50 },
      note: null,
      amount: 600.0,
      created_at: '2026-08-31T00:56:58.000Z',
      updated_at: '2026-08-31T00:56:58.000Z',
    },
    {
      id: 4,
      invoice_master_id: 3,
      item_type: 'ESCAPED FINE TO',
      details: { sale_amount: 500 },
      note: null,
      amount: 500.0,
      created_at: '2026-08-31T00:56:58.000Z',
      updated_at: '2026-08-31T00:56:58.000Z',
    },
  ];

  purchaseMasters: PurchaseMaster[] = [
    {
      id: 1,
      purchase_no: 'PUR-2026-00001',
      purchase_date: '2026-08-30',
      agency_id: 1,
      g_code_id: 1,
      total_amount: 900.0,
      notes: null,
      created_at: '2026-08-30T13:39:14.000Z',
      updated_at: '2026-08-30T13:39:14.000Z',
      deleted_at: null,
    },
    {
      id: 2,
      purchase_no: 'PUR-2026-00002',
      purchase_date: '2026-08-31',
      agency_id: 2,
      g_code_id: 2,
      total_amount: 25.0,
      notes: null,
      created_at: '2026-08-30T23:44:27.000Z',
      updated_at: '2026-08-30T23:44:27.000Z',
      deleted_at: null,
    },
    {
      id: 3,
      purchase_no: 'PUR-2026-00003',
      purchase_date: '2026-08-31',
      agency_id: 2,
      g_code_id: 2,
      total_amount: 5000.0,
      notes: null,
      created_at: '2026-08-31T00:56:40.000Z',
      updated_at: '2026-08-31T00:56:40.000Z',
      deleted_at: null,
    },
    {
      id: 4,
      purchase_no: 'PUR-2026-00004',
      purchase_date: '2026-08-31',
      agency_id: 2,
      g_code_id: 2,
      total_amount: 5200.0,
      notes: null,
      created_at: '2026-08-31T05:56:13.000Z',
      updated_at: '2026-08-31T05:56:13.000Z',
      deleted_at: null,
    },
  ];

  purchaseItems: PurchaseItem[] = [
    {
      id: 1,
      purchase_master_id: 1,
      item_type: 'HOTEL',
      details: { rate: 150, nights: 3, rooms: 2 },
      note: null,
      amount: 900.0,
      created_at: '2026-08-30T13:39:14.000Z',
      updated_at: '2026-08-30T13:39:14.000Z',
    },
    {
      id: 2,
      purchase_master_id: 2,
      item_type: 'UMRAH VISA',
      details: { pax: 5, rate: 5 },
      note: null,
      amount: 25.0,
      created_at: '2026-08-30T23:44:27.000Z',
      updated_at: '2026-08-30T23:44:27.000Z',
    },
    {
      id: 3,
      purchase_master_id: 3,
      item_type: 'TRANSPORT',
      details: { sale_amount: 5000 },
      note: null,
      amount: 5000.0,
      created_at: '2026-08-31T00:56:40.000Z',
      updated_at: '2026-08-31T00:56:40.000Z',
    },
    {
      id: 4,
      purchase_master_id: 4,
      item_type: 'UMRAH VISA',
      details: { pax: 10, rate: 500 },
      note: null,
      amount: 5000.0,
      created_at: '2026-08-31T05:56:13.000Z',
      updated_at: '2026-08-31T05:56:13.000Z',
    },
    {
      id: 5,
      purchase_master_id: 4,
      item_type: 'BRN CHARGE',
      details: { pax: 2, rate: 100 },
      note: null,
      amount: 200.0,
      created_at: '2026-08-31T05:56:13.000Z',
      updated_at: '2026-08-31T05:56:13.000Z',
    },
  ];

  paymentTransactions: PaymentTransaction[] = [
    {
      id: 1,
      voucher_no: 'VOU-2026-00001',
      transaction_date: '2026-08-30',
      agency_id: 1,
      g_code_id: 1,
      transaction_type: 'RECEIVE',
      mode_of_payment: 'CASH',
      bd_amount: null,
      exchange_rate: null,
      sar_amount: 500.0,
      note: null,
      created_at: '2026-08-30T13:39:28.000Z',
      updated_at: '2026-08-30T13:39:28.000Z',
    },
    {
      id: 2,
      voucher_no: 'VOU-2026-00002',
      transaction_date: '2026-08-31',
      agency_id: 1,
      g_code_id: 1,
      transaction_type: 'RECEIVE',
      mode_of_payment: 'Bank Transfer',
      bd_amount: null,
      exchange_rate: null,
      sar_amount: 5000.0,
      note: 'adfasd',
      created_at: '2026-08-31T00:56:09.000Z',
      updated_at: '2026-08-31T00:56:09.000Z',
    },
    {
      id: 3,
      voucher_no: 'VOU-2026-00003',
      transaction_date: '2026-08-31',
      agency_id: 2,
      g_code_id: 2,
      transaction_type: 'PAYMENT',
      mode_of_payment: 'Bank Transfer',
      bd_amount: 5000.0,
      exchange_rate: 125.0,
      sar_amount: 40.0,
      note: null,
      created_at: '2026-08-31T00:56:30.000Z',
      updated_at: '2026-08-31T00:56:30.000Z',
    },
    {
      id: 4,
      voucher_no: 'VOU-2026-00004',
      transaction_date: '2026-08-31',
      agency_id: 1,
      g_code_id: 1,
      transaction_type: 'RECEIVE',
      mode_of_payment: 'Bank Transfer',
      bd_amount: null,
      exchange_rate: null,
      sar_amount: 9000.0,
      note: null,
      created_at: '2026-08-31T05:56:31.000Z',
      updated_at: '2026-08-31T05:56:31.000Z',
    },
  ];

  paymentAllocations: PaymentAllocation[] = [
    {
      id: 1,
      payment_transaction_id: 1,
      allocatable_type: 'App\\Models\\InvoiceMaster',
      allocatable_id: 1,
      allocated_amount: 500.0,
      created_at: '2026-08-31T05:50:55.000Z',
      updated_at: '2026-08-31T05:50:55.000Z',
    },
    {
      id: 2,
      payment_transaction_id: 2,
      allocatable_type: 'App\\Models\\InvoiceMaster',
      allocatable_id: 1,
      allocated_amount: 5000.0,
      created_at: '2026-08-31T05:52:43.000Z',
      updated_at: '2026-08-31T05:52:43.000Z',
    },
    {
      id: 3,
      payment_transaction_id: 4,
      allocatable_type: 'App\\Models\\InvoiceMaster',
      allocatable_id: 1,
      allocated_amount: 2000.0,
      created_at: '2026-08-31T05:57:14.000Z',
      updated_at: '2026-08-31T05:57:14.000Z',
    },
    {
      id: 4,
      payment_transaction_id: 4,
      allocatable_type: 'App\\Models\\InvoiceMaster',
      allocatable_id: 2,
      allocated_amount: 312.0,
      created_at: '2026-08-31T05:57:14.000Z',
      updated_at: '2026-08-31T05:57:14.000Z',
    },
    {
      id: 5,
      payment_transaction_id: 4,
      allocatable_type: 'App\\Models\\InvoiceMaster',
      allocatable_id: 3,
      allocated_amount: 1100.0,
      created_at: '2026-08-31T05:57:14.000Z',
      updated_at: '2026-08-31T05:57:14.000Z',
    },
    {
      id: 6,
      payment_transaction_id: 3,
      allocatable_type: 'App\\Models\\PurchaseMaster',
      allocatable_id: 4,
      allocated_amount: 40.0,
      created_at: '2026-08-31T05:57:46.000Z',
      updated_at: '2026-08-31T05:57:46.000Z',
    },
  ];

  private nextAgencyId = 3;
  private nextGCodeId = 3;
  private nextInvoiceMasterId = 4;
  private nextInvoiceItemId = 5;
  private nextPurchaseMasterId = 5;
  private nextPurchaseItemId = 6;
  private nextPaymentTxnId = 5;
  private nextAllocationId = 7;

  // Next document sequence helper
  getNextDocumentNumber(type: 'INV' | 'PUR' | 'VOU', year: string): string {
    let seq = this.sequences.find(
      (s) => s.document_type === type && s.financial_year === year
    );
    if (!seq) {
      seq = {
        id: this.sequences.length + 1,
        document_type: type,
        financial_year: year,
        last_number: 0,
      };
      this.sequences.push(seq);
    }
    seq.last_number += 1;
    const padded = String(seq.last_number).padStart(5, '0');
    return `${type}-${year}-${padded}`;
  }

  // Calculate item amount
  static calculateItemAmount(itemType: string, details: Record<string, any> = {}): number {
    if (itemType === 'HOTEL') {
      const nights = Number(details.nights || 0);
      const rooms = Number(details.rooms || 0);
      const rate = Number(details.rate || 0);
      return Math.round(nights * rooms * rate * 100) / 100;
    }
    if (['UMRAH VISA', 'BRN CHARGE', 'MULTIPLE VISA'].includes(itemType)) {
      const pax = Number(details.pax || 0);
      const rate = Number(details.rate || 0);
      return Math.round(pax * rate * 100) / 100;
    }
    if (['TRANSPORT', 'NAQABA-FINE', 'ESCAPED FINE TO'].includes(itemType)) {
      return Math.round(Number(details.sale_amount || 0) * 100) / 100;
    }
    return 0.0;
  }

  // Helper for invoice allocations sum
  getInvoiceAllocatedSum(invoiceId: number): number {
    return this.paymentAllocations
      .filter(
        (a) =>
          (a.allocatable_type === 'invoice' ||
            a.allocatable_type === 'App\\Models\\InvoiceMaster') &&
          a.allocatable_id === invoiceId
      )
      .reduce((sum, a) => sum + Number(a.allocated_amount || 0), 0);
  }

  // Helper for purchase allocations sum
  getPurchaseAllocatedSum(purchaseId: number): number {
    return this.paymentAllocations
      .filter(
        (a) =>
          (a.allocatable_type === 'purchase' ||
            a.allocatable_type === 'App\\Models\\PurchaseMaster') &&
          a.allocatable_id === purchaseId
      )
      .reduce((sum, a) => sum + Number(a.allocated_amount || 0), 0);
  }

  // Helper for payment allocations sum
  getPaymentAllocatedSum(paymentId: number): number {
    return this.paymentAllocations
      .filter((a) => a.payment_transaction_id === paymentId)
      .reduce((sum, a) => sum + Number(a.allocated_amount || 0), 0);
  }

  // Create Agency
  createAgency(data: Partial<Agency>): Agency {
    const now = new Date().toISOString();
    const agency: Agency = {
      id: this.nextAgencyId++,
      agency_name: data.agency_name || '',
      agency_type: data.agency_type || 'BD',
      contact_person: data.contact_person || null,
      phone: data.phone || null,
      address: data.address || null,
      opening_balance: Number(data.opening_balance || 0),
      opening_balance_type: data.opening_balance_type || 'DR',
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    this.agencies.push(agency);
    return agency;
  }

  // Update Agency
  updateAgency(id: number, data: Partial<Agency>): Agency | null {
    const agency = this.agencies.find((a) => a.id === id && !a.deleted_at);
    if (!agency) return null;
    if (data.agency_name !== undefined) agency.agency_name = data.agency_name;
    if (data.agency_type !== undefined) agency.agency_type = data.agency_type;
    if (data.contact_person !== undefined) agency.contact_person = data.contact_person;
    if (data.phone !== undefined) agency.phone = data.phone;
    if (data.address !== undefined) agency.address = data.address;
    if (data.opening_balance !== undefined) agency.opening_balance = Number(data.opening_balance);
    if (data.opening_balance_type !== undefined) agency.opening_balance_type = data.opening_balance_type;
    agency.updated_at = new Date().toISOString();
    return agency;
  }

  // Delete Agency (soft delete)
  deleteAgency(id: number): boolean {
    const agency = this.agencies.find((a) => a.id === id && !a.deleted_at);
    if (!agency) return false;
    agency.deleted_at = new Date().toISOString();
    return true;
  }

  // Create GCode
  createGCode(data: { code: string; agency_id: number }): GCode {
    const now = new Date().toISOString();
    const gcode: GCode = {
      id: this.nextGCodeId++,
      code: data.code,
      agency_id: Number(data.agency_id),
      created_at: now,
      updated_at: now,
    };
    this.gCodes.push(gcode);
    return gcode;
  }

  // Update GCode
  updateGCode(id: number, data: Partial<GCode>): GCode | null {
    const gcode = this.gCodes.find((g) => g.id === id);
    if (!gcode) return null;
    if (data.code !== undefined) gcode.code = data.code;
    if (data.agency_id !== undefined) gcode.agency_id = Number(data.agency_id);
    gcode.updated_at = new Date().toISOString();
    return gcode;
  }

  // Delete GCode
  deleteGCode(id: number): boolean {
    const idx = this.gCodes.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    this.gCodes.splice(idx, 1);
    return true;
  }

  // Create Invoice
  createInvoice(data: {
    invoice_date: string;
    g_code_id: number;
    notes?: string;
    items: Array<{ item_type: string; details: any; note?: string }>;
  }): InvoiceMaster {
    const now = new Date().toISOString();
    const gCode = this.gCodes.find((g) => g.id === Number(data.g_code_id));
    if (!gCode) throw new Error('Invalid G-Code');

    const year = String(new Date(data.invoice_date).getFullYear());
    const invoiceNo = this.getNextDocumentNumber('INV', year);

    let total = 0;
    const itemRecords: InvoiceItem[] = [];
    const masterId = this.nextInvoiceMasterId++;

    for (const item of data.items) {
      const amount = InMemoryDB.calculateItemAmount(item.item_type, item.details);
      total += amount;
      const itemRecord: InvoiceItem = {
        id: this.nextInvoiceItemId++,
        invoice_master_id: masterId,
        item_type: item.item_type,
        details: item.details,
        note: item.note || null,
        amount,
        created_at: now,
        updated_at: now,
      };
      this.invoiceItems.push(itemRecord);
      itemRecords.push(itemRecord);
    }

    const master: InvoiceMaster = {
      id: masterId,
      invoice_no: invoiceNo,
      invoice_date: data.invoice_date,
      agency_id: gCode.agency_id,
      g_code_id: gCode.id,
      total_amount: Math.round(total * 100) / 100,
      notes: data.notes || null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
      items: itemRecords,
    };

    this.invoiceMasters.push(master);
    return master;
  }

  // Create Purchase
  createPurchase(data: {
    purchase_date: string;
    g_code_id: number;
    notes?: string;
    items: Array<{ item_type: string; details: any; note?: string }>;
  }): PurchaseMaster {
    const now = new Date().toISOString();
    const gCode = this.gCodes.find((g) => g.id === Number(data.g_code_id));
    if (!gCode) throw new Error('Invalid G-Code');

    const year = String(new Date(data.purchase_date).getFullYear());
    const purchaseNo = this.getNextDocumentNumber('PUR', year);

    let total = 0;
    const itemRecords: PurchaseItem[] = [];
    const masterId = this.nextPurchaseMasterId++;

    for (const item of data.items) {
      const amount = InMemoryDB.calculateItemAmount(item.item_type, item.details);
      total += amount;
      const itemRecord: PurchaseItem = {
        id: this.nextPurchaseItemId++,
        purchase_master_id: masterId,
        item_type: item.item_type,
        details: item.details,
        note: item.note || null,
        amount,
        created_at: now,
        updated_at: now,
      };
      this.purchaseItems.push(itemRecord);
      itemRecords.push(itemRecord);
    }

    const master: PurchaseMaster = {
      id: masterId,
      purchase_no: purchaseNo,
      purchase_date: data.purchase_date,
      agency_id: gCode.agency_id,
      g_code_id: gCode.id,
      total_amount: Math.round(total * 100) / 100,
      notes: data.notes || null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
      items: itemRecords,
    };

    this.purchaseMasters.push(master);
    return master;
  }

  // Create Payment
  createPayment(data: {
    transaction_date: string;
    g_code_id: number;
    transaction_type: 'RECEIVE' | 'PAYMENT';
    mode_of_payment: string;
    bd_amount?: number;
    exchange_rate?: number;
    sar_amount?: number;
    note?: string;
  }): PaymentTransaction {
    const now = new Date().toISOString();
    const gCode = this.gCodes.find((g) => g.id === Number(data.g_code_id));
    if (!gCode) throw new Error('Invalid G-Code');

    const year = String(new Date(data.transaction_date).getFullYear());
    const voucherNo = this.getNextDocumentNumber('VOU', year);

    const bdAmount = data.bd_amount ? Number(data.bd_amount) : null;
    const exchangeRate = data.exchange_rate ? Number(data.exchange_rate) : null;

    let sarAmount = 0;
    if (data.transaction_type === 'PAYMENT') {
      if (bdAmount && exchangeRate && exchangeRate > 0) {
        sarAmount = Math.round((bdAmount / exchangeRate) * 100) / 100;
      } else {
        sarAmount = Number(data.sar_amount || 0);
      }
    } else {
      sarAmount = Number(data.sar_amount || 0);
    }

    const payment: PaymentTransaction = {
      id: this.nextPaymentTxnId++,
      voucher_no: voucherNo,
      transaction_date: data.transaction_date,
      agency_id: gCode.agency_id,
      g_code_id: gCode.id,
      transaction_type: data.transaction_type,
      mode_of_payment: data.mode_of_payment,
      bd_amount: bdAmount,
      exchange_rate: exchangeRate,
      sar_amount: sarAmount,
      note: data.note || null,
      created_at: now,
      updated_at: now,
    };

    this.paymentTransactions.push(payment);
    return payment;
  }

  // Create Payment Allocation
  createAllocations(data: {
    payment_transaction_id: number;
    allocations: Array<{
      allocatable_type: string;
      allocatable_id: number;
      allocated_amount: number;
    }>;
  }): PaymentAllocation[] {
    const now = new Date().toISOString();
    const payment = this.paymentTransactions.find(
      (p) => p.id === Number(data.payment_transaction_id)
    );
    if (!payment) throw new Error('Payment not found');

    const expectedType = payment.transaction_type === 'RECEIVE' ? 'invoice' : 'purchase';
    let requestedTotal = 0;

    for (const row of data.allocations) {
      requestedTotal += Number(row.allocated_amount);
      const isInvoice =
        row.allocatable_type === 'invoice' ||
        row.allocatable_type === 'App\\Models\\InvoiceMaster';
      const isPurchase =
        row.allocatable_type === 'purchase' ||
        row.allocatable_type === 'App\\Models\\PurchaseMaster';
      const rowType = isInvoice ? 'invoice' : isPurchase ? 'purchase' : row.allocatable_type;

      if (rowType !== expectedType) {
        throw new Error(
          `This payment is a ${payment.transaction_type} transaction, so it can only be allocated against a "${expectedType}", not "${row.allocatable_type}".`
        );
      }
    }

    const alreadyAllocated = this.getPaymentAllocatedSum(payment.id);
    const remainingOnPayment = Math.round((payment.sar_amount - alreadyAllocated) * 100) / 100;

    if (requestedTotal > remainingOnPayment + 0.001) {
      throw new Error(
        `Requested allocation total (${requestedTotal}) exceeds this payment's unallocated balance (${remainingOnPayment}).`
      );
    }

    const created: PaymentAllocation[] = [];

    for (const row of data.allocations) {
      const isInvoice =
        row.allocatable_type === 'invoice' ||
        row.allocatable_type === 'App\\Models\\InvoiceMaster';
      const doc = isInvoice
        ? this.invoiceMasters.find((inv) => inv.id === Number(row.allocatable_id))
        : this.purchaseMasters.find((pur) => pur.id === Number(row.allocatable_id));

      if (!doc) throw new Error(`Document #${row.allocatable_id} not found`);

      if (doc.agency_id !== payment.agency_id) {
        throw new Error(
          `Document #${doc.id} belongs to a different agency than this payment. Allocation refused.`
        );
      }

      const docAllocated = isInvoice
        ? this.getInvoiceAllocatedSum(doc.id)
        : this.getPurchaseAllocatedSum(doc.id);
      const docDue = Math.round((doc.total_amount - docAllocated) * 100) / 100;
      const reqAmount = Math.round(Number(row.allocated_amount) * 100) / 100;

      if (reqAmount > docDue + 0.001) {
        throw new Error(
          `Cannot allocate ${reqAmount} to document #${doc.id} — its remaining due is only ${docDue}.`
        );
      }

      const allocation: PaymentAllocation = {
        id: this.nextAllocationId++,
        payment_transaction_id: payment.id,
        allocatable_type: isInvoice
          ? 'App\\Models\\InvoiceMaster'
          : 'App\\Models\\PurchaseMaster',
        allocatable_id: doc.id,
        allocated_amount: reqAmount,
        created_at: now,
        updated_at: now,
      };

      this.paymentAllocations.push(allocation);
      created.push(allocation);
    }

    return created;
  }

  // Delete Allocation
  deleteAllocation(id: number): boolean {
    const idx = this.paymentAllocations.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.paymentAllocations.splice(idx, 1);
    return true;
  }
}

export const db = new InMemoryDB();

// Laravel pagination helper
export function paginate<T>(items: T[], page = 1, perPage = 20, basePath = '') {
  const total = items.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(1, page), lastPage);
  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);
  const data = items.slice((currentPage - 1) * perPage, currentPage * perPage);

  const links = [];
  links.push({
    url: currentPage > 1 ? `${basePath}?page=${currentPage - 1}` : null,
    label: '&laquo; Previous',
    active: false,
  });

  for (let i = 1; i <= lastPage; i++) {
    links.push({
      url: `${basePath}?page=${i}`,
      label: String(i),
      active: i === currentPage,
    });
  }

  links.push({
    url: currentPage < lastPage ? `${basePath}?page=${currentPage + 1}` : null,
    label: 'Next &raquo;',
    active: false,
  });

  return {
    current_page: currentPage,
    data,
    first_page_url: `${basePath}?page=1`,
    from,
    last_page: lastPage,
    last_page_url: `${basePath}?page=${lastPage}`,
    links,
    next_page_url: currentPage < lastPage ? `${basePath}?page=${currentPage + 1}` : null,
    path: basePath,
    per_page: perPage,
    prev_page_url: currentPage > 1 ? `${basePath}?page=${currentPage - 1}` : null,
    to,
    total,
  };
}
