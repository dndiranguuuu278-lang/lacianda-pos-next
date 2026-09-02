export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  brand?: string;
  costPrice?: number;
  taxType?: string;
  variant?: string;
  barcode?: string;
  reorderLevel?: number;
  isActive?: boolean;
}

export interface ProductVariant {
  id: string;
  size: string;
  price: string;
  barcode: string;
  stock: string;
}

export interface ParsedProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  barcode?: string;
}

export type StockStatusFilter = 'All' | 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  qty: number;
  stock: number;
}

export type TenderType = 'Cash' | 'M-Pesa Till' | 'M-Pesa Paybill' | 'Card';
export type TenderFilter = 'All' | 'M-Pesa' | 'Cash' | 'Card';

export interface SaleItem {
  id?: string;
  name: string;
  price: number;
  qty?: number;
  quantity?: number;
  lineTotal?: number;
}

export interface SaleRecord {
  id: string;
  receiptNumber?: string;
  date: string;
  items: SaleItem[];
  total: number;
  taxable?: number;
  vat?: number;
  tenderType: TenderType | string;
  mpesaRef?: string;
  amountPaid?: number;
  change?: number;
  isVoided?: boolean;
}

export interface ReceiptLineItem {
  id?: string;
  name: string;
  quantity: number;
  price?: number;
  lineTotal: number;
}

export type WaxSealVariant = 'active' | 'muted' | 'void';

export interface WaxSealProps {
  label: string;
  variant?: WaxSealVariant;
  className?: string;
}

export interface ReceiptTicketProps {
  storeName?: string;
  storeBranch?: string;
  kraPin?: string;
  receiptNumber: string;
  date?: string;
  cashierName?: string;
  items: ReceiptLineItem[];
  taxableAmount?: number;
  taxAmount: number;
  totalAmount: number;
  tenderType: string;
  amountPaid?: number;
  change?: number;
  mpesaRef?: string | null;
  isPaid?: boolean;
  isVoided?: boolean;
  showPrintButton?: boolean;
  className?: string;
  onClose?: () => void;
}

export interface ReceiptItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface ReceiptData {
  storeName: string;
  receiptNumber: string;
  items: ReceiptItem[];
  taxAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'mpesa';
  mpesaCode?: string | null;
  etimsCuin?: string | null;
  etimsQrUrl?: string | null;
  createdAt?: string;
}

export type EtimsStatus = 'Pending' | 'Submitted' | 'Failed';

export interface EtimsItem {
  id: string;
  receiptNumber: string;
  date: string;
  taxable: number;
  vat: number;
  total: number;
  status: EtimsStatus;
  items?: { name: string; price: number; quantity?: number; qty?: number }[];
  kraSignature?: string;
}

export interface EtimsLineItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface EtimsInvoiceInput {
  receiptNumber: string;
  items: EtimsLineItem[];
  totalAmount: number;
  taxAmount: number;
}

export interface EtimsSubmissionResult {
  cuin: string | null;
  qrUrl: string | null;
  raw: unknown;
}

export interface EtimsQueueRow {
  id: string | number;
  sale_id?: string;
  receipt_number: string;
  payload?: EtimsInvoiceInput;
  status: 'pending' | 'submitted' | 'failed' | string;
  attempts: number;
  last_error: string | null;
  cuin?: string | null;
  qr_url?: string | null;
  created_at: string;
  updated_at: string;
}

export type SettingsTab = 'store' | 'mpesa' | 'etims' | 'hardware' | 'security';

export type ThermalPaperWidth = '80mm' | '58mm';

export type MpesaMode = 'simulation' | 'live';
export type MpesaEnvironment = 'sandbox' | 'production';

export interface MpesaConfig {
  mode: MpesaMode;
  environment: MpesaEnvironment;
  shortcode: string;
  passkey: string;
  consumerKey: string;
  consumerSecret: string;
}

export interface StoreSettings {
  storeName: string;
  branch: string;
  kraPin: string;
  tillNumber: string;
  paybillNumber: string;
  accountReference: string;
  paperWidth: ThermalPaperWidth;
  autoPrintReceipt: boolean;
  autoSyncEtims: boolean;
  enableStkPush: boolean;
  allowOversell: boolean;
  managerPin: string;
  oscuUrl: string;
}

export type UserRole = 'admin' | 'manager' | 'cashier';

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole | string;
  hasPin?: boolean;
}

export interface CashierProfile {
  id: string;
  name: string;
  role: string;
  pin: string;
}

export interface NavItem {
  href: string;
  label: string;
  badge?: string;
  shortcut?: string;
}

export interface LabelCardProps {
  children: React.ReactNode;
  className?: string;
  crest?: boolean;
  title?: string;
  subtitle?: string;
}

export interface CartItemInput {
  id?: string;
  product_id: string;
  name?: string;
  price?: number;
  qty?: number;
  quantity: number;
}

export interface ProductRow {
  id: string;
  name: string;
  price?: number;
  selling_price: string;
  stock?: number;
  stock_qty: number;
}

export interface StkPushBody {
  consumerKey?: string;
  consumerSecret?: string;
  shortcode?: string;
  passkey?: string;
  environment?: 'sandbox' | 'production';
  phone?: string;
  phoneNumber?: string;
  amount?: number;
  accountReference?: string;
  transactionDesc?: string;
}

export interface CartLineItem {
  id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  qty?: number;
  unit_price: number;
  line_total: number;
}

export interface UserRow {
  id: string;
  google_id?: string | null;
  email: string;
  name: string | null;
  role: string;
  pin_hash?: string | null;
}
