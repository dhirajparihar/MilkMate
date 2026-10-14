import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/quantity_stepper.dart';
import '../../shared/models/models.dart';
import '../../shared/repositories/doodh_dost_repository.dart';

class CreateOrderScreen extends StatefulWidget {
  final DoodhDostRepository repository;
  final String? preselectedShopId;

  const CreateOrderScreen({
    super.key,
    required this.repository,
    this.preselectedShopId,
  });

  @override
  State<CreateOrderScreen> createState() => _CreateOrderScreenState();
}

class _CreateOrderScreenState extends State<CreateOrderScreen> {
  late String _selectedShopId;
  final Map<String, int> _quantities = {};

  @override
  void initState() {
    super.initState();
    final shops = widget.repository.getShops();
    _selectedShopId = widget.preselectedShopId ?? (shops.isNotEmpty ? shops.first.id : '');

    // Production rule: All product order quantities initialize clean at 0
    final products = widget.repository.getProducts();
    for (var prod in products) {
      _quantities[prod.id] = 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final shops = widget.repository.getShops();
    final products = widget.repository.getProducts();

    int totalPackets = _quantities.values.fold(0, (sum, q) => sum + q);
    double estimatedTotal = 0.0;
    for (var prod in products) {
      final qty = _quantities[prod.id] ?? 0;
      final price = widget.repository.getEffectivePrice(_selectedShopId, prod.id);
      estimatedTotal += qty * price;
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('New Daily Order'),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on_outlined, color: AppColors.primaryGreen),
            tooltip: 'Prefill Demo Template (30/20 pkts)',
            onPressed: () {
              setState(() {
                if (products.isNotEmpty) _quantities[products[0].id] = 30;
                if (products.length > 1) _quantities[products[1].id] = 20;
              });
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Shop Selection Dropdown
            const Text('SELECT SHOP', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedShopId.isNotEmpty ? _selectedShopId : null,
                  isExpanded: true,
                  items: shops.map((s) => DropdownMenuItem(
                    value: s.id,
                    child: Text('${s.name} (Dues: ₹${s.currentBalance.toStringAsFixed(0)})'),
                  )).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedShopId = val);
                  },
                ),
              ),
            ),
            const SizedBox(height: 20),
            // Products Steppers List
            const Text('ORDER QUANTITIES', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
            const SizedBox(height: 10),
            ...products.map((prod) {
              final qty = _quantities[prod.id] ?? 0;
              final price = widget.repository.getEffectivePrice(_selectedShopId, prod.id);
              final lineTotal = qty * price;

              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                elevation: 0,
                color: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                  side: const BorderSide(color: AppColors.border),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(prod.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            Text('${prod.packetSize} · @ ₹$price', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                            if (qty > 0)
                              Text('Total: ₹${lineTotal.toStringAsFixed(0)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primaryGreen)),
                          ],
                        ),
                      ),
                      QuantityStepperWidget(
                        value: qty,
                        step: 5,
                        unit: 'pkts',
                        onChanged: (newQty) {
                          setState(() {
                            _quantities[prod.id] = newQty;
                          });
                        },
                      ),
                    ],
                  ),
                ),
              );
            }),
            const SizedBox(height: 80),
          ],
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -4)),
          ],
        ),
        child: SafeArea(
          child: Row(
            children: [
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Total: $totalPackets Packets', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    Text('₹${estimatedTotal.toStringAsFixed(0)}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.primaryGreen)),
                  ],
                ),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: totalPackets > 0
                    ? () {
                        final shop = shops.firstWhere((s) => s.id == _selectedShopId);
                        final items = <OrderItem>[];
                        for (var prod in products) {
                          final qty = _quantities[prod.id] ?? 0;
                          if (qty > 0) {
                            final price = widget.repository.getEffectivePrice(_selectedShopId, prod.id);
                            items.add(OrderItem(
                              id: 'oi-${DateTime.now().millisecondsSinceEpoch}-${prod.id}',
                              productId: prod.id,
                              productName: prod.name,
                              packetSize: prod.packetSize,
                              orderedQuantity: qty,
                              deliveredQuantity: 0,
                              unitPrice: price,
                            ));
                          }
                        }
                        widget.repository.createOrder(_selectedShopId, shop.name, DateTime.now(), items);
                        Navigator.pop(context);
                      }
                    : null,
                child: const Text('Save Order', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
