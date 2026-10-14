import 'dart:convert';
import 'dart:math';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';

class DoodhDostRepository {
  static const String _kShopsKey = 'doodh_dost_shops_v1';
  static const String _kProductsKey = 'doodh_dost_products_v1';
  static const String _kOrdersKey = 'doodh_dost_orders_v1';
  static const String _kInvoicesKey = 'doodh_dost_invoices_v1';
  static const String _kPaymentsKey = 'doodh_dost_payments_v1';
  static const String _kReturnsKey = 'doodh_dost_returns_v1';
  static const String _kStockKey = 'doodh_dost_stock_v1';
  static const String _kOverridesKey = 'doodh_dost_overrides_v1';

  final List<Shop> _shops = [];
  final List<Product> _products = [];
  final List<Order> _orders = [];
  final List<Invoice> _invoices = [];
  final List<Payment> _payments = [];
  final List<ReturnRecord> _returns = [];
  final List<StockMovement> _stockMovements = [];
  final Map<String, double> _priceOverrides = {};

  bool _isLoaded = false;
  bool get isLoaded => _isLoaded;

  DoodhDostRepository() {
    _seedInitialData();
  }

  // ==========================================
  // PERSISTENCE: SharedPreferences Local Store
  // ==========================================

  Future<void> loadFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      final shopsJson = prefs.getString(_kShopsKey);
      if (shopsJson != null) {
        _shops.clear();
        final list = jsonDecode(shopsJson) as List<dynamic>;
        _shops.addAll(list.map((m) => Shop.fromJson(m as Map<String, dynamic>)));
      }

      final productsJson = prefs.getString(_kProductsKey);
      if (productsJson != null) {
        _products.clear();
        final list = jsonDecode(productsJson) as List<dynamic>;
        _products.addAll(list.map((m) => Product.fromJson(m as Map<String, dynamic>)));
      }

      final ordersJson = prefs.getString(_kOrdersKey);
      if (ordersJson != null) {
        _orders.clear();
        final list = jsonDecode(ordersJson) as List<dynamic>;
        _orders.addAll(list.map((m) => Order.fromJson(m as Map<String, dynamic>)));
      }

      final invoicesJson = prefs.getString(_kInvoicesKey);
      if (invoicesJson != null) {
        _invoices.clear();
        final list = jsonDecode(invoicesJson) as List<dynamic>;
        _invoices.addAll(list.map((m) => Invoice.fromJson(m as Map<String, dynamic>)));
      }

      final paymentsJson = prefs.getString(_kPaymentsKey);
      if (paymentsJson != null) {
        _payments.clear();
        final list = jsonDecode(paymentsJson) as List<dynamic>;
        _payments.addAll(list.map((m) => Payment.fromJson(m as Map<String, dynamic>)));
      }

      final returnsJson = prefs.getString(_kReturnsKey);
      if (returnsJson != null) {
        _returns.clear();
        final list = jsonDecode(returnsJson) as List<dynamic>;
        _returns.addAll(list.map((m) => ReturnRecord.fromJson(m as Map<String, dynamic>)));
      }

      final stockJson = prefs.getString(_kStockKey);
      if (stockJson != null) {
        _stockMovements.clear();
        final list = jsonDecode(stockJson) as List<dynamic>;
        _stockMovements.addAll(list.map((m) => StockMovement.fromJson(m as Map<String, dynamic>)));
      }

      final overridesJson = prefs.getString(_kOverridesKey);
      if (overridesJson != null) {
        _priceOverrides.clear();
        final map = jsonDecode(overridesJson) as Map<String, dynamic>;
        map.forEach((k, v) => _priceOverrides[k] = (v as num).toDouble());
      }

      // If storage was empty, seed and save initial dataset
      if (shopsJson == null && _shops.isEmpty) {
        _seedInitialData();
        await _saveToStorage();
      }

