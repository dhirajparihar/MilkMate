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

  double get lineTotal => deliveredQuantity * unitPrice;
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

  int get totalDeliveredPackets => items.fold(0, (sum, i) => sum + i.deliveredQuantity);
  double get estimatedTotal => items.fold(0.0, (sum, i) => sum + i.lineTotal);
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
  final double netAmount;
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
    required this.netAmount,
    this.paidAmount = 0.0,
    this.status = InvoiceStatus.unpaid,
  });

  double get remainingAmount => (netAmount - paidAmount).clamp(0.0, double.infinity);
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
}
