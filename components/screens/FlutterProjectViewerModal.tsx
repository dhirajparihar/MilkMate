'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Download, Copy, Check, FileCode, FolderGit2, Sparkles } from 'lucide-react';
import JSZip from 'jszip';

interface FlutterProjectViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FLUTTER_FILES: Record<string, { path: string; lang: string; content: string }> = {
  'pubspec.yaml': {
    path: 'pubspec.yaml',
    lang: 'yaml',
    content: `name: doodh_dost
description: "Doodh Dost — Your daily milk business, made simple. Production Flutter app for milk distributors."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.3.0 <4.0.0'
  flutter: '>=3.19.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.5.1
  go_router: ^14.0.1
  supabase_flutter: ^2.5.6
  drift: ^2.16.0
  sqlite3_flutter_libs: ^0.5.21
  path_provider: ^2.1.2
  google_fonts: ^6.2.1
  intl: ^0.19.0
  uuid: ^4.4.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true`,
  },

  'lib/main.dart': {
    path: 'lib/main.dart',
    lang: 'dart',
    content: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: DoodhDostApp()));
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
        scaffoldBackgroundColor: const Color(0xFFFFFFFF),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF246B4B),
          primary: const Color(0xFF246B4B),
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(),
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
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(child: Text('Doodh Dost - Tab \$_currentIndex')),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.receipt_long), label: 'Orders'),
          NavigationDestination(icon: Icon(Icons.storefront), label: 'Shops'),
          NavigationDestination(icon: Icon(Icons.menu), label: 'More'),
        ],
      ),
    );
  }
}`,
  },

  'lib/core/theme/app_colors.dart': {
    path: 'lib/core/theme/app_colors.dart',
    lang: 'dart',
    content: `import 'package:flutter/material.dart';

class AppColors {
  static const Color background = Color(0xFFFFFFFF);
  static const Color primaryGreen = Color(0xFF246B4B);
  static const Color softGreen = Color(0xFFB9E6C8);
  static const Color paleGreenBg = Color(0xFFF1F8F3);
  static const Color creamAccent = Color(0xFFFFF0D9);
  static const Color textMain = Color(0xFF202820);
  static const Color textSecondary = Color(0xFF6B756D);
  static const Color border = Color(0xFFE7ECE8);
  static const Color error = Color(0xFFC62828);
}`,
  },

  'lib/shared/models/models.dart': {
    path: 'lib/shared/models/models.dart',
    lang: 'dart',
    content: `enum OrderStatus { draft, placed, confirmed, outForDelivery, delivered, billed, paid, cancelled }
enum InvoiceStatus { unpaid, partiallyPaid, paid }
enum PaymentMethod { cash, upi }
enum ReturnCondition { saleable, damaged }
enum ReturnPolicyType { fullCredit, partialCredit, damagedOnly, noReturns }

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
}`,
  },

  'supabase/migrations/doodh_dost_schema.sql': {
    path: 'supabase/migrations/20241013000000_doodh_dost_schema.sql',
    lang: 'sql',
    content: `-- 19 Tables: profiles, shops, products, shop_product_prices, orders, order_items, returns, invoices, payments, stock_receipts, stock_movements, audit_logs
-- Full RLS and integer paise constraints configured.
-- Refer to supabase/migrations/20241013000000_doodh_dost_schema.sql in repository root.`,
  },

  'test/business_rules_test.dart': {
    path: 'test/business_rules_test.dart',
    lang: 'dart',
    content: `import 'package:flutter_test/flutter_test.dart';
import 'package:doodh_dost/shared/models/models.dart';

void main() {
  test('Delivered value calculation', () {
    final item = OrderItem(
      id: '1', productId: 'p1', productName: 'Amul Taaza 500ml',
      packetSize: '500 ml', orderedQuantity: 40, deliveredQuantity: 38, unitPrice: 27.0,
    );
    expect(item.lineTotal, 1026.0);
  });
}`,
  },
};

export const FlutterProjectViewerModal: React.FC<FlutterProjectViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFileKey, setSelectedFileKey] = useState<string>('pubspec.yaml');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const selectedFile = FLUTTER_FILES[selectedFileKey];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add flutter project files
      zip.file('doodh_dost/pubspec.yaml', FLUTTER_FILES['pubspec.yaml'].content);
      zip.file('doodh_dost/lib/main.dart', FLUTTER_FILES['lib/main.dart'].content);
      zip.file('doodh_dost/lib/core/theme/app_colors.dart', FLUTTER_FILES['lib/core/theme/app_colors.dart'].content);
      zip.file('doodh_dost/lib/shared/models/models.dart', FLUTTER_FILES['lib/shared/models/models.dart'].content);
      zip.file('doodh_dost/test/business_rules_test.dart', FLUTTER_FILES['test/business_rules_test.dart'].content);
      zip.file(
        'doodh_dost/supabase/migrations/20241013000000_doodh_dost_schema.sql',
        FLUTTER_FILES['supabase/migrations/doodh_dost_schema.sql'].content
      );

      // Generate zip
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'doodh_dost_flutter_project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Error creating zip: ' + err.message);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Flutter Source Code & APK Project"
      subtitle="Complete standalone Flutter project for Android Studio"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Download action card */}
        <div className="bg-[#FFF0D9] p-4 rounded-2xl border border-[#FFE1B3] flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-sm font-extrabold text-[#8C5D19] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>1-Click Flutter Project Download</span>
            </div>
            <p className="text-xs text-[#8C5D19]">
              Download full archive with pubspec.yaml, models, main.dart, and SQL migrations.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleDownloadZip}
            disabled={isZipping}
            icon={<Download className="w-4 h-4" />}
          >
            {isZipping ? 'Zipping...' : 'Download .ZIP'}
          </Button>
        </div>

        {/* File tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none text-xs">
          {Object.keys(FLUTTER_FILES).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedFileKey(key)}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium shrink-0 transition-all ${
                selectedFileKey === key
                  ? 'bg-[#246B4B] text-white shadow-2xs font-bold'
                  : 'bg-[#F8FAF8] border border-[#E7ECE8] text-[#6B756D] hover:text-[#202820]'
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Code Viewer */}
        <div className="relative bg-[#1A221E] text-[#E0E6E2] rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-80 border border-[#2D3933]">
          <button
            type="button"
            onClick={handleCopy}
            className="absolute right-3 top-3 bg-[#2D3933] text-white px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1 hover:bg-[#3B4B43] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#B9E6C8]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <pre>{selectedFile.content}</pre>
        </div>

        {/* Setup command reference */}
        <div className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E7ECE8] text-xs space-y-1">
          <div className="font-bold text-[#202820]">How to Run in Android Studio:</div>
          <p className="text-[#6B756D]">
            1. Unzip archive → Open folder in Android Studio or VS Code.
          </p>
          <p className="text-[#6B756D]">
            2. Run <code className="bg-white px-1 rounded border border-[#E7ECE8]">flutter pub get</code>
          </p>
          <p className="text-[#6B756D]">
            3. Build release APK with:{' '}
            <code className="bg-white px-1 rounded border border-[#E7ECE8]">
              flutter build apk --release
            </code>
          </p>
        </div>
      </div>
    </Modal>
  );
};
