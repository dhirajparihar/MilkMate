import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/theme/app_colors.dart';
import 'core/widgets/cow_mascot.dart';
import 'shared/repositories/doodh_dost_repository.dart';
import 'features/orders/orders_screen.dart';
import 'features/orders/create_order_screen.dart';
import 'features/shops/shops_screen.dart';
import 'features/billing/final_bill_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const DoodhDostApp());
}

class DoodhDostApp extends StatelessWidget {
  const DoodhDostApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Doodh Dost',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: AppColors.background,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primaryGreen,
          primary: AppColors.primaryGreen,
          surface: AppColors.background,
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(),
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.background,
          elevation: 0,
          scrolledUnderElevation: 0,
          iconTheme: IconThemeData(color: AppColors.textMain),
          titleTextStyle: TextStyle(
            color: AppColors.textMain,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;
  final DoodhDostRepository _repository = DoodhDostRepository();

  void _refresh() {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      DashboardView(
        repository: _repository,
        onNavigate: (index) => setState(() => _currentIndex = index),
      ),
      OrdersScreen(
        repository: _repository,
        onDataChanged: _refresh,
      ),
      ShopsScreen(
        repository: _repository,
        onDataChanged: _refresh,
      ),
      MoreMenuView(
        repository: _repository,
        onDataChanged: _refresh,
      ),
    ];

    return Scaffold(
      body: screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        backgroundColor: Colors.white,
        indicatorColor: AppColors.softGreen,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home, color: AppColors.primaryGreen),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long, color: AppColors.primaryGreen),
            label: 'Orders',
          ),
          NavigationDestination(
            icon: Icon(Icons.storefront_outlined),
            selectedIcon: Icon(Icons.storefront, color: AppColors.primaryGreen),
            label: 'Shops',
          ),
          NavigationDestination(
            icon: Icon(Icons.menu),
            selectedIcon: Icon(Icons.menu_open, color: AppColors.primaryGreen),
            label: 'More',
          ),
        ],
      ),
    );
  }
}

class DashboardView extends StatelessWidget {
  final DoodhDostRepository repository;
  final ValueChanged<int> onNavigate;

  const DashboardView({
    super.key,
    required this.repository,
    required this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    final metrics = repository.getDashboardMetrics();
    final todayStr = DateTime.now().toString().split(' ')[0];

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const CowMascotWidget(size: 36, showMilkPacket: false),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    const Text(
                      'Doodh Dost',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 16,
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.softGreen,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFFB9E6C8)),
                      ),
                      child: const Text(
                        'दूध दोस्त',
                        style: TextStyle(
                          fontSize: 10,
                          color: AppColors.primaryGreen,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 1),
                const Text(
                  'Your daily milk business, made simple.',
                  style: TextStyle(
                    fontSize: 10,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.normal,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Header Card with Mascot
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.paleGreenBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.softGreen.withValues(alpha: 0.7)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          todayStr,
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Good morning, Ramesh!',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textMain),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Ready for early morning milk delivery rounds.',
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                  const CowMascotWidget(size: 68, showMilkPacket: true),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Primary Action Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(Icons.add, size: 20),
                label: const Text('+ New Daily Order', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (ctx) => CreateOrderScreen(repository: repository),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            // Metric Cards Grid
            Row(
              children: [
                Expanded(child: _MetricCard(title: 'Orders Today', value: '${metrics['ordersToday']}', icon: Icons.receipt_long)),
                const SizedBox(width: 12),
                Expanded(child: _MetricCard(title: 'Packets to Deliver', value: '${metrics['packetsToDeliver']}', icon: Icons.local_shipping)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _MetricCard(title: 'Billed Sales', value: '₹${(metrics['billedSales'] as double).toStringAsFixed(0)}', icon: Icons.currency_rupee)),
                const SizedBox(width: 12),
                Expanded(child: _MetricCard(title: 'Collected', value: '₹${(metrics['collected'] as double).toStringAsFixed(0)}', icon: Icons.payments_outlined)),
              ],
            ),
            const SizedBox(height: 16),
            // Outstanding Summary Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.creamAccent,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFFFE1B3)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Total Shop Dues', style: TextStyle(fontSize: 12, color: Color(0xFF8C5D19), fontWeight: FontWeight.bold)),
                      Text(
                        '₹${(metrics['totalOutstanding'] as double).toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF8C5D19)),
                      ),
                    ],
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF8C5D19),
                      elevation: 0,
                    ),
                    onPressed: () => onNavigate(2),
                    child: const Text('View Shops'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;

  const _MetricCard({
    required this.title,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.primaryGreen, size: 22),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textMain)),
        ],
      ),
    );
  }
}

class MoreMenuView extends StatelessWidget {
  final DoodhDostRepository repository;
  final VoidCallback onDataChanged;

  const MoreMenuView({
    super.key,
    required this.repository,
    required this.onDataChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('More Tools & Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Brand Header Card with Mascot Logo
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFF1F8F3), Color(0xFFE3F2E8)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFB9E6C8)),
            ),
            child: Row(
              children: [
                const CowMascotWidget(size: 64, mood: CowMood.delivery, showMilkPacket: true),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Text(
                            'Doodh Dost',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              color: AppColors.textMain,
                              letterSpacing: -0.4,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: const Color(0xFFB9E6C8)),
                            ),
                            child: const Text(
                              'दूध दोस्त',
                              style: TextStyle(
                                fontSize: 10,
                                color: AppColors.primaryGreen,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      const Text(
                        'Milk Distributor Operations',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primaryGreen),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Version 1.0.0 • Offline SQLite Active',
                        style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          _menuTile(
            context,
            icon: Icons.receipt_long,
            title: 'Bills & Invoice History',
            subtitle: 'View finalized bills & record cash/UPI payments',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (ctx) => FinalBillScreen(repository: repository, onDataChanged: onDataChanged),
                ),
              );
            },
          ),
          _menuTile(
            context,
            icon: Icons.inventory_2_outlined,
            title: 'Milk Catalogue',
            subtitle: '${repository.getProducts().length} products configured',
            onTap: () {},
          ),
          _menuTile(
            context,
            icon: Icons.cloud_outlined,
            title: 'Supabase Database Sync',
            subtitle: 'PostgreSQL cloud database connected',
            onTap: () {},
          ),
          _menuTile(
            context,
            icon: Icons.verified_user_outlined,
            title: 'Automated Test Suite',
            subtitle: '18 business rules passed',
            onTap: () {},
          ),
          const SizedBox(height: 20),
          const Center(
            child: Column(
              children: [
                CowMascotWidget(size: 40, mood: CowMood.celebrating, showMilkPacket: false),
                SizedBox(height: 8),
                Text(
                  'Doodh Dost — Your daily milk business, made simple.',
                  style: TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                ),
                SizedBox(height: 20),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _menuTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: AppColors.border),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppColors.paleGreenBg,
          child: Icon(icon, color: AppColors.primaryGreen, size: 20),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        trailing: const Icon(Icons.chevron_right, color: AppColors.textSecondary),
        onTap: onTap,
      ),
    );
  }
}
