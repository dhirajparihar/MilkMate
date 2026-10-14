import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../shared/models/models.dart';
import '../../shared/repositories/doodh_dost_repository.dart';
import '../config/app_config.dart';
import '../utils/uuid_converter.dart';

class ConnectionStatus {
  final bool isConnected;
  final bool isTablesCreated;
  final String message;

  ConnectionStatus({
    required this.isConnected,
    required this.isTablesCreated,
    required this.message,
  });
}

class SupabaseService {
  static const String _kUrlKey = 'doodh_dost_supabase_url';
  static const String _kAnonKey = 'doodh_dost_supabase_anon_key';
  static const String _kLastSyncKey = 'doodh_dost_last_sync_time';

  static SupabaseService? _instance;
  static SupabaseService get instance => _instance ??= SupabaseService._();

  SupabaseService._();

  String _url = '';
  String _anonKey = '';
  bool _isInitialized = false;

  String get url => _url;
  String get anonKey => _anonKey;
  bool get isConfigured => _url.trim().isNotEmpty && _anonKey.trim().isNotEmpty;
  bool get isInitialized => _isInitialized;

  SupabaseClient? get client => _isInitialized ? Supabase.instance.client : null;

  /// Automatically clean and format Supabase Project URLs
  static String sanitizeUrl(String input) {
    var u = input.trim();

    // 1. If user copied the dashboard browser URL, e.g.:
    // https://supabase.com/dashboard/project/abcdefghijk/editor/...
    final dashboardMatch = RegExp(r'supabase\.com/dashboard/project/([a-zA-Z0-9_\-]+)').firstMatch(u);
    if (dashboardMatch != null) {
      final projectId = dashboardMatch.group(1);
      return 'https://$projectId.supabase.co';
    }

    // 2. Ensure https:// scheme
    if (!u.startsWith('http://') && !u.startsWith('https://')) {
      u = 'https://$u';
    }

    // 3. Extract just origin (scheme + host)
    try {
      final uri = Uri.parse(u);
      return '${uri.scheme}://${uri.host}';
    } catch (_) {
      u = u.replaceAll(RegExp(r'/+$'), '');
      u = u.replaceAll(RegExp(r'/rest/v1/?$'), '');
      return u;
    }
  }

  /// Load saved credentials from local storage or AppConfig defaults
  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final savedUrl = prefs.getString(_kUrlKey);
    final savedKey = prefs.getString(_kAnonKey);

    _url = sanitizeUrl((savedUrl != null && savedUrl.isNotEmpty) ? savedUrl : AppConfig.defaultSupabaseUrl);
    _anonKey = ((savedKey != null && savedKey.isNotEmpty) ? savedKey : AppConfig.defaultSupabaseAnonKey).trim();

