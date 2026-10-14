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
                      children: const [
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
                  label: const Text('Mark Delivered'),
                  onPressed: () {
                    repository.updateDeliveryQuantities(
                      order.id,
                      OrderStatus.delivered,
                      {for (var item in order.items) item.productId: item.deliveredQuantity},
                    );
                    onUpdated();
                  },
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
                  label: const Text('Finalize Bill'),
                  onPressed: () {
                    repository.finalizeBill(order.id, 0.0, 0.0, 0.0);
                    onUpdated();
                  },
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
}
