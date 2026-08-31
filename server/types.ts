export interface Agency {
  id: number;
  agency_name: string;
  agency_type: 'BD' | 'SAUDI';
  contact_person: string | null;
  phone: string | null;
  address: string | null;
  opening_balance: number;
  opening_balance_type: 'DR' | 'CR';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  g_codes_count?: number;
  g_codes?: GCode[];
}

export interface GCode {
  id: number;
  code: string;
  agency_id: number;
  created_at: string;
  updated_at: string;
  agency?: Agency;
}

export interface InvoiceItem {
  id: number;
  invoice_master_id: number;
  item_type: string;
  details: Record<string, any>;
  note: string | null;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceMaster {
  id: number;
  invoice_no: string;
  invoice_date: string;
  agency_id: number;
  g_code_id: number;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  agency?: Agency;
  g_code?: GCode;
  gCode?: GCode;
  items?: InvoiceItem[];
  allocations_sum_allocated_amount?: number;
  due_amount?: number;
}

export interface PurchaseItem {
  id: number;
  purchase_master_id: number;
  item_type: string;
  details: Record<string, any>;
  note: string | null;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface PurchaseMaster {
  id: number;
  purchase_no: string;
  purchase_date: string;
  agency_id: number;
  g_code_id: number;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  agency?: Agency;
  g_code?: GCode;
  gCode?: GCode;
  items?: PurchaseItem[];
  allocations_sum_allocated_amount?: number;
  due_amount?: number;
}

export interface PaymentTransaction {
  id: number;
  voucher_no: string;
  transaction_date: string;
  agency_id: number;
  g_code_id: number;
  transaction_type: 'RECEIVE' | 'PAYMENT';
  mode_of_payment: string;
  bd_amount: number | null;
  exchange_rate: number | null;
  sar_amount: number;
  note: string | null;
  created_at: string;
  updated_at: string;
  agency?: Agency;
  g_code?: GCode;
  gCode?: GCode;
  allocations_sum_allocated_amount?: number;
  unallocated_amount?: number;
  allocations?: any[];
}

export interface PaymentAllocation {
  id: number;
  payment_transaction_id: number;
  allocatable_type: string; // 'invoice' | 'purchase' | 'App\\Models\\InvoiceMaster' | 'App\\Models\\PurchaseMaster'
  allocatable_id: number;
  allocated_amount: number;
  created_at: string;
  updated_at: string;
  allocatable?: InvoiceMaster | PurchaseMaster;
  payment_transaction?: PaymentTransaction;
  paymentTransaction?: PaymentTransaction;
}

export interface DocumentNumberSequence {
  id: number;
  document_type: 'INV' | 'PUR' | 'VOU';
  financial_year: string;
  last_number: number;
}
