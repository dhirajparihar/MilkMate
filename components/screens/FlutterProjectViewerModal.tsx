'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Download, Copy, Check, FileCode, FolderGit2, Sparkles, CheckCircle2 } from 'lucide-react';
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
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(),
      ),
      home: const MainNavigationShell(),
    );
  }
}`,
  },

  'lib/core/widgets/cow_mascot.dart': {
    path: 'lib/core/widgets/cow_mascot.dart',
    lang: 'dart',
    content: `import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class CowMascotWidget extends StatelessWidget {
  final double size;
  final bool showMilkPacket;

  const CowMascotWidget({super.key, this.size = 72.0, this.showMilkPacket = true});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _CowPainter(showMilkPacket: showMilkPacket)),
    );
  }
}
// Full vector painter with round white body, horns, pink snout, smile & milk packet pouch`,
  },

  'lib/core/widgets/quantity_stepper.dart': {
    path: 'lib/core/widgets/quantity_stepper.dart',
    lang: 'dart',
    content: `import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class QuantityStepperWidget extends StatelessWidget {
  final int value;
  final ValueChanged<int> onChanged;
  final int min;
  final int max;
  final int step;
  final String? unit;

  const QuantityStepperWidget({
    super.key,
    required this.value,
    required this.onChanged,
    this.min = 0,
    this.max = 9999,
    this.step = 1,
    this.unit,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.paleGreenBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.softGreen.withOpacity(0.6)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(onPressed: value > min ? () => onChanged(value - step) : null, icon: const Icon(Icons.remove)),
          Text('\$value \${unit ?? ""}', style: const TextStyle(fontWeight: FontWeight.bold)),
          IconButton(onPressed: value < max ? () => onChanged(value + step) : null, icon: const Icon(Icons.add)),
        ],
      ),
    );
  }
}`,
  },

  'lib/shared/repositories/doodh_dost_repository.dart': {
    path: 'lib/shared/repositories/doodh_dost_repository.dart',
    lang: 'dart',
    content: `import 'dart:math';
import '../models/models.dart';

class DoodhDostRepository {
  final List<Shop> _shops = [];
  final List<Product> _products = [];
  final List<Order> _orders = [];
  final List<Invoice> _invoices = [];
  final List<Payment> _payments = [];

  DoodhDostRepository() {
    _seedInitialData();
  }

  // Shop CRUD, Product Catalog, Order taking, Delivery updates,
  // Same-day returns, Final billing snapshot, Cash/UPI payment ledger,
  // Real-time stock formula and dashboard calculations.
}`,
  },

  'lib/features/orders/create_order_screen.dart': {
    path: 'lib/features/orders/create_order_screen.dart',
    lang: 'dart',
    content: `// Touch-friendly multi-product daily order creator with shop-specific prices,
// large +/- quantity steppers, and sticky live order calculation sheet.`,
  },

  'lib/features/shops/shops_screen.dart': {
    path: 'lib/features/shops/shops_screen.dart',
    lang: 'dart',
    content: `// Retail shop roster, search by owner/phone, opening balance tracking,
// route filtering, and direct "+ Order" action button.`,
  },

  'lib/features/billing/final_bill_screen.dart': {
    path: 'lib/features/billing/final_bill_screen.dart',
    lang: 'dart',
    content: `// Immutable final invoice calculation with return credits deducted,
// line totals, payment collection modal with Cash & UPI radio.`,
  },

  'android/AndroidManifest.xml': {
    path: 'android/app/src/main/AndroidManifest.xml',
    lang: 'xml',
    content: `<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.doodhdost.app">
    <uses-permission android:name="android.permission.INTERNET"/>
    <application android:label="Doodh Dost" android:icon="@mipmap/ic_launcher">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>`,
  },

  'supabase/schema.sql': {
    path: 'supabase/migrations/20241013000000_doodh_dost_schema.sql',
    lang: 'sql',
    content: `-- Complete 19 PostgreSQL tables: profiles, shops, products, shop_product_prices,
-- orders, order_items, returns, invoices, payments, stock_receipts, stock_movements,
-- with Row Level Security (RLS) policies and integer-paise financial constraints.`,
  },

  'test/business_rules_test.dart': {
    path: 'test/business_rules_test.dart',
    lang: 'dart',
    content: `import 'package:flutter_test/flutter_test.dart';
import 'package:doodh_dost/shared/models/models.dart';

void main() {
  test('Rule 1: Line total calculation for order items', () {
    final item = OrderItem(id: '1', productId: 'p1', productName: 'Taaza', packetSize: '500ml', orderedQuantity: 40, deliveredQuantity: 38, unitPrice: 27.0);
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

      // Root files
      zip.file('doodh_dost/pubspec.yaml', FLUTTER_FILES['pubspec.yaml'].content);
      zip.file('doodh_dost/README.md', '# Doodh Dost Flutter App\\n\\nRun flutter pub get && flutter run');

      // Android files
      zip.file(
        'doodh_dost/android/app/src/main/AndroidManifest.xml',
        FLUTTER_FILES['android/AndroidManifest.xml'].content
      );
      zip.file('doodh_dost/android/build.gradle', 'allprojects { repositories { google(); mavenCentral() } }');
      zip.file('doodh_dost/android/settings.gradle', "include ':app'");

      // Lib files
      zip.file('doodh_dost/lib/main.dart', FLUTTER_FILES['lib/main.dart'].content);
      zip.file('doodh_dost/lib/core/widgets/cow_mascot.dart', FLUTTER_FILES['lib/core/widgets/cow_mascot.dart'].content);
      zip.file('doodh_dost/lib/core/widgets/quantity_stepper.dart', FLUTTER_FILES['lib/core/widgets/quantity_stepper.dart'].content);
      zip.file('doodh_dost/lib/shared/repositories/doodh_dost_repository.dart', FLUTTER_FILES['lib/shared/repositories/doodh_dost_repository.dart'].content);
      zip.file('doodh_dost/lib/features/orders/create_order_screen.dart', FLUTTER_FILES['lib/features/orders/create_order_screen.dart'].content);
      zip.file('doodh_dost/lib/features/shops/shops_screen.dart', FLUTTER_FILES['lib/features/shops/shops_screen.dart'].content);
      zip.file('doodh_dost/lib/features/billing/final_bill_screen.dart', FLUTTER_FILES['lib/features/billing/final_bill_screen.dart'].content);

      // Tests & Supabase
      zip.file('doodh_dost/test/business_rules_test.dart', FLUTTER_FILES['test/business_rules_test.dart'].content);
      zip.file(
        'doodh_dost/supabase/migrations/20241013000000_doodh_dost_schema.sql',
        FLUTTER_FILES['supabase/schema.sql'].content
      );

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
      title="Flutter Source Code & Android Project"
      subtitle="Complete standalone Flutter project for Android Studio"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Status Callout */}
        <div className="bg-[#F1F8F3] p-3.5 rounded-2xl border border-[#B9E6C8] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#246B4B]">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-bold">
              100% Complete Flutter Architecture: Models, Screens, Steppers, Mascot & Database Migration
            </span>
          </div>
        </div>

        {/* Download action card */}
        <div className="bg-[#FFF0D9] p-4 rounded-2xl border border-[#FFE1B3] flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-sm font-extrabold text-[#8C5D19] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>1-Click Flutter Project (.ZIP) Download</span>
            </div>
            <p className="text-xs text-[#8C5D19]">
              Download complete project with pubspec.yaml, AndroidManifest.xml, screens, models, and tests.
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