    if (isConfigured) {
      await _initializeClient(_url, _anonKey);
    }
  }

  Future<DateTime?> getLastSyncTime() async {
    final prefs = await SharedPreferences.getInstance();
    final str = prefs.getString(_kLastSyncKey);
    if (str != null) {
      return DateTime.tryParse(str);
    }
    return null;
  }

  /// Save new credentials and initialize client
  Future<ConnectionStatus> saveAndTest(String url, String anonKey) async {
    final cleanUrl = sanitizeUrl(url);
    final cleanKey = anonKey.trim();

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kUrlKey, cleanUrl);
    await prefs.setString(_kAnonKey, cleanKey);

    _url = cleanUrl;
    _anonKey = cleanKey;

    if (!isConfigured) {
      return ConnectionStatus(
        isConnected: false,
        isTablesCreated: false,
        message: 'Please enter both a valid Project URL and Anon Key.',
      );
    }

    await _initializeClient(_url, _anonKey);
    return await testConnection();
  }

  Future<bool> _initializeClient(String url, String anonKey) async {
    try {
      if (!_isInitialized) {
        await Supabase.initialize(
          url: url,
          anonKey: anonKey,
          debug: kDebugMode,
        );
        _isInitialized = true;
      }
      return true;
    } catch (e) {
      debugPrint('Supabase initialize info: $e');
      _isInitialized = true; // Supabase already initialized or instance active
      return true;
    }
  }

  /// Detailed connection test verifying both API reachability and PostgreSQL table existence
  Future<ConnectionStatus> testConnection() async {
    if (!isConfigured) {
      return ConnectionStatus(
        isConnected: false,
        isTablesCreated: false,
        message: 'Supabase credentials not configured.',
      );
    }

    try {
      if (!_isInitialized) {
        await _initializeClient(_url, _anonKey);
      }

      final supabase = Supabase.instance.client;

      // 1. Verify API Key and Project connectivity via Auth service (always present)
      try {
        await supabase.auth.getSession();
      } catch (authError) {
        return ConnectionStatus(
          isConnected: false,
          isTablesCreated: false,
          message: 'Connection failed. Please check your Project URL and Anon Key.\nError: $authError',
        );
      }

      // 2. Verify whether SQL tables (like products) exist in PostgreSQL
      try {
        await supabase.from('products').select('id').limit(1);
        return ConnectionStatus(
          isConnected: true,
          isTablesCreated: true,
          message: '✓ Fully connected! PostgreSQL tables are active and ready for sync.',
        );
      } on PostgrestException catch (pgrst) {
        // PGRST125 or 42P01: Table not found or schema not migrated yet
        if (pgrst.code == 'PGRST125' ||
            pgrst.code == '42P01' ||
            pgrst.message.contains('relation') ||
            pgrst.message.contains('Invalid path')) {
          return ConnectionStatus(
            isConnected: true,
            isTablesCreated: false,
            message: 'Connected to your Supabase project, but the "products" table was not found.\n'
                'Please run the SQL migration in your Supabase SQL Editor.',
          );
        }
        return ConnectionStatus(
          isConnected: false,
          isTablesCreated: false,
          message: 'Database query error: ${pgrst.message} (Code: ${pgrst.code})',
        );
      }
    } catch (e) {
      debugPrint('Supabase test connection failed: $e');
      return ConnectionStatus(
        isConnected: false,
        isTablesCreated: false,
        message: 'Could not connect: $e',
      );
    }
  }

  /// Sync all local data to Supabase
  Future<Map<String, int>> syncAll(DoodhDostRepository repository) async {
    if (!isConfigured || !_isInitialized) {
      throw StateError('Supabase is not configured or connected. Please check your credentials.');
    }

    final supabase = Supabase.instance.client;
    final user = supabase.auth.currentUser;
    final distributorId = user?.id ?? UuidConverter.defaultDistributorId;

    // Optional profile upsert for standalone/demo usage
    try {
      await supabase.from('profiles').upsert({
        'id': distributorId,
        'business_name': 'Doodh Dost Operations',
        'distributor_name': 'Milk Distributor',
        'phone': '9876543210',
      });
    } catch (e) {
      debugPrint('Profiles note (proceeding): $e');
    }

    int shopsCount = 0;
    int productsCount = 0;
    int ordersCount = 0;
    int invoicesCount = 0;
    int paymentsCount = 0;

    // 1. Sync Products
    for (var prod in repository.getProducts()) {
      await supabase.from('products').upsert({
        'id': UuidConverter.toUuid(prod.id),
        'distributor_id': distributorId,
        'name': prod.name,
        'packet_size': prod.packetSize,
        'sku': prod.sku,
        'default_price': prod.defaultPrice,
        'purchase_cost': prod.purchaseCost,
        'return_policy_type': prod.returnPolicyType.name,
        'return_credit_percentage': prod.returnCreditPercentage,
        'is_active': prod.isActive,
      });
      productsCount++;
    }

    // 2. Sync Shops
    for (var shop in repository.getShops()) {
      await supabase.from('shops').upsert({
        'id': UuidConverter.toUuid(shop.id),
        'distributor_id': distributorId,
        'name': shop.name,
        'owner_name': shop.ownerName,
        'phone': shop.phone,
        'address': shop.address,
        'route_area': shop.routeArea,
        'opening_balance': shop.openingBalance,
        'current_balance': shop.currentBalance,
        'is_active': shop.isActive,
      });
      shopsCount++;
    }

    // 3. Sync Orders
    for (var order in repository.getOrders()) {
      final orderUuid = UuidConverter.toUuid(order.id);
      await supabase.from('orders').upsert({
        'id': orderUuid,
        'distributor_id': distributorId,
        'order_number': order.orderNumber,
        'shop_id': UuidConverter.toUuid(order.shopId),
        'order_date': order.orderDate.toIso8601String().split('T')[0],
        'status': order.status.name,
        'total_delivered_packets': order.totalDeliveredPackets,
        'estimated_total': order.estimatedTotal,
        'is_billed': order.isBilled,
      });
      ordersCount++;

      // Sync Order Items
      for (var item in order.items) {
        await supabase.from('order_items').upsert({
          'id': UuidConverter.toUuid('${order.id}_${item.productId}_${item.id}'),
          'order_id': orderUuid,
          'product_id': UuidConverter.toUuid(item.productId),
          'ordered_quantity': item.orderedQuantity,
          'delivered_quantity': item.deliveredQuantity,
          'unit_price': item.unitPrice,
          'line_total': item.lineTotal,
        });
      }
    }

    // 4. Sync Invoices
    for (var inv in repository.getInvoices()) {
      await supabase.from('invoices').upsert({
        'id': UuidConverter.toUuid(inv.id),
        'distributor_id': distributorId,
        'invoice_number': inv.invoiceNumber,
        'order_id': UuidConverter.toUuid(inv.orderId),
        'shop_id': UuidConverter.toUuid(inv.shopId),
        'invoice_date': inv.invoiceDate.toIso8601String().split('T')[0],
        'delivered_value': inv.deliveredValue,
        'total_return_credits': inv.totalReturnCredits,
        'other_charges': inv.otherCharges,
        'discount': inv.discount,
        'net_amount': inv.netAmount,
        'paid_amount': inv.paidAmount,
        'remaining_amount': inv.remainingAmount,
        'status': inv.status.name,
        'previous_shop_balance': inv.previousShopBalance,
        'total_due_with_previous': inv.totalDueWithPrevious,
      });
      invoicesCount++;
    }

    // 5. Sync Payments
    for (var pay in repository.getPayments()) {
      await supabase.from('payments').upsert({
        'id': UuidConverter.toUuid(pay.id),
        'distributor_id': distributorId,
        'payment_number': pay.paymentNumber,
        'invoice_id': UuidConverter.toUuid(pay.invoiceId),
        'shop_id': UuidConverter.toUuid(pay.shopId),
        'amount': pay.amount,
        'payment_method': pay.method.name,
        'upi_reference': pay.upiReference,
        'payment_date': pay.paymentDate.toIso8601String().split('T')[0],
      });
      paymentsCount++;
    }

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_kLastSyncKey, DateTime.now().toIso8601String());
    } catch (_) {}

    return {
      'shops': shopsCount,
      'products': productsCount,
      'orders': ordersCount,
      'invoices': invoicesCount,
      'payments': paymentsCount,
    };
  }
}


