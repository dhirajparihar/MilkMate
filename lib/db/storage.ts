import {
  DistributorProfile,
  Shop,
  Product,
  ShopProductPriceOverride,
  Order,
  OrderItem,
  Invoice,
  InvoiceItem,
  ReturnCreditItem,
  Payment,
  StockReceipt,
  StockMovement,
  ReturnRecord,
  ReturnItem,
  ReturnPolicy,
  ProductInventoryState,
  AuditLog,
  OrderStatus,
  PaymentMethod,
  ReturnCondition,
  ReturnStatus,
} from '@/types/doodh_dost';

import {
  INITIAL_DISTRIBUTOR,
  INITIAL_PRODUCTS,
  INITIAL_SHOPS,
  INITIAL_RETURN_POLICIES,
  INITIAL_STOCK_RECEIPTS,
  INITIAL_ORDERS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_STOCK_MOVEMENTS,
  getTodayDateString,
} from './mock-data';

import {
  calculateLineTotal,
  calculatePacketCredit,
  calculateNetInvoice,
  calculateClosingBalance,
  calculateAvailableStock,
  generateEntityNumber,
  toRupees,
  toPaise,
} from '@/lib/calc';

const STORAGE_KEY = 'doodh_dost_v1_store';

interface DoodhDostDatabase {
  profile: DistributorProfile;
  shops: Shop[];
  products: Product[];
  priceOverrides: ShopProductPriceOverride[];
  returnPolicies: ReturnPolicy[];
  orders: Order[];
  invoices: Invoice[];
  payments: Payment[];
  stockReceipts: StockReceipt[];
  stockMovements: StockMovement[];
  returns: ReturnRecord[];
  auditLogs: AuditLog[];
  isDemoMode: boolean;
  supabaseConfig?: {
    url: string;
    anonKey: string;
    isConnected: boolean;
  };
}

const getInitialData = (): DoodhDostDatabase => ({
  profile: INITIAL_DISTRIBUTOR,
  shops: INITIAL_SHOPS,
  products: INITIAL_PRODUCTS,
  priceOverrides: [
    {
      id: 'ovr-1',
      shopId: 'shop-001',
      productId: 'prod-001',
      customPrice: 26.5, // 50 paise discount for bulk customer
    },
  ],
  returnPolicies: INITIAL_RETURN_POLICIES,
  orders: INITIAL_ORDERS,
  invoices: INITIAL_INVOICES,
  payments: INITIAL_PAYMENTS,
  stockReceipts: INITIAL_STOCK_RECEIPTS,
  stockMovements: INITIAL_STOCK_MOVEMENTS,
  returns: [
    {
      id: 'ret-001',
      returnNumber: 'RET-20261012-001',
      shopId: 'shop-001',
      shopName: 'Shree Ganesh Dairy & Sweets',
      orderId: 'ord-prev-001',
      orderNumber: 'ORD-20261012-001',
      returnDate: '2026-10-12',
      status: 'approved',
      items: [
        {
          id: 'ri-001',
          returnId: 'ret-001',
          productId: 'prod-001',
          productName: 'Amul Taaza Toned Milk',
          packetSize: '500 ml',
          returnQuantity: 2,
          condition: 'saleable',
          unitPrice: 27,
          creditPerPacket: 27,
          totalCredit: 54,
          reason: 'Unsold from evening stock',
        },
      ],
      totalCreditAmount: 54,
      notes: 'Approved on evening return trip',
      createdAt: '2026-10-12T07:00:00Z',
    },
  ],
  auditLogs: [
    {
      id: 'log-1',
      timestamp: `${getTodayDateString()}T04:15:00Z`,
      entityType: 'stock',
      entityId: 'rec-001',
      action: 'STOCK_RECEIVED',
      distributorName: 'Ramesh Patel',
      details: 'Received 990 packets from Amul Dairy Chilling Plant',
    },
    {
      id: 'log-2',
      timestamp: `${getTodayDateString()}T05:30:00Z`,
      entityType: 'delivery',
      entityId: 'ord-001',
      action: 'DELIVERY_COMPLETED',
      distributorName: 'Ramesh Patel',
      details: 'Delivered 103 packets to Shree Ganesh Dairy. 2 packets shortage reported.',
    },
  ],
  isDemoMode: true,
  supabaseConfig: {
    url: '',
    anonKey: '',
    isConnected: false,
  },
});

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Listener notification error:', e);
    }
  });
}

