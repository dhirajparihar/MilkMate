// Types for Doodh Dost Milk Distribution Platform

export type OrderStatus =
  | 'draft'
  | 'placed'
  | 'confirmed'
  | 'out_for_delivery'
  | 'delivered'
  | 'billed'
  | 'paid'
  | 'cancelled';

export type InvoiceStatus = 'unpaid' | 'partially_paid' | 'paid';

export type PaymentMethod = 'cash' | 'upi';

export type ReturnCondition = 'saleable' | 'damaged';

export type ReturnStatus = 'pending' | 'approved' | 'rejected';

export type ReturnPolicyType =
  | 'full_credit'
  | 'partial_credit'
  | 'damaged_only'
  | 'no_returns';

export type StockMovementType =
  | 'opening'
  | 'dairy_receipt'
  | 'delivery_out'
  | 'return_saleable'
  | 'return_damaged'
  | 'adjustment';

export interface DistributorProfile {
  id: string;
  businessName: string;
  distributorName: string;
  phone: string;
  email: string;
  address: string;
  dairySupplierName: string;
  currency: string;
}

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  address: string;
  routeArea: string;
  openingBalance: number; // in Rupees
  currentBalance: number; // in Rupees
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  packetSize: string; // e.g. "500 ml", "1 Litre", "400 g"
  sku: string;
  defaultPrice: number; // in Rupees
  purchaseCost?: number; // in Rupees
  isActive: boolean;
  category: 'milk' | 'curd' | 'paneer' | 'buttermilk' | 'ghee';
  returnPolicyType: ReturnPolicyType;
  returnCreditPercentage: number; // e.g. 100 for full, 50 for 50%
}

export interface ShopProductPriceOverride {
  id: string;
  shopId: string;
  productId: string;
  customPrice: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  packetSize: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  unitPrice: number; // in Rupees agreed
  lineTotal: number; // deliveredQuantity * unitPrice
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "ORD-20261013-001"
  shopId: string;
  shopName: string;
  orderDate: string; // YYYY-MM-DD
  status: OrderStatus;
  items: OrderItem[];
  totalDeliveredPackets: number;
  estimatedTotal: number;
  notes?: string;
  isBilled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnItem {
  id: string;
  returnId: string;
  productId: string;
  productName: string;
  packetSize: string;
  returnQuantity: number;
  condition: ReturnCondition;
  unitPrice: number;
  creditPerPacket: number;
  totalCredit: number;
  reason: string;
}

export interface ReturnRecord {
  id: string;
  returnNumber: string; // "RET-20261013-001"
  shopId: string;
  shopName: string;
  orderId: string;
  orderNumber: string;
  returnDate: string;
  status: ReturnStatus;
  items: ReturnItem[];
  totalCreditAmount: number;
  notes?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  packetSize: string;
  deliveredQuantity: number;
  unitPrice: number;
  lineAmount: number;
}

export interface ReturnCreditItem {
  id: string;
  productName: string;
  packetSize: string;
  quantity: number;
  condition: ReturnCondition;
  creditPerPacket: number;
  totalCredit: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // "INV-20261013-001"
  orderId: string;
  orderNumber: string;
  shopId: string;
  shopName: string;
  shopPhone: string;
  invoiceDate: string;
  items: InvoiceItem[];
  returnCredits: ReturnCreditItem[];
  deliveredValue: number;
  totalReturnCredits: number;
  otherCharges: number;
  discount: number;
  netAmount: number; // deliveredValue - totalReturnCredits + otherCharges - discount
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
  previousShopBalance: number;
  totalDueWithPrevious: number;
  isImmutable: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  paymentNumber: string; // "PAY-20261013-001"
  invoiceId: string;
  invoiceNumber: string;
  shopId: string;
  shopName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  upiReference?: string;
  paymentDate: string;
  notes?: string;
  createdAt: string;
}

export interface StockReceiptItem {
  productId: string;
  productName: string;
  quantity: number;
  purchaseCost?: number;
}

export interface StockReceipt {
  id: string;
  receiptNumber: string; // "REC-20261013-001"
  receiptDate: string;
  supplierName: string;
  items: StockReceiptItem[];
  totalPackets: number;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  movementType: StockMovementType;
  quantityChange: number; // positive or negative
  referenceId?: string; // orderId, returnId, receiptId
  notes: string;
  createdAt: string;
}

export interface ProductInventoryState {
  productId: string;
  productName: string;
  packetSize: string;
  openingStock: number;
  stockReceived: number;
  deliveredQty: number;
  saleableReturns: number;
  damagedReturns: number;
  manualAdjustments: number;
  availableStock: number; // Opening + Received + SaleableReturns - Delivered - Damaged
  lowStockThreshold: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  entityType: 'order' | 'delivery' | 'invoice' | 'payment' | 'stock' | 'shop' | 'product';
  entityId: string;
  action: string;
  distributorName: string;
  details: string;
}

export interface ReturnPolicy {
  id: string;
  productId?: string;
  shopId?: string;
  policyType: ReturnPolicyType;
  creditPercentage: number;
  description: string;
}