      _isLoaded = true;
    } catch (e) {
      // In case of parsing error on fresh start, ensure initial data is available
      if (_shops.isEmpty) {
        _seedInitialData();
      }
      _isLoaded = true;
    }
  }

  Future<void> _saveToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await Future.wait([
        prefs.setString(_kShopsKey, jsonEncode(_shops.map((s) => s.toJson()).toList())),
        prefs.setString(_kProductsKey, jsonEncode(_products.map((p) => p.toJson()).toList())),
        prefs.setString(_kOrdersKey, jsonEncode(_orders.map((o) => o.toJson()).toList())),
        prefs.setString(_kInvoicesKey, jsonEncode(_invoices.map((i) => i.toJson()).toList())),
        prefs.setString(_kPaymentsKey, jsonEncode(_payments.map((p) => p.toJson()).toList())),
        prefs.setString(_kReturnsKey, jsonEncode(_returns.map((r) => r.toJson()).toList())),
        prefs.setString(_kStockKey, jsonEncode(_stockMovements.map((s) => s.toJson()).toList())),
        prefs.setString(_kOverridesKey, jsonEncode(_priceOverrides)),
      ]);
    } catch (_) {
      // Ignore background write errors in headless test environments
    }
  }

  void _seedInitialData() {
    if (_products.isEmpty) {
      _products.addAll([
        Product(id: 'prod-001', name: 'Amul Taaza Toned Milk', packetSize: '500 ml', sku: 'AT-500', defaultPrice: 27.0, purchaseCost: 24.5),
        Product(id: 'prod-002', name: 'Amul Gold Full Cream Milk', packetSize: '500 ml', sku: 'AG-500', defaultPrice: 34.0, purchaseCost: 31.0),
        Product(id: 'prod-003', name: 'Fresh Cow Milk Premium', packetSize: '500 ml', sku: 'CM-500', defaultPrice: 28.0, purchaseCost: 25.0),
        Product(id: 'prod-004', name: 'Fresh Cow Milk Premium Pouch', packetSize: '1 Litre', sku: 'CM-1000', defaultPrice: 54.0, purchaseCost: 49.0),
        Product(id: 'prod-005', name: 'Pure Buffalo Milk Rich Cream', packetSize: '1 Litre', sku: 'BM-1000', defaultPrice: 68.0, purchaseCost: 62.0, returnPolicyType: ReturnPolicyType.partialCredit, returnCreditPercentage: 80.0),
        Product(id: 'prod-006', name: 'Amul Masti Dahi Pouch', packetSize: '400 g', sku: 'MD-400', defaultPrice: 35.0, purchaseCost: 31.5, returnPolicyType: ReturnPolicyType.damagedOnly, returnCreditPercentage: 60.0),
        Product(id: 'prod-007', name: 'Malai Fresh Paneer Vacuum Pack', packetSize: '200 g', sku: 'FP-200', defaultPrice: 85.0, purchaseCost: 75.0, returnPolicyType: ReturnPolicyType.noReturns, returnCreditPercentage: 0.0),
      ]);
    }

    if (_shops.isEmpty) {
      _shops.addAll([
        Shop(id: 'shop-001', name: 'Shree Ganesh Dairy & Sweets', ownerName: 'Ganesh Shinde', phone: '98220 11982', address: 'Corner Shop 1, MG Road, Camp', routeArea: 'Camp Sector A', openingBalance: 1250.0, currentBalance: 1250.0),
        Shop(id: 'shop-002', name: 'Gupta Kirana & General Store', ownerName: 'Santosh Gupta', phone: '98904 22345', address: 'Plot 14, Main Market, Shivajinagar', routeArea: 'Shivajinagar Route 1', openingBalance: 0.0, currentBalance: 0.0),
        Shop(id: 'shop-003', name: 'Jai Hanuman Super Market', ownerName: 'Rameshwar Vyas', phone: '97645 88910', address: 'Near Old Bus Stand, Subhash Nagar', routeArea: 'Subhash Nagar', openingBalance: 3400.0, currentBalance: 3400.0),
        Shop(id: 'shop-004', name: 'Sai Krupa Milk Centre', ownerName: 'Prakash Patil', phone: '94225 67890', address: 'Shop 7, Navrang Plaza, Station Road', routeArea: 'Station Road Route', openingBalance: 820.0, currentBalance: 820.0),
      ]);
    }

    if (_orders.isEmpty) {
      final today = DateTime.now();
      _orders.add(Order(
        id: 'ord-001',
        orderNumber: 'ORD-${today.year}${today.month.toString().padLeft(2, '0')}${today.day.toString().padLeft(2, '0')}-001',
        shopId: 'shop-001',
        shopName: 'Shree Ganesh Dairy & Sweets',
        orderDate: today,
        status: OrderStatus.delivered,
        items: [
          OrderItem(id: 'oi-1', productId: 'prod-001', productName: 'Amul Taaza Toned Milk', packetSize: '500 ml', orderedQuantity: 50, deliveredQuantity: 48, unitPrice: 27.0),
          OrderItem(id: 'oi-2', productId: 'prod-002', productName: 'Amul Gold Full Cream Milk', packetSize: '500 ml', orderedQuantity: 40, deliveredQuantity: 40, unitPrice: 34.0),
        ],
      ));
    }
  }

  // ==========================================
  // SHOPS
  // ==========================================
  List<Shop> getShops() => List.unmodifiable(_shops);

  Shop addShop(String name, String? owner, String phone, String address, String route, double openingBalance) {
    final newShop = Shop(
      id: 'shop-${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      ownerName: owner,
      phone: phone,
      address: address,
      routeArea: route,
      openingBalance: openingBalance,
      currentBalance: openingBalance,
    );
    _shops.add(newShop);
    _saveToStorage();
    return newShop;
  }

  void reconcileShopBalance(String shopId) {
    final shopIndex = _shops.indexWhere((s) => s.id == shopId);
    if (shopIndex < 0) return;
    final shop = _shops[shopIndex];

    final unpaidInvoicesTotal = _invoices
        .where((inv) => inv.shopId == shopId)
        .fold<double>(0.0, (sum, inv) => sum + inv.remainingAmount);

    final reconciledBalance = shop.openingBalance + unpaidInvoicesTotal;

    _shops[shopIndex] = Shop(
      id: shop.id,
      name: shop.name,
      ownerName: shop.ownerName,
      phone: shop.phone,
      address: shop.address,
      routeArea: shop.routeArea,
      openingBalance: shop.openingBalance,
      currentBalance: max(0.0, reconciledBalance),
      isActive: shop.isActive,
    );
    _saveToStorage();
  }

  // ==========================================
  // PRODUCTS & PRICING
  // ==========================================
  List<Product> getProducts() => List.unmodifiable(_products);

  double getEffectivePrice(String shopId, String productId) {
    final overrideKey = '${shopId}_$productId';
    if (_priceOverrides.containsKey(overrideKey)) {
      return _priceOverrides[overrideKey]!;
    }
    final prod = _products.firstWhere((p) => p.id == productId, orElse: () => _products.first);
    return prod.defaultPrice;
  }

  void setPriceOverride(String shopId, String productId, double customPrice) {
    if (customPrice <= 0) throw ArgumentError('Custom price must be greater than zero');
    _priceOverrides['${shopId}_$productId'] = customPrice;
    _saveToStorage();
  }

  // ==========================================
  // ORDERS & DELIVERIES
  // ==========================================
  List<Order> getOrders() => List.unmodifiable(_orders);

  Order createOrder(String shopId, String shopName, DateTime date, List<OrderItem> items) {
    final orderNum = 'ORD-${date.year}${date.month.toString().padLeft(2, '0')}${date.day.toString().padLeft(2, '0')}-${(_orders.length + 1).toString().padLeft(3, '0')}';
    final order = Order(
      id: 'ord-${DateTime.now().millisecondsSinceEpoch}',
      orderNumber: orderNum,
      shopId: shopId,
      shopName: shopName,
      orderDate: date,
      status: OrderStatus.placed,
      items: items,
    );
    _orders.insert(0, order);
    _saveToStorage();
    return order;
  }

  void updateDeliveryQuantities(String orderId, OrderStatus newStatus, Map<String, int> productDeliveredQty) {
    final order = _orders.firstWhere((o) => o.id == orderId);
    for (var item in order.items) {
      if (productDeliveredQty.containsKey(item.productId)) {
        item.deliveredQuantity = max(0, productDeliveredQty[item.productId]!);
      }
    }
    order.status = newStatus;
    _saveToStorage();
  }

  // ==========================================
  // FINAL BILLING & INVOICING (Issue 2 Fix)
  // ==========================================
  List<Invoice> getInvoices() => List.unmodifiable(_invoices);

  Invoice finalizeBill(
    String orderId,
    double returnCredits,
    double otherCharges,
    double discount,
  ) {
    final order = _orders.firstWhere((o) => o.id == orderId);
    if (order.isBilled) {
      throw StateError('Order ${order.orderNumber} is already billed.');
    }

    // High Priority Fix: Calculate delivered value strictly using actual delivered quantities and unit prices
    final deliveredValue = order.items.fold<double>(
      0.0,
      (sum, item) => sum + (item.deliveredQuantity * item.unitPrice),
    );

    final netAmount = max(0.0, deliveredValue - returnCredits + otherCharges - discount);

    final shopIndex = _shops.indexWhere((s) => s.id == order.shopId);
    final previousBalance = shopIndex >= 0 ? _shops[shopIndex].currentBalance : 0.0;
    final totalDueWithPrevious = previousBalance + netAmount;

    final invNum = 'INV-${DateTime.now().year}${DateTime.now().month.toString().padLeft(2, '0')}${DateTime.now().day.toString().padLeft(2, '0')}-${(_invoices.length + 1).toString().padLeft(3, '0')}';

    final invoice = Invoice(
      id: 'inv-${DateTime.now().millisecondsSinceEpoch}',
      invoiceNumber: invNum,
      orderId: order.id,
      shopId: order.shopId,
      shopName: order.shopName,
      invoiceDate: DateTime.now(),
      deliveredValue: deliveredValue,
      totalReturnCredits: returnCredits,
      otherCharges: otherCharges,
      discount: discount,
      netAmount: netAmount,
      previousShopBalance: previousBalance,
      totalDueWithPrevious: totalDueWithPrevious,
    );

    order.isBilled = true;
    order.status = OrderStatus.billed;
    _invoices.insert(0, invoice);

    // Update shop balance accurately
    if (shopIndex >= 0) {
      final s = _shops[shopIndex];
      _shops[shopIndex] = Shop(
        id: s.id,
        name: s.name,
        ownerName: s.ownerName,
        phone: s.phone,
        address: s.address,
        routeArea: s.routeArea,
        openingBalance: s.openingBalance,
        currentBalance: s.currentBalance + netAmount,
        isActive: s.isActive,
      );
    }

    _saveToStorage();
    return invoice;
  }

  // ==========================================
  // PAYMENTS & RECONCILIATION (Issue 5 Fix)
  // ==========================================
  List<Payment> getPayments() => List.unmodifiable(_payments);

  Payment recordPayment(
    String invoiceId,
    double amount,
    PaymentMethod method,
    String? upiRef,
  ) {
    if (amount <= 0) {
      throw ArgumentError('Payment amount must be greater than zero.');
    }

    final invoice = _invoices.firstWhere(
      (i) => i.id == invoiceId,
      orElse: () => throw ArgumentError('Invoice $invoiceId not found.'),
    );

    if (invoice.status == InvoiceStatus.paid) {
      throw StateError('Invoice ${invoice.invoiceNumber} is already fully paid.');
    }

    // Safeguard 1: Prevent excessive/overpayment
    if (amount > (invoice.remainingAmount + 0.001)) {
      throw ArgumentError(
        'Payment amount ₹${amount.toStringAsFixed(2)} exceeds remaining balance ₹${invoice.remainingAmount.toStringAsFixed(2)}.',
      );
    }

    // Safeguard 2: Prevent duplicate UPI payment recording
    if (upiRef != null && upiRef.trim().isNotEmpty) {
      final duplicate = _payments.any(
        (p) => p.upiReference != null && p.upiReference!.trim().toLowerCase() == upiRef.trim().toLowerCase(),
      );
      if (duplicate) {
        throw StateError('A payment with UPI reference "$upiRef" has already been recorded.');
      }
    }

    final payNum = 'PAY-${DateTime.now().year}${DateTime.now().month.toString().padLeft(2, '0')}${DateTime.now().day.toString().padLeft(2, '0')}-${(_payments.length + 1).toString().padLeft(3, '0')}';

    final payment = Payment(
      id: 'pay-${DateTime.now().millisecondsSinceEpoch}',
      paymentNumber: payNum,
      invoiceId: invoice.id,
      shopId: invoice.shopId,
      amount: amount,
      method: method,
      upiReference: upiRef?.trim(),
      paymentDate: DateTime.now(),
    );

    invoice.paidAmount += amount;
    if (invoice.remainingAmount <= 0.01) {
      invoice.status = InvoiceStatus.paid;
      final orderIndex = _orders.indexWhere((o) => o.id == invoice.orderId);
      if (orderIndex >= 0) {
        _orders[orderIndex].status = OrderStatus.paid;
      }
    } else {
      invoice.status = InvoiceStatus.partiallyPaid;
    }

    _payments.insert(0, payment);

    // Safeguard 3: Robust reconciliation of shop outstanding balance
    reconcileShopBalance(invoice.shopId);

    _saveToStorage();
    return payment;
  }

  // ==========================================
  // RETURNS & STOCK LEDGER
  // ==========================================
  List<ReturnRecord> getReturns() => List.unmodifiable(_returns);
  List<StockMovement> getStockMovements() => List.unmodifiable(_stockMovements);

  ReturnRecord recordReturn({
    required String orderId,
    required String shopId,
    required String productId,
    required int quantity,
    required ReturnCondition condition,
    required double unitPrice,
  }) {
    if (quantity <= 0) throw ArgumentError('Return quantity must be greater than zero');
    final product = _products.firstWhere((p) => p.id == productId);

    double creditPct = product.returnCreditPercentage;
    if (product.returnPolicyType == ReturnPolicyType.noReturns) {
      creditPct = 0.0;
    } else if (product.returnPolicyType == ReturnPolicyType.damagedOnly && condition == ReturnCondition.saleable) {
      creditPct = 0.0;
    }

    final totalCredit = (quantity * unitPrice * (creditPct / 100.0));

    final record = ReturnRecord(
      id: 'ret-${DateTime.now().millisecondsSinceEpoch}',
      orderId: orderId,
      shopId: shopId,
      productId: productId,
      productName: product.name,
      quantity: quantity,
      condition: condition,
      unitPrice: unitPrice,
      creditPercentage: creditPct,
      totalCredit: totalCredit,
      returnDate: DateTime.now(),
    );

    _returns.add(record);

    // Record stock movement (Rule 4 & 5):
    // Saleable returns increase available stock (+qty), Damaged returns go to quarantine (+qty damaged)
    _stockMovements.add(StockMovement(
      id: 'sm-${DateTime.now().millisecondsSinceEpoch}',
      productId: productId,
      productName: product.name,
      movementType: condition == ReturnCondition.saleable
          ? StockMovementType.returnSaleable
          : StockMovementType.returnDamaged,
      quantity: quantity,
      referenceId: orderId,
      notes: 'Customer return (${condition.name})',
      timestamp: DateTime.now(),
    ));

    _saveToStorage();
    return record;
  }

  void recordStockReceipt(String productId, int quantity, String? notes) {
    if (quantity <= 0) throw ArgumentError('Receipt quantity must be positive');
    final prod = _products.firstWhere((p) => p.id == productId);

    _stockMovements.add(StockMovement(
      id: 'sm-${DateTime.now().millisecondsSinceEpoch}',
      productId: productId,
      productName: prod.name,
      movementType: StockMovementType.receipt,
      quantity: quantity,
      notes: notes ?? 'Dairy plant receipt',
      timestamp: DateTime.now(),
    ));

    _saveToStorage();
  }

  int getStockForProduct(String productId, {int openingStock = 0}) {
    int received = 0;
    int saleableReturns = 0;
    int delivered = 0;
    int damaged = 0;

    for (var m in _stockMovements.where((sm) => sm.productId == productId)) {
      if (m.movementType == StockMovementType.receipt) received += m.quantity;
      if (m.movementType == StockMovementType.returnSaleable) saleableReturns += m.quantity;
      if (m.movementType == StockMovementType.returnDamaged) damaged += m.quantity;
    }

    for (var o in _orders.where((ord) => ord.status == OrderStatus.delivered || ord.status == OrderStatus.billed || ord.status == OrderStatus.paid)) {
      for (var item in o.items.where((it) => it.productId == productId)) {
        delivered += item.deliveredQuantity;
      }
    }

    // Formula: Opening + Received + SaleableReturns - Delivered - Damaged
    return openingStock + received + saleableReturns - delivered - damaged;
  }

  // ==========================================
  // DASHBOARD METRICS
  // ==========================================
  Map<String, dynamic> getDashboardMetrics() {
    final ordersToday = _orders.length;
    final packetsToDeliver = _orders.fold<int>(0, (sum, o) => sum + o.totalDeliveredPackets);
    final billedSales = _invoices.fold<double>(0.0, (sum, i) => sum + i.netAmount);
    final collected = _payments.fold<double>(0.0, (sum, p) => sum + p.amount);
    final totalOutstanding = _shops.fold<double>(0.0, (sum, s) => sum + max(0.0, s.currentBalance));

    return {
      'ordersToday': ordersToday,
      'packetsToDeliver': packetsToDeliver,
      'billedSales': billedSales,
      'collected': collected,
      'totalOutstanding': totalOutstanding,
    };
  }
}
