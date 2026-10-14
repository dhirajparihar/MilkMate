import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/repositories/doodh_dost_repository.dart';
import '../../core/widgets/cow_mascot.dart';
import '../orders/create_order_screen.dart';

class ShopsScreen extends StatefulWidget {
  final DoodhDostRepository repository;
  final VoidCallback onDataChanged;

  const ShopsScreen({
    super.key,
    required this.repository,
    required this.onDataChanged,
  });

  @override
  State<ShopsScreen> createState() => _ShopsScreenState();
}

class _ShopsScreenState extends State<ShopsScreen> {
  String _search = '';

  @override
  Widget build(BuildContext context) {
    final allShops = widget.repository.getShops();
    final shops = allShops.where((s) {
      return s.name.toLowerCase().contains(_search.toLowerCase()) ||
          (s.ownerName?.toLowerCase().contains(_search.toLowerCase()) ?? false) ||
          s.phone.contains(_search);
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Retail Shops'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add_outlined, color: AppColors.primaryGreen),
            onPressed: () => _showAddShopDialog(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search box
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search shop by name or phone...',
                prefixIcon: const Icon(Icons.search, color: AppColors.textSecondary),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
              ),
              onChanged: (val) => setState(() => _search = val),
            ),
          ),
          // Shops list
          Expanded(
            child: shops.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        CowMascotWidget(size: 80, mood: CowMood.happy, showMilkPacket: false),
                        SizedBox(height: 16),
                        Text(
                          'No shops found',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textMain),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Tap + in the top bar to add a new dairy/retail customer',
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: shops.length,
                    itemBuilder: (context, index) {
                final shop = shops[index];
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
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(shop.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                              const SizedBox(height: 4),
                              Text('${shop.ownerName ?? 'Owner'} · ${shop.phone}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                              Text(shop.address, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '₹${shop.currentBalance.toStringAsFixed(0)}',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: shop.currentBalance > 0 ? const Color(0xFF8C5D19) : AppColors.primaryGreen,
                              ),
                            ),
                            const Text('Outstanding', style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                            const SizedBox(height: 6),
                            InkWell(
                              onTap: () async {
                                await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (ctx) => CreateOrderScreen(repository: widget.repository, preselectedShopId: shop.id),
                                  ),
                                );
                                setState(() {});
                                widget.onDataChanged();
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.paleGreenBg,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text('+ Order', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryGreen)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showAddShopDialog(BuildContext context) {
    final nameCtrl = TextEditingController();
    final ownerCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final addrCtrl = TextEditingController();
    final balCtrl = TextEditingController(text: '0');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Retail Shop'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Shop Name *')),
              TextField(controller: ownerCtrl, decoration: const InputDecoration(labelText: 'Owner Name')),
              TextField(controller: phoneCtrl, decoration: const InputDecoration(labelText: 'Phone Number')),
              TextField(controller: addrCtrl, decoration: const InputDecoration(labelText: 'Address')),
              TextField(controller: balCtrl, decoration: const InputDecoration(labelText: 'Opening Balance (₹)'), keyboardType: TextInputType.number),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryGreen, foregroundColor: Colors.white),
            onPressed: () {
              if (nameCtrl.text.isNotEmpty) {
                widget.repository.addShop(
                  nameCtrl.text,
                  ownerCtrl.text,
                  phoneCtrl.text,
                  addrCtrl.text,
                  'Main Route',
                  double.tryParse(balCtrl.text) ?? 0.0,
                );
                Navigator.pop(ctx);
                setState(() {});
                widget.onDataChanged();
              }
            },
            child: const Text('Save Shop'),
          ),
        ],
      ),
    );
  }
}
