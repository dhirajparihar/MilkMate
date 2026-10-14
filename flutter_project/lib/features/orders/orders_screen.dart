import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/models/models.dart';
import '../../shared/repositories/doodh_dost_repository.dart';
import '../../core/widgets/cow_mascot.dart';
import 'create_order_screen.dart';

class OrdersScreen extends StatefulWidget {
  final DoodhDostRepository repository;
  final VoidCallback onDataChanged;

  const OrdersScreen({
    super.key,
    required this.repository,
    required this.onDataChanged,
  });

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  String _filter = 'all';

  @override
  Widget build(BuildContext context) {
    final allOrders = widget.repository.getOrders();
    final orders = allOrders.where((o) {
      if (_filter == 'pending') return o.status == OrderStatus.placed || o.status == OrderStatus.outForDelivery;
      if (_filter == 'delivered') return o.status == OrderStatus.delivered;
      if (_filter == 'billed') return o.status == OrderStatus.billed;
      if (_filter == 'paid') return o.status == OrderStatus.paid;
      return true;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery Orders'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle, color: AppColors.primaryGreen),
            onPressed: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (ctx) => CreateOrderScreen(repository: widget.repository),
                ),
              );
              setState(() {});
              widget.onDataChanged();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _filterChip('All', 'all'),
                _filterChip('To Deliver', 'pending'),
                _filterChip('Delivered', 'delivered'),
                _filterChip('Billed', 'billed'),
                _filterChip('Paid', 'paid'),
              ],
            ),
          ),
          // Orders List
          Expanded(
            child: orders.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CowMascotWidget(size: 80, mood: CowMood.happy, showMilkPacket: true),
                        SizedBox(height: 16),
                        Text(
                          'No orders in this status',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textMain),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Tap "+ New Order" below to schedule morning delivery',
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: orders.length,
                    itemBuilder: (context, index) {
                      final order = orders[index];
                      return _OrderCard(
                        order: order,
                        repository: widget.repository,
                        onUpdated: () {
                          setState(() {});
                          widget.onDataChanged();
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primaryGreen,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('New Order', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (ctx) => CreateOrderScreen(repository: widget.repository),
            ),
          );
          setState(() {});
          widget.onDataChanged();
        },
      ),
    );
  }

  Widget _filterChip(String label, String key) {
    final isSelected = _filter == key;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        selectedColor: AppColors.softGreen,
        onSelected: (val) {
          if (val) setState(() => _filter = key);
        },
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Order order;
  final DoodhDostRepository repository;
  final VoidCallback onUpdated;

  const _OrderCard({
    required this.order,
    required this.repository,
    required this.onUpdated,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    order.shopName,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textMain),
                  ),
                ),
                Text(
                  '₹${order.estimatedTotal.toStringAsFixed(0)}',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              '${order.orderNumber} · ${order.totalDeliveredPackets} packets',
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            const Divider(height: 20),
            // Items Preview
            ...order.items.map((item) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('${item.productName} (${item.packetSize})', style: const TextStyle(fontSize: 13)),
                      Text('${item.deliveredQuantity} / ${item.orderedQuantity} pkts', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    ],
                  ),
                )),
            const SizedBox(height: 12),
            // Status Action Button
            if (order.status == OrderStatus.placed || order.status == OrderStatus.outForDelivery)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGreen,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.check_circle_outline, size: 18),
                  label: const Text('Confirm Delivery Quantities'),
                  onPressed: () => _showDeliveryDialog(context),
                ),
              )
            else if (order.status == OrderStatus.delivered && !order.isBilled)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.creamAccent,
                    foregroundColor: const Color(0xFF8C5D19),
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.receipt_long, size: 18),
                  label: const Text('Finalize Bill & Invoicing'),
                  onPressed: () => _showFinalizeBillDialog(context),
                ),
              )
            else if (order.status == OrderStatus.billed)
              Container(
                padding: const EdgeInsets.symmetric(vertical: 8),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.paleGreenBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text('Billed — Ready for Payment Collection', style: TextStyle(color: AppColors.primaryGreen, fontWeight: FontWeight.bold, fontSize: 12)),
              ),
          ],
        ),
      ),
    );
  }

  void _showDeliveryDialog(BuildContext context) {
    final qtyControllers = {
      for (var item in order.items)
        item.productId: TextEditingController(
          text: (item.deliveredQuantity > 0 ? item.deliveredQuantity : item.orderedQuantity).toString(),
        ),
    };

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Confirm Delivery: ${order.shopName}'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Enter actual packets delivered to the shop:',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 12),
              ...order.items.map((item) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.productName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            Text('Ordered: ${item.orderedQuantity} pkts', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        flex: 1,
                        child: TextField(
                          controller: qtyControllers[item.productId],
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: 'Delivered',
                            contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryGreen, foregroundColor: Colors.white),
            onPressed: () {
              final deliveryMap = <String, int>{};
              for (var item in order.items) {
                final parsed = int.tryParse(qtyControllers[item.productId]?.text ?? '') ?? item.orderedQuantity;
                deliveryMap[item.productId] = parsed < 0 ? 0 : parsed;
              }
              repository.updateDeliveryQuantities(order.id, OrderStatus.delivered, deliveryMap);
              Navigator.pop(ctx);
              onUpdated();
            },
            child: const Text('Save & Mark Delivered'),
          ),
        ],
      ),
    );
  }

  void _showFinalizeBillDialog(BuildContext context) {
    final returns = repository.getReturns().where((r) => r.orderId == order.id).toList();
    final returnCredits = returns.fold<double>(0.0, (sum, r) => sum + r.totalCredit);
    final deliveredValue = order.items.fold<double>(0.0, (sum, i) => sum + (i.deliveredQuantity * i.unitPrice));
    final shop = repository.getShops().firstWhere((s) => s.id == order.shopId, orElse: () => repository.getShops().first);

    final chargesCtrl = TextEditingController(text: '0');
    final discountCtrl = TextEditingController(text: '0');

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) {
          final otherCharges = double.tryParse(chargesCtrl.text) ?? 0.0;
          final discount = double.tryParse(discountCtrl.text) ?? 0.0;
          final netAmount = (deliveredValue - returnCredits + otherCharges - discount).clamp(0.0, double.infinity);
          final totalWithPrev = shop.currentBalance + netAmount;

          return AlertDialog(
            title: Text('Finalize Bill: ${order.shopName}'),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _billRow('Delivered Value:', '₹${deliveredValue.toStringAsFixed(2)}', isBold: true),
                  if (returnCredits > 0)
                    _billRow('Return Credits:', '-₹${returnCredits.toStringAsFixed(2)}', color: Colors.red),
                  const Divider(),
                  TextField(
                    controller: chargesCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Other Charges / Crates (₹)'),
                    onChanged: (_) => setDialogState(() {}),
                  ),
                  TextField(
                    controller: discountCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Discount / Scheme (₹)'),
                    onChanged: (_) => setDialogState(() {}),
                  ),
                  const Divider(height: 24),
                  _billRow('Today Net Bill:', '₹${netAmount.toStringAsFixed(2)}', isBold: true, color: AppColors.primaryGreen),
                  _billRow('Previous Balance:', '₹${shop.currentBalance.toStringAsFixed(2)}'),
                  _billRow('Total Due with Balance:', '₹${totalWithPrev.toStringAsFixed(2)}', isBold: true, color: const Color(0xFF8C5D19)),
                ],
              ),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryGreen, foregroundColor: Colors.white),
                onPressed: () {
                  final charges = double.tryParse(chargesCtrl.text) ?? 0.0;
                  final disc = double.tryParse(discountCtrl.text) ?? 0.0;
                  repository.finalizeBill(order.id, returnCredits, charges, disc);
                  Navigator.pop(ctx);
                  onUpdated();
                },
                child: const Text('Generate Invoice'),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _billRow(String label, String value, {bool isBold = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 13, fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
          Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: color ?? AppColors.textMain,
            ),
          ),
        ],
      ),
    );
  }
}
