// Core Data Models for Doodh Dost Flutter App

enum OrderStatus {
  draft,
  placed,
  confirmed,
  outForDelivery,
  delivered,
  billed,
  paid,
  cancelled,
}

enum InvoiceStatus {
  unpaid,
  partiallyPaid,
  paid,
}

enum PaymentMethod {
  cash,
  upi,
}

enum ReturnCondition {
  saleable,
  damaged,
}

enum ReturnPolicyType {
  fullCredit,
  partialCredit,
  damagedOnly,
  noReturns,
}

enum StockMovementType {
  receipt,
  dispatch,
  returnSaleable,
  returnDamaged,
  adjustment,
}

class Shop {
  final String id;
  final String name;
  final String? ownerName;
  final String phone;
  final String address;
  final String? routeArea;
  final double openingBalance;
  final double currentBalance;
  final bool isActive;

  Shop({
    required this.id,
    required this.name,
    this.ownerName,
    required this.phone,
    required this.address,
    this.routeArea,
    this.openingBalance = 0.0,
    this.currentBalance = 0.0,
    this.isActive = true,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'ownerName': ownerName,
    'phone': phone,
    'address': address,
    'routeArea': routeArea,
    'openingBalance': openingBalance,
    'currentBalance': currentBalance,
    'isActive': isActive,
  };

  factory Shop.fromJson(Map<String, dynamic> json) => Shop(
    id: json['id'] as String,
    name: json['name'] as String,
    ownerName: json['ownerName'] as String?,
    phone: json['phone'] as String? ?? '',
    address: json['address'] as String? ?? '',
    routeArea: json['routeArea'] as String?,
    openingBalance: (json['openingBalance'] as num?)?.toDouble() ?? 0.0,
    currentBalance: (json['currentBalance'] as num?)?.toDouble() ?? 0.0,
    isActive: json['isActive'] as bool? ?? true,
  );
}

class Product {
  final String id;
  final String name;
  final String packetSize;
  final String sku;
  final double defaultPrice;
  final double? purchaseCost;
  final ReturnPolicyType returnPolicyType;
  final double returnCreditPercentage;
  final bool isActive;

  Product({
    required this.id,
    required this.name,
    required this.packetSize,
    required this.sku,
    required this.defaultPrice,
    this.purchaseCost,
    this.returnPolicyType = ReturnPolicyType.fullCredit,
    this.returnCreditPercentage = 100.0,
    this.isActive = true,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'packetSize': packetSize,
    'sku': sku,
    'defaultPrice': defaultPrice,
    'purchaseCost': purchaseCost,
    'returnPolicyType': returnPolicyType.name,
    'returnCreditPercentage': returnCreditPercentage,
    'isActive': isActive,
  };

  factory Product.fromJson(Map<String, dynamic> json) => Product(
    id: json['id'] as String,
    name: json['name'] as String,
    packetSize: json['packetSize'] as String? ?? '500 ml',
    sku: json['sku'] as String? ?? '',
    defaultPrice: (json['defaultPrice'] as num).toDouble(),
    purchaseCost: (json['purchaseCost'] as num?)?.toDouble(),
    returnPolicyType: ReturnPolicyType.values.firstWhere(
      (e) => e.name == json['returnPolicyType'],
      orElse: () => ReturnPolicyType.fullCredit,
    ),
    returnCreditPercentage: (json['returnCreditPercentage'] as num?)?.toDouble() ?? 100.0,
    isActive: json['isActive'] as bool? ?? true,
  );
}

class OrderItem {
  final String id;
  final String productId;
  final String productName;
  final String packetSize;
  int orderedQuantity;
  int deliveredQuantity;
  double unitPrice;

  OrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.packetSize,
    required this.orderedQuantity,
    required this.deliveredQuantity,
    required this.unitPrice,
  });

  double get orderedTotal => orderedQuantity * unitPrice;
  double get deliveredTotal => deliveredQuantity * unitPrice;
  double get lineTotal => deliveredQuantity > 0 ? (deliveredQuantity * unitPrice) : (orderedQuantity * unitPrice);

  Map<String, dynamic> toJson() => {
    'id': id,
    'productId': productId,
    'productName': productName,
    'packetSize': packetSize,
    'orderedQuantity': orderedQuantity,
    'deliveredQuantity': deliveredQuantity,
    'unitPrice': unitPrice,
  };

