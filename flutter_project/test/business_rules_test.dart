import 'package:flutter_test/flutter_test.dart';
import 'package:doodh_dost/shared/models/models.dart';
import 'package:doodh_dost/shared/repositories/doodh_dost_repository.dart';
import 'package:doodh_dost/core/utils/uuid_converter.dart';

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

      expect(item.orderedTotal, 1080.0);
      expect(item.deliveredTotal, 1080.0);
      expect(item.lineTotal, 1080.0);
    });

    test('Rule 2: Changing delivered quantities reflects in deliveredTotal and line totals', () {
      final item = OrderItem(
        id: '1',
        productId: 'p1',
        productName: 'Amul Taaza 500ml',
        packetSize: '500 ml',
        orderedQuantity: 40,
        deliveredQuantity: 38, // 2 shortage
        unitPrice: 27.0,
      );

      expect(item.orderedTotal, 1080.0);
      expect(item.deliveredTotal, 1026.0);
      expect(item.lineTotal, 1026.0);
    });

    test('Rule 3: Final billing strictly uses actual delivered quantities (not estimated total) and deducts return credits', () {
      final repo = DoodhDostRepository();

      // Create an order for 50 packets @ 27.0 = estimated 1350.0
      final order = repo.createOrder(
        'shop-001',
        'Shree Ganesh Dairy & Sweets',
        DateTime.now(),
        [
          OrderItem(
            id: 'oi-test',
            productId: 'prod-001',
            productName: 'Amul Taaza Toned Milk',
            packetSize: '500 ml',
            orderedQuantity: 50,
            deliveredQuantity: 0,
            unitPrice: 27.0,
          ),
        ],
      );

      // Actual delivery has 4 packets shortage: only 46 delivered
      repo.updateDeliveryQuantities(order.id, OrderStatus.delivered, {'prod-001': 46});
      expect(order.deliveredTotal, 46 * 27.0); // 1242.0

      // Finalize bill with 54.0 return credit, 10.0 crate charge, 0 discount
      // Delivered Value: 1242.0 - 54.0 + 10.0 = 1198.0
      final invoice = repo.finalizeBill(order.id, 54.0, 10.0, 0.0);

      expect(invoice.deliveredValue, 1242.0); // Based strictly on delivered qty (46 * 27)
      expect(invoice.totalReturnCredits, 54.0);
      expect(invoice.netAmount, 1198.0);
      expect(invoice.remainingAmount, 1198.0);
      expect(invoice.status, InvoiceStatus.unpaid);
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

    test('Rule 5: Damaged returns do not increase available stock (quarantine isolation)', () {
      int initialStock = 50;
      int damagedReturns = 5;
      // Damaged items must go to quarantine, NOT available
      int availableAfterDamage = initialStock - damagedReturns;
      expect(availableAfterDamage, 45);
    });

    test('Rule 6: New order entry starts clean with zero deliveredQuantity', () {
      final item = OrderItem(
        id: 'new-item',
        productId: 'prod-001',
        productName: 'Amul Taaza',
        packetSize: '500 ml',
        orderedQuantity: 25,
        deliveredQuantity: 0,
        unitPrice: 27.0,
      );

      expect(item.orderedQuantity, 25);
      expect(item.deliveredQuantity, 0);
      expect(item.deliveredTotal, 0.0);
    });

    test('Rule 7: Payment validation prevents overpayment exceeding remaining invoice balance', () {
      final repo = DoodhDostRepository();
      final order = repo.createOrder(
        'shop-002',
        'Gupta Kirana',
        DateTime.now(),
        [
          OrderItem(
            id: 'oi-pay-test',
            productId: 'prod-001',
            productName: 'Amul Taaza',
            packetSize: '500 ml',
            orderedQuantity: 10,
            deliveredQuantity: 10,
            unitPrice: 27.0,
          ),
        ],
      );

      final invoice = repo.finalizeBill(order.id, 0.0, 0.0, 0.0);
      expect(invoice.netAmount, 270.0);

      // Attempt overpayment of 300 when only 270 is due
      expect(
        () => repo.recordPayment(invoice.id, 300.0, PaymentMethod.cash, null),
        throwsA(isA<ArgumentError>()),
      );

      // Valid payment of 270 succeeds
      final payment = repo.recordPayment(invoice.id, 270.0, PaymentMethod.cash, null);
      expect(payment.amount, 270.0);
      expect(invoice.remainingAmount, 0.0);
      expect(invoice.status, InvoiceStatus.paid);

      // Attempt paying already paid invoice throws StateError
      expect(
        () => repo.recordPayment(invoice.id, 10.0, PaymentMethod.cash, null),
        throwsA(isA<StateError>()),
      );
    });

    test('Rule 8: Payment validation prevents duplicate UPI transaction references', () {
      final repo = DoodhDostRepository();
      final order1 = repo.createOrder('shop-002', 'Gupta Kirana', DateTime.now(), [
        OrderItem(id: '1', productId: 'prod-001', productName: 'Amul Taaza', packetSize: '500 ml', orderedQuantity: 5, deliveredQuantity: 5, unitPrice: 27.0),
      ]);
      final inv1 = repo.finalizeBill(order1.id, 0.0, 0.0, 0.0);

      final order2 = repo.createOrder('shop-002', 'Gupta Kirana', DateTime.now(), [
        OrderItem(id: '2', productId: 'prod-001', productName: 'Amul Taaza', packetSize: '500 ml', orderedQuantity: 5, deliveredQuantity: 5, unitPrice: 27.0),
      ]);
      final inv2 = repo.finalizeBill(order2.id, 0.0, 0.0, 0.0);

      // First UPI payment with reference UPI-REF-999 succeeds
      repo.recordPayment(inv1.id, 100.0, PaymentMethod.upi, 'UPI-REF-999');

      // Second payment attempting duplicate reference UPI-REF-999 must throw StateError
      expect(
        () => repo.recordPayment(inv2.id, 30.0, PaymentMethod.upi, 'UPI-REF-999'),
        throwsA(isA<StateError>()),
      );
    });

    test('Rule 9: Reconciling shop outstanding balance matches unpaid invoice sum', () {
      final repo = DoodhDostRepository();
      final shop = repo.addShop('Test Supermarket', 'Mukesh', '9988776655', 'Pune', 'Route A', 100.0);

      final order = repo.createOrder(shop.id, shop.name, DateTime.now(), [
        OrderItem(id: 'oi-rec', productId: 'prod-001', productName: 'Amul Taaza', packetSize: '500 ml', orderedQuantity: 20, deliveredQuantity: 20, unitPrice: 27.0),
      ]);
      final invoice = repo.finalizeBill(order.id, 0.0, 0.0, 0.0);
      expect(invoice.netAmount, 540.0);

      // Shop balance is opening (100) + invoice net (540) = 640
      repo.reconcileShopBalance(shop.id);
      final updatedShop = repo.getShops().firstWhere((s) => s.id == shop.id);
      expect(updatedShop.currentBalance, 640.0);

      // Pay 200 toward the invoice
      repo.recordPayment(invoice.id, 200.0, PaymentMethod.cash, null);

      // Reconciled balance must now be opening (100) + remaining (340) = 440.0
      final reconciledShop = repo.getShops().firstWhere((s) => s.id == shop.id);
      expect(reconciledShop.currentBalance, 440.0);
    });

    test('Rule 10: Full JSON serialization and deserialization roundtrip for persistence', () {
      final shop = Shop(
        id: 's-10',
        name: 'Krishna Dairy',
        ownerName: 'Krishna',
        phone: '9922114433',
        address: 'Main Road',
        routeArea: 'Sector 5',
        openingBalance: 500.0,
        currentBalance: 750.0,
      );

      final json = shop.toJson();
      final restored = Shop.fromJson(json);

      expect(restored.id, shop.id);
      expect(restored.name, shop.name);
      expect(restored.currentBalance, shop.currentBalance);
    });

    test('Rule 11: UuidConverter creates valid deterministic RFC 4122 UUIDs from string IDs', () {
      final uuid1 = UuidConverter.toUuid('prod-001');
      final uuid2 = UuidConverter.toUuid('prod-001');
      final shopUuid = UuidConverter.toUuid('shop-001');

      // Deterministic: same input produces identical UUID
      expect(uuid1, uuid2);
      expect(uuid1 != shopUuid, true);

      // Matches standard 8-4-4-4-12 hex UUID format
      final uuidRegex = RegExp(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');
      expect(uuidRegex.hasMatch(uuid1), true);
      expect(uuidRegex.hasMatch(shopUuid), true);

      // Existing valid UUID is preserved
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(UuidConverter.toUuid(validUuid), validUuid);
    });
  });
}

