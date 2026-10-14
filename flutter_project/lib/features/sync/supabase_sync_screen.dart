import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/cow_mascot.dart';
import '../../core/services/supabase_service.dart';
import '../../shared/repositories/doodh_dost_repository.dart';

class SupabaseSyncScreen extends StatefulWidget {
  final DoodhDostRepository repository;

  const SupabaseSyncScreen({super.key, required this.repository});

  @override
  State<SupabaseSyncScreen> createState() => _SupabaseSyncScreenState();
}

class _SupabaseSyncScreenState extends State<SupabaseSyncScreen> {
  final _urlCtrl = TextEditingController();
  final _anonKeyCtrl = TextEditingController();

  bool _isTesting = false;
  bool _isSyncing = false;
  bool? _connectionSuccess;
  String? _statusMessage;
  DateTime? _lastSyncTime;
  Map<String, int>? _syncResults;

  bool _autoSyncEnabled = true;
  bool _syncOnCellular = true;
  bool _obscureKey = true;

  @override
  void initState() {
    super.initState();
    _loadCurrentConfig();
  }

  Future<void> _loadCurrentConfig() async {
    final service = SupabaseService.instance;
    await service.init();
    final lastTime = await service.getLastSyncTime();

    setState(() {
      _urlCtrl.text = service.url;
      _anonKeyCtrl.text = service.anonKey;
      _lastSyncTime = lastTime;
    });

    if (service.isConfigured) {
      final status = await service.testConnection();
      if (mounted) {
        setState(() {
          _connectionSuccess = status.isConnected;
          _statusMessage = status.message;
        });
      }
    }
  }

  Future<void> _saveAndTest() async {
    final url = _urlCtrl.text.trim();
    final key = _anonKeyCtrl.text.trim();

    if (url.isEmpty || key.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter both Project URL and Anon Key')),
      );
      return;
    }

    setState(() {
      _isTesting = true;
      _statusMessage = 'Connecting to Supabase...';
      _connectionSuccess = null;
    });

    final service = SupabaseService.instance;
    final status = await service.saveAndTest(url, key);