  factory OrderItem.fromJson(Map<String, dynamic> json) => OrderItem(
    id: json['id'] as String,
    productId: json['productId'] as String,
    productName: json['productName'] as String,
    packetSize: json['packetSize'] as String? ?? '500 ml',
    orderedQuantity: (json['orderedQuantity'] as num).toInt(),
    deliveredQuantity: (json['deliveredQuantity'] as num?)?.toInt() ?? 0,
    unitPrice: (json['unitPrice'] as num).toDouble(),
  );
}

class Order {
  final String id;
  final String orderNumber;
  final String shopId;
  final String shopName;
  final DateTime orderDate;
  OrderStatus status;
  final List<OrderItem> items;
  bool isBilled;

  Order({
    required this.id,
    required this.orderNumber,
    required this.shopId,
    required this.shopName,
    required this.orderDate,
    required this.status,
    required this.items,
    this.isBilled = false,
  });

  int get totalOrderedPackets => items.fold(0, (sum, i) => sum + i.orderedQuantity);
  int get totalDeliveredPackets => items.fold(0, (sum, i) => sum + i.deliveredQuantity);
  double get orderedTotal => items.fold(0.0, (sum, i) => sum + i.orderedTotal);
  double get deliveredTotal => items.fold(0.0, (sum, i) => sum + i.deliveredTotal);
  double get estimatedTotal => orderedTotal;

  Map<String, dynamic> toJson() => {
    'id': id,
    'orderNumber': orderNumber,
    'shopId': shopId,
    'shopName': shopName,
    'orderDate': orderDate.toIso8601String(),
    'status': status.name,
    'items': items.map((i) => i.toJson()).toList(),
    'isBilled': isBilled,
  };

  factory Order.fromJson(Map<String, dynamic> json) => Order(
    id: json['id'] as String,
    orderNumber: json['orderNumber'] as String,
    shopId: json['shopId'] as String,
    shopName: json['shopName'] as String,
    orderDate: DateTime.parse(json['orderDate'] as String),
    status: OrderStatus.values.firstWhere(
      (e) => e.name == json['status'],
      orElse: () => OrderStatus.placed,
    ),
    items: (json['items'] as List<dynamic>)
        .map((item) => OrderItem.fromJson(item as Map<String, dynamic>))
        .toList(),
    isBilled: json['isBilled'] as bool? ?? false,
  );
}

class Invoice {
  final String id;
  final String invoiceNumber;
  final String orderId;
  final String shopId;
  final String shopName;
  final DateTime invoiceDate;
  final double deliveredValue;
  final double totalReturnCredits;
  final double otherCharges;
  final double discount;
  final double netAmount;
  final double previousShopBalance;
  final double totalDueWithPrevious;
  double paidAmount;
  InvoiceStatus status;

  Invoice({
    required this.id,
    required this.invoiceNumber,
    required this.orderId,
    required this.shopId,
    required this.shopName,
    required this.invoiceDate,
    required this.deliveredValue,
    required this.totalReturnCredits,
    this.otherCharges = 0.0,
    this.discount = 0.0,
    required this.netAmount,
    this.previousShopBalance = 0.0,
    this.totalDueWithPrevious = 0.0,
    this.paidAmount = 0.0,
    this.status = InvoiceStatus.unpaid,
  });

  double get remainingAmount => (netAmount - paidAmount).clamp(0.0, double.infinity);

  Map<String, dynamic> toJson() => {
    'id': id,
    'invoiceNumber': invoiceNumber,
    'orderId': orderId,
    'shopId': shopId,
    'shopName': shopName,
    'invoiceDate': invoiceDate.toIso8601String(),
    'deliveredValue': deliveredValue,
    'totalReturnCredits': totalReturnCredits,
    'otherCharges': otherCharges,
    'discount': discount,
    'netAmount': netAmount,
    'previousShopBalance': previousShopBalance,
    'totalDueWithPrevious': totalDueWithPrevious,
    'paidAmount': paidAmount,
    'status': status.name,
  };

  factory Invoice.fromJson(Map<String, dynamic> json) => Invoice(
    id: json['id'] as String,
    invoiceNumber: json['invoiceNumber'] as String,
    orderId: json['orderId'] as String,
    shopId: json['shopId'] as String,
    shopName: json['shopName'] as String,
    invoiceDate: DateTime.parse(json['invoiceDate'] as String),
    deliveredValue: (json['deliveredValue'] as num).toDouble(),
    totalReturnCredits: (json['totalReturnCredits'] as num?)?.toDouble() ?? 0.0,
    otherCharges: (json['otherCharges'] as num?)?.toDouble() ?? 0.0,
    discount: (json['discount'] as num?)?.toDouble() ?? 0.0,
    netAmount: (json['netAmount'] as num).toDouble(),
    previousShopBalance: (json['previousShopBalance'] as num?)?.toDouble() ?? 0.0,
    totalDueWithPrevious: (json['totalDueWithPrevious'] as num?)?.toDouble() ?? (json['netAmount'] as num).toDouble(),
    paidAmount: (json['paidAmount'] as num?)?.toDouble() ?? 0.0,
    status: InvoiceStatus.values.firstWhere(
      (e) => e.name == json['status'],
      orElse: () => InvoiceStatus.unpaid,
    ),
  );
}