// In-memory cache
let memoryDB: DoodhDostDatabase | null = null;

function loadDatabase(): DoodhDostDatabase {
  if (memoryDB) return memoryDB;

  if (typeof window === 'undefined') {
    return getInitialData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      memoryDB = JSON.parse(raw);
      return memoryDB!;
    }
  } catch (err) {
    console.error('Failed reading localStorage:', err);
  }

  memoryDB = getInitialData();
  saveDatabase(memoryDB);
  return memoryDB;
}

function saveDatabase(data: DoodhDostDatabase) {
  memoryDB = data;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed saving to localStorage:', err);
    }
  }
  notify();
}

export const DoodhDostStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getDB(): DoodhDostDatabase {
    return loadDatabase();
  },

  resetToDemo(): void {
    const fresh = getInitialData();
    saveDatabase(fresh);
  },

  // ------------------- PROFILE -------------------
  updateProfile(profile: Partial<DistributorProfile>): void {
    const db = loadDatabase();
    db.profile = { ...db.profile, ...profile };
    saveDatabase(db);
  },

  // ------------------- SHOPS -------------------
  getShops(): Shop[] {
    return loadDatabase().shops;
  },

  getShop(id: string): Shop | undefined {
    return loadDatabase().shops.find((s) => s.id === id);
  },

  saveShop(shopData: Omit<Shop, 'id' | 'createdAt' | 'updatedAt' | 'currentBalance'> & { id?: string }): Shop {
    const db = loadDatabase();
    const now = new Date().toISOString();

    if (shopData.id) {
      // Edit
      const index = db.shops.findIndex((s) => s.id === shopData.id);
      if (index >= 0) {
        const existing = db.shops[index];
        const updated: Shop = {
          ...existing,
          ...shopData,
          updatedAt: now,
        };
        db.shops[index] = updated;
        saveDatabase(db);
        return updated;
      }
    }

    // New shop
    const newShop: Shop = {
      ...shopData,
      id: `shop-${Date.now().toString(36)}`,
      currentBalance: shopData.openingBalance || 0,
      createdAt: now,
      updatedAt: now,
    };
    db.shops.push(newShop);
    this.addAuditLog('shop', newShop.id, 'SHOP_CREATED', `Added new shop: ${newShop.name} with opening balance ₹${newShop.openingBalance}`);
    saveDatabase(db);
    return newShop;
  },

  toggleShopActive(id: string): void {
    const db = loadDatabase();
    const shop = db.shops.find((s) => s.id === id);
    if (shop) {
      shop.isActive = !shop.isActive;
      shop.updatedAt = new Date().toISOString();
      this.addAuditLog('shop', shop.id, 'SHOP_STATUS_CHANGED', `Changed active status to ${shop.isActive}`);
      saveDatabase(db);
    }
  },

  // ------------------- PRODUCTS -------------------
  getProducts(): Product[] {
    return loadDatabase().products;
  },

  getProduct(id: string): Product | undefined {
    return loadDatabase().products.find((p) => p.id === id);
  },

  saveProduct(productData: Omit<Product, 'id'> & { id?: string }): Product {
    const db = loadDatabase();
    if (productData.id) {
      const idx = db.products.findIndex((p) => p.id === productData.id);
      if (idx >= 0) {
        const oldPrice = db.products[idx].defaultPrice;
        const updated = { ...db.products[idx], ...productData } as Product;
        db.products[idx] = updated;
        if (oldPrice !== updated.defaultPrice) {
          this.addAuditLog('product', updated.id, 'PRODUCT_PRICE_UPDATED', `Price for ${updated.name} updated from ₹${oldPrice} to ₹${updated.defaultPrice}`);
        }
        saveDatabase(db);
        return updated;
      }
    }

    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now().toString(36)}`,
    };
    db.products.push(newProd);
    saveDatabase(db);
    return newProd;
  },

  getEffectiveProductPrice(shopId: string, productId: string): number {
    const db = loadDatabase();
    const override = db.priceOverrides.find((o) => o.shopId === shopId && o.productId === productId);
    if (override && override.customPrice > 0) {
      return override.customPrice;
    }
    const product = db.products.find((p) => p.id === productId);
    return product ? product.defaultPrice : 0;
  },

  setPriceOverride(shopId: string, productId: string, price: number): void {
    const db = loadDatabase();
    const idx = db.priceOverrides.findIndex((o) => o.shopId === shopId && o.productId === productId);
    if (idx >= 0) {
      db.priceOverrides[idx].customPrice = price;
    } else {
      db.priceOverrides.push({
        id: `ovr-${Date.now().toString(36)}`,
        shopId,
        productId,
        customPrice: price,
      });
    }
    saveDatabase(db);
  },

  // ------------------- ORDERS -------------------
  getOrders(): Order[] {
    return loadDatabase().orders;
  },

  getOrder(id: string): Order | undefined {
    return loadDatabase().orders.find((o) => o.id === id);
  },

  createDailyOrder(
    shopId: string,
    orderDate: string,
    items: Array<{ productId: string; quantity: number; unitPrice?: number }>,
    notes?: string
  ): Order {
    const db = loadDatabase();
    const shop = db.shops.find((s) => s.id === shopId);
    if (!shop) throw new Error('Shop not found');

    const nextSeq = db.orders.length + 1;
    const orderNumber = generateEntityNumber('ORD', nextSeq);
    const now = new Date().toISOString();

    const orderItems: OrderItem[] = items.map((item, index) => {
      const prod = db.products.find((p) => p.id === item.productId);
      const unitPrice = item.unitPrice ?? this.getEffectiveProductPrice(shopId, item.productId);
      const qty = Math.max(1, item.quantity);
      return {
        id: `oi-${Date.now()}-${index}`,
        orderId: '',
        productId: item.productId,
        productName: prod ? prod.name : 'Milk Product',
        packetSize: prod ? prod.packetSize : '500 ml',
        orderedQuantity: qty,
        deliveredQuantity: qty, // Default delivered matches ordered until delivery adjustments
        unitPrice,
        lineTotal: calculateLineTotal(qty, unitPrice),
      };
    });

    const totalDeliveredPackets = orderItems.reduce((acc, i) => acc + i.deliveredQuantity, 0);
    const estimatedTotal = orderItems.reduce((acc, i) => acc + i.lineTotal, 0);

    const newOrder: Order = {
      id: `ord-${Date.now().toString(36)}`,
      orderNumber,
      shopId,
      shopName: shop.name,
      orderDate,
      status: 'placed',
      items: orderItems,
      totalDeliveredPackets,
      estimatedTotal,
      notes,
      isBilled: false,
      createdAt: now,
      updatedAt: now,
    };

    newOrder.items.forEach((item) => {
      item.orderId = newOrder.id;
    });

    db.orders.unshift(newOrder);
    this.addAuditLog('order', newOrder.id, 'ORDER_CREATED', `Order ${newOrder.orderNumber} placed for ${shop.name} (${totalDeliveredPackets} packets)`);
    saveDatabase(db);
    return newOrder;
  },

  updateDelivery(
    orderId: string,
    status: OrderStatus,
    updatedItems: Array<{ productId: string; deliveredQuantity: number; unitPrice?: number }>,
    reason?: string
  ): Order {
    const db = loadDatabase();
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (order.isBilled) throw new Error('Cannot edit an order that is already finalized and billed.');

    const oldTotalDelivered = order.totalDeliveredPackets;

    // Update items
    updatedItems.forEach((upItem) => {
      const existing = order.items.find((i) => i.productId === upItem.productId);
      if (existing) {
        existing.deliveredQuantity = Math.max(0, upItem.deliveredQuantity);
        if (upItem.unitPrice !== undefined) {
          existing.unitPrice = upItem.unitPrice;
        }
        existing.lineTotal = calculateLineTotal(existing.deliveredQuantity, existing.unitPrice);
      }
    });

    order.status = status;
    order.totalDeliveredPackets = order.items.reduce((acc, i) => acc + i.deliveredQuantity, 0);
    order.estimatedTotal = order.items.reduce((acc, i) => acc + i.lineTotal, 0);
    order.updatedAt = new Date().toISOString();

    // If marked delivered, record stock movements
    if (status === 'delivered') {
      order.items.forEach((item) => {
        db.stockMovements.push({
          id: `mov-${Date.now()}-${item.productId}`,
          date: getTodayDateString(),
          productId: item.productId,
          productName: item.productName,
          movementType: 'delivery_out',
          quantityChange: -item.deliveredQuantity,
          referenceId: order.id,
          notes: `Delivered to ${order.shopName} (Order ${order.orderNumber})`,
          createdAt: new Date().toISOString(),
        });
      });
    }

    this.addAuditLog(
      'delivery',
      order.id,
      'DELIVERY_UPDATED',
      `Order ${order.orderNumber} status set to ${status}. Delivered packets: ${order.totalDeliveredPackets} (was ${oldTotalDelivered}). ${reason || ''}`
    );

    saveDatabase(db);
    return order;
  },

  // ------------------- RETURNS -------------------
  getReturns(): ReturnRecord[] {
    return loadDatabase().returns;
  },

  getReturnPolicies(): ReturnPolicy[] {
    return loadDatabase().returnPolicies;
  },

  createReturn(
    shopId: string,
    orderId: string,
    items: Array<{
      productId: string;
      returnQuantity: number;
      condition: ReturnCondition;
      reason: string;
    }>
  ): ReturnRecord {
    const db = loadDatabase();
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (order.isBilled) throw new Error('Returns cannot be recorded after final invoice generation.');

    const shop = db.shops.find((s) => s.id === shopId);
    if (!shop) throw new Error('Shop not found');

    const nextSeq = db.returns.length + 1;
    const returnNumber = generateEntityNumber('RET', nextSeq);
    const now = new Date().toISOString();

    const returnItems: ReturnItem[] = items.map((item, idx) => {
      const orderItem = order.items.find((oi) => oi.productId === item.productId);
      if (!orderItem) throw new Error(`Product was not part of order ${order.orderNumber}`);

      // Check return policy
      const product = db.products.find((p) => p.id === item.productId);
      const policy = db.returnPolicies.find((pol) => pol.productId === item.productId);
      const policyType = policy ? policy.policyType : product?.returnPolicyType ?? 'full_credit';
      const pct = policy ? policy.creditPercentage : product?.returnCreditPercentage ?? 100;

      const creditPerPacket = calculatePacketCredit(orderItem.unitPrice, policyType, pct, item.condition);
      const totalCredit = toRupees(item.returnQuantity * toPaise(creditPerPacket));

      return {
        id: `ri-${Date.now()}-${idx}`,
        returnId: '',
        productId: item.productId,
        productName: orderItem.productName,
        packetSize: orderItem.packetSize,
        returnQuantity: item.returnQuantity,
        condition: item.condition,
        unitPrice: orderItem.unitPrice,
        creditPerPacket,
        totalCredit,
        reason: item.reason,
      };
    });

    const totalCreditAmount = returnItems.reduce((acc, i) => acc + i.totalCredit, 0);

    const newReturn: ReturnRecord = {
      id: `ret-${Date.now().toString(36)}`,
      returnNumber,
      shopId,
      shopName: shop.name,
      orderId,
      orderNumber: order.orderNumber,
      returnDate: getTodayDateString(),
      status: 'approved',
      items: returnItems,
      totalCreditAmount,
      createdAt: now,
    };

    newReturn.items.forEach((i) => {
      i.returnId = newReturn.id;
    });

    // Update stock ledger for returns
    newReturn.items.forEach((item) => {
      db.stockMovements.push({
        id: `mov-${Date.now()}-${item.productId}`,
        date: getTodayDateString(),
        productId: item.productId,
        productName: item.productName,
        movementType: item.condition === 'saleable' ? 'return_saleable' : 'return_damaged',
        quantityChange: item.returnQuantity,
        referenceId: newReturn.id,
        notes: `Returned from ${shop.name} (${item.condition}) - ${item.reason}`,
        createdAt: new Date().toISOString(),
      });
    });

    db.returns.unshift(newReturn);
    this.addAuditLog('order', order.id, 'RETURN_APPROVED', `Return ${newReturn.returnNumber} approved for ${shop.name}: ₹${totalCreditAmount} credit`);
    saveDatabase(db);
    return newReturn;
  },

  // ------------------- INVOICES -------------------
  getInvoices(): Invoice[] {
    return loadDatabase().invoices;
  },

  getInvoice(id: string): Invoice | undefined {
    return loadDatabase().invoices.find((i) => i.id === id);
  },

  finalizeInvoice(
    orderId: string,
    otherCharges: number = 0,
    discount: number = 0
  ): Invoice {
    const db = loadDatabase();
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (order.isBilled) throw new Error('This order has already been finalized and billed.');

    const shop = db.shops.find((s) => s.id === order.shopId);
    if (!shop) throw new Error('Shop not found');

    // Find any approved returns for this order
    const relatedReturns = db.returns.filter((r) => r.orderId === orderId && r.status === 'approved');
    const returnCredits: ReturnCreditItem[] = [];
    let totalReturnCredits = 0;

    relatedReturns.forEach((ret) => {
      ret.items.forEach((item) => {
        returnCredits.push({
          id: item.id,
          productName: item.productName,
          packetSize: item.packetSize,
          quantity: item.returnQuantity,
          condition: item.condition,
          creditPerPacket: item.creditPerPacket,
          totalCredit: item.totalCredit,
        });
        totalReturnCredits += item.totalCredit;
      });
    });

    const invoiceItems: InvoiceItem[] = order.items.map((oi) => ({
      id: `ii-${oi.id}`,
      productId: oi.productId,
      productName: oi.productName,
      packetSize: oi.packetSize,
      deliveredQuantity: oi.deliveredQuantity,
      unitPrice: oi.unitPrice,
      lineAmount: oi.lineTotal,
    }));

    const deliveredValue = invoiceItems.reduce((acc, i) => acc + i.lineAmount, 0);
    const netAmount = calculateNetInvoice(deliveredValue, totalReturnCredits, otherCharges, discount);

    const nextSeq = db.invoices.length + 1;
    const invoiceNumber = generateEntityNumber('INV', nextSeq);
    const now = new Date().toISOString();

    const previousShopBalance = shop.currentBalance;
    const totalDueWithPrevious = previousShopBalance + netAmount;

    const newInvoice: Invoice = {
      id: `inv-${Date.now().toString(36)}`,
      invoiceNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      shopId: shop.id,
      shopName: shop.name,
      shopPhone: shop.phone,
      invoiceDate: getTodayDateString(),
      items: invoiceItems,
      returnCredits,
      deliveredValue,
      totalReturnCredits,
      otherCharges,
      discount,
      netAmount,
      paidAmount: 0,
      remainingAmount: netAmount,
      status: 'unpaid',
      previousShopBalance,
      totalDueWithPrevious,
      isImmutable: true,
      createdAt: now,
    };

    // Lock order
    order.isBilled = true;
    order.status = 'billed';

    // Update shop current balance with new bill
    shop.currentBalance = toRupees(toPaise(shop.currentBalance) + toPaise(netAmount));
    shop.updatedAt = now;

    db.invoices.unshift(newInvoice);
    this.addAuditLog(
      'invoice',
      newInvoice.id,
      'INVOICE_FINALIZED',
      `Final invoice ${invoiceNumber} created for ${shop.name}. Net bill: ₹${netAmount}. New shop total due: ₹${shop.currentBalance}`
    );

    saveDatabase(db);
    return newInvoice;
  },

  // ------------------- PAYMENTS -------------------
  getPayments(): Payment[] {
    return loadDatabase().payments;
  },

  recordPayment(
    invoiceId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    upiReference?: string,
    notes?: string
  ): Payment {
    const db = loadDatabase();
    const invoice = db.invoices.find((i) => i.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const shop = db.shops.find((s) => s.id === invoice.shopId);
    if (!shop) throw new Error('Shop not found');

    const safeAmount = Math.max(0, toRupees(toPaise(amount)));
    if (safeAmount <= 0) throw new Error('Payment amount must be greater than zero');

    const nextSeq = db.payments.length + 1;
    const paymentNumber = generateEntityNumber('PAY', nextSeq);
    const now = new Date().toISOString();

    const newPayment: Payment = {
      id: `pay-${Date.now().toString(36)}`,
      paymentNumber,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      shopId: shop.id,
      shopName: shop.name,
      amount: safeAmount,
      paymentMethod,
      upiReference,
      paymentDate: getTodayDateString(),
      notes,
      createdAt: now,
    };

    // Update invoice paid amount
    invoice.paidAmount = toRupees(toPaise(invoice.paidAmount) + toPaise(safeAmount));
    invoice.remainingAmount = Math.max(0, toRupees(toPaise(invoice.netAmount) - toPaise(invoice.paidAmount)));
    if (invoice.remainingAmount === 0) {
      invoice.status = 'paid';
    } else {
      invoice.status = 'partially_paid';
    }

    // Update shop outstanding balance
    shop.currentBalance = toRupees(toPaise(shop.currentBalance) - toPaise(safeAmount));
    shop.updatedAt = now;

    // Check if order should be marked paid
    const relatedOrder = db.orders.find((o) => o.id === invoice.orderId);
    if (relatedOrder && invoice.status === 'paid') {
      relatedOrder.status = 'paid';
    }

    db.payments.unshift(newPayment);
    this.addAuditLog(
      'payment',
      newPayment.id,
      'PAYMENT_RECORDED',
      `Payment of ₹${safeAmount} recorded for ${shop.name} via ${paymentMethod.toUpperCase()}${
        upiReference ? ` (Ref: ${upiReference})` : ''
      }. Shop remaining balance: ₹${shop.currentBalance}`
    );

    saveDatabase(db);
    return newPayment;
  },

  // ------------------- STOCK RECEIPTS -------------------
  getStockReceipts(): StockReceipt[] {
    return loadDatabase().stockReceipts;
  },

  recordDairyReceipt(
    supplierName: string,
    items: Array<{ productId: string; quantity: number; purchaseCost?: number }>
  ): StockReceipt {
    const db = loadDatabase();
    const nextSeq = db.stockReceipts.length + 1;
    const receiptNumber = generateEntityNumber('REC', nextSeq);
    const now = new Date().toISOString();

    const receiptItems = items.map((i) => {
      const p = db.products.find((prod) => prod.id === i.productId);
      return {
        productId: i.productId,
        productName: p ? `${p.name} (${p.packetSize})` : 'Product',
        quantity: Math.max(1, i.quantity),
        purchaseCost: i.purchaseCost ?? p?.purchaseCost,
      };
    });

    const totalPackets = receiptItems.reduce((acc, i) => acc + i.quantity, 0);

    const receipt: StockReceipt = {
      id: `rec-${Date.now().toString(36)}`,
      receiptNumber,
      receiptDate: getTodayDateString(),
      supplierName: supplierName || 'Morning Dairy Plant Delivery',
      items: receiptItems,
      totalPackets,
      createdAt: now,
    };

    // Update stock movements
    receiptItems.forEach((item) => {
      db.stockMovements.push({
        id: `mov-${Date.now()}-${item.productId}`,
        date: getTodayDateString(),
        productId: item.productId,
        productName: item.productName,
        movementType: 'dairy_receipt',
        quantityChange: item.quantity,
        referenceId: receipt.id,
        notes: `Dairy Receipt ${receiptNumber} from ${receipt.supplierName}`,
        createdAt: now,
      });
    });

    db.stockReceipts.unshift(receipt);
    this.addAuditLog('stock', receipt.id, 'STOCK_RECEIVED', `Recorded morning receipt of ${totalPackets} packets from ${receipt.supplierName}`);
    saveDatabase(db);
    return receipt;
  },

  // ------------------- INVENTORY LEDGER -------------------
  getStockMovements(): StockMovement[] {
    return loadDatabase().stockMovements;
  },

  getInventoryStatus(): ProductInventoryState[] {
    const db = loadDatabase();
    return db.products.map((p) => {
      const movements = db.stockMovements.filter((m) => m.productId === p.id);

      let stockReceived = 0;
      let deliveredQty = 0;
      let saleableReturns = 0;
      let damagedReturns = 0;
      let manualAdjustments = 0;

      movements.forEach((m) => {
        if (m.movementType === 'dairy_receipt') {
          stockReceived += m.quantityChange;
        } else if (m.movementType === 'delivery_out') {
          deliveredQty += Math.abs(m.quantityChange);
        } else if (m.movementType === 'return_saleable') {
          saleableReturns += m.quantityChange;
        } else if (m.movementType === 'return_damaged') {
          damagedReturns += m.quantityChange;
        } else if (m.movementType === 'adjustment') {
          manualAdjustments += m.quantityChange;
        }
      });

      const openingStock = 20; // Default baseline morning stock carried forward
      const availableStock = calculateAvailableStock(
        openingStock,
        stockReceived,
        saleableReturns,
        deliveredQty,
        damagedReturns,
        manualAdjustments
      );

      return {
        productId: p.id,
        productName: p.name,
        packetSize: p.packetSize,
        openingStock,
        stockReceived,
        deliveredQty,
        saleableReturns,
        damagedReturns,
        manualAdjustments,
        availableStock,
        lowStockThreshold: 15,
      };
    });
  },

  // ------------------- AUDIT LOGS -------------------
  getAuditLogs(): AuditLog[] {
    return loadDatabase().auditLogs;
  },

  addAuditLog(
    entityType: AuditLog['entityType'],
    entityId: string,
    action: string,
    details: string
  ): void {
    const db = loadDatabase();
    db.auditLogs.unshift({
      id: `log-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      entityType,
      entityId,
      action,
      distributorName: db.profile.distributorName,
      details,
    });
  },

  // ------------------- METRICS / DASHBOARD CALCULATIONS -------------------
  getDashboardMetrics() {
    const db = loadDatabase();
    const today = getTodayDateString();

    const todayOrders = db.orders.filter((o) => o.orderDate === today);
    const totalOrdersCount = todayOrders.length;
    const packetsToDeliver = todayOrders.reduce((acc, o) => acc + o.totalDeliveredPackets, 0);

    const todayInvoices = db.invoices.filter((i) => i.invoiceDate === today);
    const todayBilledSales = todayInvoices.reduce((acc, i) => acc + i.netAmount, 0);

    const todayPayments = db.payments.filter((p) => p.paymentDate === today);
    const paymentsCollected = todayPayments.reduce((acc, p) => acc + p.amount, 0);
    const cashCollected = todayPayments.filter((p) => p.paymentMethod === 'cash').reduce((acc, p) => acc + p.amount, 0);
    const upiCollected = todayPayments.filter((p) => p.paymentMethod === 'upi').reduce((acc, p) => acc + p.amount, 0);

    const totalOutstandingBalances = db.shops.reduce((acc, s) => acc + Math.max(0, s.currentBalance), 0);

    const todayReceipts = db.stockReceipts.filter((r) => r.receiptDate === today);
    const stockReceivedToday = todayReceipts.reduce((acc, r) => acc + r.totalPackets, 0);

    const inventory = this.getInventoryStatus();
    const remainingSaleableStock = inventory.reduce((acc, i) => acc + Math.max(0, i.availableStock), 0);

    const pendingDeliveries = todayOrders.filter((o) => o.status !== 'delivered' && o.status !== 'billed' && o.status !== 'paid').length;

    return {
      totalOrdersCount,
      packetsToDeliver,
      todayBilledSales,
      paymentsCollected,
      cashCollected,
      upiCollected,
      totalOutstandingBalances,
      stockReceivedToday,
      remainingSaleableStock,
      pendingDeliveries,
    };
  },
};