    setState(() {
      _isTesting = false;
      _urlCtrl.text = service.url;
      _connectionSuccess = status.isConnected && status.isTablesCreated;
      _statusMessage = status.message;
    });
  }

  Future<void> _syncData() async {
    setState(() {
      _isSyncing = true;
      _syncResults = null;
    });

    try {
      final results = await SupabaseService.instance.syncAll(widget.repository);
      final now = DateTime.now();
      setState(() {
        _isSyncing = false;
        _syncResults = results;
        _lastSyncTime = now;
        _connectionSuccess = true;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('All milk delivery & shop records backed up to cloud successfully!'),
            backgroundColor: AppColors.primaryGreen,
          ),
        );
      }
    } catch (e) {
      setState(() {
        _isSyncing = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Sync note: ${e.toString().replaceFirst('Exception: ', '')}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  String _formatLastSync(DateTime? time) {
    if (time == null) return 'Not backed up yet';
    final now = DateTime.now();
    final diff = now.difference(time);

    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min ago';
    if (diff.inHours < 24) return DateFormat('h:mm a').format(time);
    return DateFormat('dd MMM, h:mm a').format(time);
  }

  @override
  Widget build(BuildContext context) {
    final isConnected = _connectionSuccess == true;
    final shopsCount = widget.repository.getShops().length;
    final productsCount = widget.repository.getProducts().length;
    final ordersCount = widget.repository.getOrders().length;
    final invoicesCount = widget.repository.getInvoices().length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cloud Backup & Sync'),
        actions: [
          IconButton(
            tooltip: 'Refresh Status',
            icon: const Icon(Icons.refresh),
            onPressed: _loadCurrentConfig,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Status Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isConnected
                      ? [const Color(0xFFE8F5E9), const Color(0xFFF1F8E9)]
                      : [const Color(0xFFFFF8E1), const Color(0xFFFFFDE7)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isConnected ? const Color(0xFFB9E6C8) : const Color(0xFFFFE082),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.03),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      CowMascotWidget(
                        size: 56,
                        mood: isConnected ? CowMood.celebrating : CowMood.happy,
                        showMilkPacket: true,
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  isConnected ? 'Cloud Backup Active' : 'Offline Storage Active',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: isConnected ? AppColors.primaryGreen : const Color(0xFF8C5D19),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: isConnected ? Colors.green : Colors.amber.shade700,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              isConnected
                                  ? 'Your retail shops, morning delivery balances, and payments are protected in the cloud.'
                                  : 'Records are saved locally on your phone. Connect to cloud for automated backups.',
                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.3),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Last Backup: ${_formatLastSync(_lastSyncTime)}',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textMain,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  // Main One-Tap Backup Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      icon: _isSyncing
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Icon(Icons.cloud_upload_rounded, size: 22),
                      label: Text(
                        _isSyncing ? 'Backing up all records...' : 'Backup All Data to Cloud Now',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      onPressed: _isSyncing ? null : _syncData,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Live Records Summary Card
            const Text(
              'RECORDS IN LOCAL LEDGER',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textSecondary, letterSpacing: 0.8),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  _recordRow(Icons.storefront_outlined, 'Retail Stores & Shops', '$shopsCount registered shops'),
                  const Divider(height: 16),
                  _recordRow(Icons.inventory_2_outlined, 'Milk & Dairy Products', '$productsCount catalogue items'),
                  const Divider(height: 16),
                  _recordRow(Icons.receipt_long_outlined, 'Daily Orders & Deliveries', '$ordersCount orders recorded'),
                  const Divider(height: 16),
                  _recordRow(Icons.account_balance_wallet_outlined, 'Invoices & Ledger Balances', '$invoicesCount shop invoices calculated'),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Auto-Backup Preferences
            const Text(
              'BACKUP PREFERENCES',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textSecondary, letterSpacing: 0.8),
            ),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  SwitchListTile(
                    title: const Text('Auto-Backup After Delivery Round', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    subtitle: const Text('Automatically syncs when you finish your morning round', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    activeColor: AppColors.primaryGreen,
                    value: _autoSyncEnabled,
                    onChanged: (val) => setState(() => _autoSyncEnabled = val),
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    title: const Text('Sync Over Mobile Cellular Data', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    subtitle: const Text('Allows sync in remote milk delivery routes when Wi-Fi is unavailable', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    activeColor: AppColors.primaryGreen,
                    value: _syncOnCellular,
                    onChanged: (val) => setState(() => _syncOnCellular = val),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Data Protection Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFDCFCE7)),
              ),
              child: Row(
                children: const [
                  Icon(Icons.shield_outlined, color: AppColors.primaryGreen, size: 20),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'All milk delivery ledgers are protected with cloud persistence. Never lose outstanding balances even if a phone is lost or replaced.',
                      style: TextStyle(fontSize: 11.5, color: Color(0xFF166534), height: 1.3),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Advanced Developer & Server Settings (Accordion - Clean for End Users)
            Theme(
              data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
              child: ExpansionTile(
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                leading: const Icon(Icons.settings_suggest_outlined, size: 20, color: AppColors.textSecondary),
                title: const Text(
                  'Developer & Server Configuration',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                ),
                subtitle: const Text(
                  'Advanced database endpoints and migration patch tools',
                  style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                ),
                children: [
                  Container(
                    margin: const EdgeInsets.only(top: 8),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TextField(
                          controller: _urlCtrl,
                          decoration: InputDecoration(
                            labelText: 'Project URL',
                            hintText: 'https://xyz.supabase.co',
                            prefixIcon: const Icon(Icons.cloud_outlined, size: 20),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextField(
                          controller: _anonKeyCtrl,
                          obscureText: _obscureKey,
                          decoration: InputDecoration(
                            labelText: 'Anon Public Key',
                            prefixIcon: const Icon(Icons.key_outlined, size: 20),
                            suffixIcon: IconButton(
                              icon: Icon(_obscureKey ? Icons.visibility_outlined : Icons.visibility_off_outlined, size: 18),
                              onPressed: () => setState(() => _obscureKey = !_obscureKey),
                            ),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          ),
                        ),
                        const SizedBox(height: 14),
                        SizedBox(
                          width: double.infinity,
                          height: 44,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryGreen,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            icon: _isTesting
                                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : const Icon(Icons.check_circle_outline, size: 18),
                            label: const Text('Save & Test Connection'),
                            onPressed: _isTesting ? null : _saveAndTest,
                          ),
                        ),
                        const SizedBox(height: 14),
                        OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.primaryGreen,
                            side: const BorderSide(color: AppColors.primaryGreen),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          icon: const Icon(Icons.copy, size: 16),
                          label: const Text('Copy Standalone Sync SQL Patch'),
                          onPressed: () {
                            Clipboard.setData(const ClipboardData(text: _kSqlPatch));
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('SQL patch copied! Run in Supabase SQL editor to unlock anon sync.'),
                                backgroundColor: AppColors.primaryGreen,
                              ),
                            );
                          },
                        ),
                        if (_statusMessage != null) ...[
                          const SizedBox(height: 10),
                          Text(
                            _statusMessage!,
                            style: TextStyle(
                              fontSize: 11,
                              color: isConnected ? AppColors.primaryGreen : Colors.red,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _recordRow(IconData icon, String title, String subtitle) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.paleGreenBg,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: AppColors.primaryGreen, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              Text(subtitle, style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary)),
            ],
          ),
        ),
        const Icon(Icons.check_circle, color: Color(0xFF16A34A), size: 18),
      ],
    );
  }
}

const String _kSqlPatch = '''
-- ====================================================================
-- DOODH DOST SUPABASE QUICK FIX: UNLOCK STANDALONE & ANON SYNC
-- ====================================================================
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

INSERT INTO public.profiles (id, business_name, distributor_name, phone)
VALUES ('00000000-0000-0000-0000-000000000001', 'Doodh Dost Dairy Operations', 'Primary Distributor', '9876543210')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.products ALTER COLUMN distributor_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.shops ALTER COLUMN distributor_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.orders ALTER COLUMN distributor_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.invoices ALTER COLUMN distributor_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.payments ALTER COLUMN distributor_id SET DEFAULT '00000000-0000-0000-0000-000000000001';

DROP POLICY IF EXISTS "Distributor own products" ON public.products;
DROP POLICY IF EXISTS "Anon sync products" ON public.products;
CREATE POLICY "Anon sync products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Distributor own shops" ON public.shops;
DROP POLICY IF EXISTS "Anon sync shops" ON public.shops;
CREATE POLICY "Anon sync shops" ON public.shops FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Distributor own orders" ON public.orders;
DROP POLICY IF EXISTS "Anon sync orders" ON public.orders;
CREATE POLICY "Anon sync orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Distributor own order items" ON public.order_items;
DROP POLICY IF EXISTS "Anon sync order_items" ON public.order_items;
CREATE POLICY "Anon sync order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Distributor own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Anon sync invoices" ON public.invoices;
CREATE POLICY "Anon sync invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Distributor own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Anon sync invoice_items" ON public.invoice_items;
CREATE POLICY "Anon sync invoice_items" ON public.invoice_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Distributor own payments" ON public.payments;
DROP POLICY IF EXISTS "Anon sync payments" ON public.payments;
CREATE POLICY "Anon sync payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Distributor own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anon sync profiles" ON public.profiles;
CREATE POLICY "Anon sync profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
''';
