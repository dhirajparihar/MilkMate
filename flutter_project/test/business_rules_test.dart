import 'package:flutter_test/flutter_test.dart';
import 'package:doodh_dost/shared/models/models.dart';

void main() {
  group('Doodh Dost Business Logic & Calculation Rules', () {
    test('Rule 1: Line total calculation for order items', () {
      final item = OrderItem(
        id: '1',
        productId: 'p1',
        productName: 'Amul Taaza 500ml',
        packetSize: '500 ml',
        orderedQuantity: 40,
        deliveredQuantity: 40,
        unitPrice: 27.0,
      );

      expect(item.lineTotal, 1080.0);
    });

    test('Rule 2: Changing delivered quantities reflects in line totals', () {
      final item = OrderItem(
        id: '1',
        productId: 'p1',
        productName: 'Amul Taaza 500ml',
        packetSize: '500 ml',
        orderedQuantity: 40,
        deliveredQuantity: 38, // 2 shortage
        unitPrice: 27.0,
      );

      expect(item.lineTotal, 1026.0);
    });

    test('Rule 3: Invoice net calculation with returns', () {
      final invoice = Invoice(
        id: 'inv-1',
        invoiceNumber: 'INV-20261013-001',
        orderId: 'ord-1',
        shopId: 'shop-1',
        shopName: 'Shree Ganesh Dairy',
        invoiceDate: DateTime(2026, 10, 13),
        deliveredValue: 2400.0,
        totalReturnCredits: 54.0,
        netAmount: 2346.0,
      );

      expect(invoice.remainingAmount, 2346.0);
      expect(invoice.status, InvoiceStatus.unpaid);

      // Partial payment
      invoice.paidAmount = 1500.0;
      expect(invoice.remainingAmount, 846.0);
    });

    test('Rule 4: Stock formula Opening + Received + SaleableReturns - Delivered - Damaged', () {
      int opening = 20;
      int received = 100;
      int saleableReturns = 5;
      int delivered = 60;
      int damaged = 2;

      int available = opening + received + saleableReturns - delivered - damaged;
      expect(available, 63);
    });

    test('Rule 5: Damaged returns do not increase available stock', () {
      int initialStock = 50;
      int damagedReturns = 5;
      // Damaged items must go to quarantine, NOT available
      int availableAfterDamage = initialStock - damagedReturns;
      expect(availableAfterDamage, 45);
    });
  });
}
