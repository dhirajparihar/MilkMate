import 'dart:math';
import '../models/models.dart';

class DoodhDostRepository {
  // In-memory data store for local/demo & offline persistence
  final List<Shop> _shops = [];
  final List<Product> _products = [];
  final List<Order> _orders = [];
  final List<Invoice> _invoices = [];
  final List<Payment> _payments = [];
  final Map<String, double> _priceOverrides = {}; // key: "shopId_productId"

  DoodhDostRepository() {
    _seedInitialData();
  }

  void _seedInitialData() {
    _products.addAll([
      Product(id: 'prod-001', name: 'Amul Taaza Toned Milk', packetSize: '500 ml', sku: 'AT-500', defaultPrice: 27.0, purchaseCost: 24.5),
      Product(id: 'prod-002', name: 'Amul Gold Full Cream Milk', packetSize: '500 ml', sku: 'AG-500', defaultPrice: 34.0, purchaseCost: 31.0),
      Product(id: 'prod-003', name: 'Fresh Cow Milk Premium', packetSize: '500 ml', sku: 'CM-500', defaultPrice: 28.0, purchaseCost: 25.0),
      Product(id: 'prod-004', name: 'Fresh Cow Milk Premium Pouch', packetSize: '1 Litre', sku: 'CM-1000', defaultPrice: 54.0, purchaseCost: 49.0),
      Product(id: 'prod-005', name: 'Pure Buffalo Milk Rich Cream', packetSize: '1 Litre', sku: 'BM-1000', defaultPrice: 68.0, purchaseCost: 62.0, returnPolicyType: ReturnPolicyType.partialCredit, returnCreditPercentage: 80.0),
      Product(id: 'prod-006', name: 'Amul Masti Dahi Pouch', packetSize: '400 g', sku: 'MD-400', defaultPrice: 35.0, purchaseCost: 31.5, returnPolicyType: ReturnPolicyType.damagedOnly, returnCreditPercentage: 60.0),
      Product(id: 'prod-007', name: 'Malai Fresh Paneer Vacuum Pack', packetSize: '200 g', sku: 'FP-200', defaultPrice: 85.0, purchaseCost: 75.0, returnPolicyType: ReturnPolicyType.noReturns, returnCreditPercentage: 0.0),
    ]);

    _shops.addAll([
      Shop(id: 'shop-001', name: 'Shree Ganesh Dairy & Sweets', ownerName: 'Ganesh Shinde', phone: '98220 11982', address: 'Corner Shop 1, MG Road, Camp', routeArea: 'Camp Sector A', openingBalance: 1250.0, currentBalance: 1250.0),
      Shop(id: 'shop-002', name: 'Gupta Kirana & General Store', ownerName: 'Santosh Gupta', phone: '98904 22345', address: 'Plot 14, Main Market, Shivajinagar', routeArea: 'Shivajinagar Route 1', openingBalance: 0.0, currentBalance: 0.0),
      Shop(id: 'shop-003', name: 'Jai Hanuman Super Market', ownerName: 'Rameshwar Vyas', phone: '97645 88910', address: 'Near Old Bus Stand, Subhash Nagar', routeArea: 'Subhash Nagar', openingBalance: 3400.0, currentBalance: 3400.0),
      Shop(id: 'shop-004', name: 'Sai Krupa Milk Centre', ownerName: 'Prakash Patil', phone: '94225 67890', address: 'Shop 7, Navrang Plaza, Station Road', routeArea: 'Station Road Route', openingBalance: 820.0, currentBalance: 820.0),
    ]);

    // Initial order
    final today = DateTime.now();
    _orders.add(Order(
      id: 'ord-001',
      orderNumber: 'ORD-20261013-001',
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

  // Shops
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
    return newShop;
  }

  // Products
  List<Product> getProducts() => List.unmodifiable(_products);

  double getEffectivePrice(String shopId, String productId) {
    final overrideKey = '${shopId}_$productId';
    if (_priceOverrides.containsKey(overrideKey)) {
      return _priceOverrides[overrideKey]!;
    }
    final prod = _products.firstWhere((p) => p.id === productId, orElse: () => _products.first);
    return prod.defaultPrice;
  }

  // Orders
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
    return order;
  }

  void updateDeliveryQuantities(String orderId, OrderStatus newStatus, Map<String, int> productDeliveredQty) {
    final order = _orders.firstWhere((o) => o.id == orderId);
    for (var item in order.items) {
      if (productDeliveredQty.containsKey(item.productId)) {
        item.deliveredQuantity = productDeliveredQty[item.productId]!;
      }
    }
    order.status = newStatus;
  }

  // Invoices & Billing
  List<Invoice> getInvoices() => List.unmodifiable(_invoices);

  Invoice finalizeBill(String orderId, double returnCredits, double otherCharges, double discount) {
    final order = _orders.firstWhere((o) => o.id == orderId);
    final deliveredValue = order.estimatedTotal;
    final netAmount = max(0.0, deliveredValue - returnCredits + otherCharges - discount);

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
      netAmount: netAmount,
    );

    order.isBilled = true;
    order.status = OrderStatus.billed;
    _invoices.insert(0, invoice);

    // Update shop balance
    final shopIndex = _shops.indexWhere((s) => s.id == order.shopId);
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

    return invoice;
  }

  // Payments
  List<Payment> getPayments() => List.unmodifiable(_payments);

  Payment recordPayment(String invoiceId, double amount, PaymentMethod method, String? upiRef) {
    final invoice = _invoices.firstWhere((i) => i.id == invoiceId);
    final payNum = 'PAY-${DateTime.now().year}${DateTime.now().month.toString().padLeft(2, '0')}${DateTime.now().day.toString().padLeft(2, '0')}-${(_payments.length + 1).toString().padLeft(3, '0')}';

    final payment = Payment(
      id: 'pay-${DateTime.now().millisecondsSinceEpoch}',
      paymentNumber: payNum,
      invoiceId: invoice.id,
      shopId: invoice.shopId,
      amount: amount,
      method: method,
      upiReference: upiRef,
      paymentDate: DateTime.now(),
    );

    invoice.paidAmount += amount;
    if (invoice.remainingAmount <= 0) {
      invoice.status = InvoiceStatus.paid;
    } else {
      invoice.status = InvoiceStatus.partiallyPaid;
    }

    // Update shop balance
    final shopIndex = _shops.indexWhere((s) => s.id == invoice.shopId);
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
        currentBalance: max(0.0, s.currentBalance - amount),
        isActive: s.isActive,
      );
    }

    _payments.insert(0, payment);
    return payment;
  }

  // Dashboard calculations
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