class Payment {
  final String id;
  final String paymentNumber;
  final String invoiceId;
  final String shopId;
  final double amount;
  final PaymentMethod method;
  final String? upiReference;
  final DateTime paymentDate;

  Payment({
    required this.id,
    required this.paymentNumber,
    required this.invoiceId,
    required this.shopId,
    required this.amount,
    required this.method,
    this.upiReference,
    required this.paymentDate,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'paymentNumber': paymentNumber,
    'invoiceId': invoiceId,
    'shopId': shopId,
    'amount': amount,
    'method': method.name,
    'upiReference': upiReference,
    'paymentDate': paymentDate.toIso8601String(),
  };

  factory Payment.fromJson(Map<String, dynamic> json) => Payment(
    id: json['id'] as String,
    paymentNumber: json['paymentNumber'] as String,
    invoiceId: json['invoiceId'] as String,
    shopId: json['shopId'] as String,
    amount: (json['amount'] as num).toDouble(),
    method: PaymentMethod.values.firstWhere(
      (e) => e.name == json['method'],
      orElse: () => PaymentMethod.cash,
    ),
    upiReference: json['upiReference'] as String?,
    paymentDate: DateTime.parse(json['paymentDate'] as String),
  );
}

// Return Record Ledger
class ReturnRecord {
  final String id;
  final String orderId;
  final String shopId;
  final String productId;
  final String productName;
  final int quantity;
  final ReturnCondition condition;
  final double unitPrice;
  final double creditPercentage;
  final double totalCredit;
  final DateTime returnDate;

  ReturnRecord({
    required this.id,
    required this.orderId,
    required this.shopId,
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.condition,
    required this.unitPrice,
    required this.creditPercentage,
    required this.totalCredit,
    required this.returnDate,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'orderId': orderId,
    'shopId': shopId,
    'productId': productId,
    'productName': productName,
    'quantity': quantity,
    'condition': condition.name,
    'unitPrice': unitPrice,
    'creditPercentage': creditPercentage,
    'totalCredit': totalCredit,
    'returnDate': returnDate.toIso8601String(),
  };

  factory ReturnRecord.fromJson(Map<String, dynamic> json) => ReturnRecord(
    id: json['id'] as String,
    orderId: json['orderId'] as String,
    shopId: json['shopId'] as String,
    productId: json['productId'] as String,
    productName: json['productName'] as String,
    quantity: (json['quantity'] as num).toInt(),
    condition: ReturnCondition.values.firstWhere(
      (e) => e.name == json['condition'],
      orElse: () => ReturnCondition.damaged,
    ),
    unitPrice: (json['unitPrice'] as num).toDouble(),
    creditPercentage: (json['creditPercentage'] as num).toDouble(),
    totalCredit: (json['totalCredit'] as num).toDouble(),
    returnDate: DateTime.parse(json['returnDate'] as String),
  );
}

// Stock Movement Ledger
class StockMovement {
  final String id;
  final String productId;
  final String productName;
  final StockMovementType movementType;
  final int quantity; // Positive for in, negative for out
  final String? referenceId; // orderId or receiptId
  final String? notes;
  final DateTime timestamp;

  StockMovement({
    required this.id,
    required this.productId,
    required this.productName,
    required this.movementType,
    required this.quantity,
    this.referenceId,
    this.notes,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'productId': productId,
    'productName': productName,
    'movementType': movementType.name,
    'quantity': quantity,
    'referenceId': referenceId,
    'notes': notes,
    'timestamp': timestamp.toIso8601String(),
  };

  factory StockMovement.fromJson(Map<String, dynamic> json) => StockMovement(
    id: json['id'] as String,
    productId: json['productId'] as String,
    productName: json['productName'] as String,
    movementType: StockMovementType.values.firstWhere(
      (e) => e.name == json['movementType'],
      orElse: () => StockMovementType.receipt,
    ),
    quantity: (json['quantity'] as num).toInt(),
    referenceId: json['referenceId'] as String?,
    notes: json['notes'] as String?,
    timestamp: DateTime.parse(json['timestamp'] as String),
  );
}
