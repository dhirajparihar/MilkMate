# Doodh Dost — Milk Distributor Android App (Flutter)

> **"Your daily milk business, made simple."**

A complete, production-ready Flutter mobile application built for milk packet distributors supplying 21–100 local grocery shops and dairies. Optimized for early-morning, one-handed delivery operations.

---

## 🐮 Key Features

1. **Daily Dairy Stock Receipt:** Morning arrival logging for crates/pouches with supplier and lot tracking.
2. **Order Management:** Fast multi-product order entry with shop-specific price overrides.
3. **Delivery Adjustments:** Real-time quantity edits, shortage logging, and crate audit trail during delivery rounds.
4. **Return Management:** Same-day eligible returns before final invoice, supporting Full-credit, Partial-credit, and Damaged-only policies.
5. **Accurate Billing:** Immutable snapshot invoice generation using integer paise arithmetic.
6. **Payment Recording:** Cash & manual UPI tracking (with reference codes), partial payments, and rolling balance ledger.
7. **Inventory Ledger:** Real-time stock formula: `Opening + Received + Saleable Returns - Delivered - Damaged = Available Stock`.
8. **Mascot & Design:** Adorable white baby cow mascot, Material 3, and authentic milk distributor palette (`#246B4B`, `#B9E6C8`, `#FFF0D9`).
9. **Dual Mode:** Works offline with local SQLite/Drift persistence or cloud-synced with Supabase PostgreSQL & Row Level Security.

---

## 🛠️ Tech Stack

- **Flutter SDK:** 3.19+ / Dart 3.3+
- **State Management:** Riverpod 2.5
- **Navigation:** GoRouter 14
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Local Storage / Offline:** Drift SQLite & SharedPreferences
- **Design System:** Material 3 with Google Fonts (Plus Jakarta Sans)

---

## 🚀 Getting Started

### 1. Prerequisites
- [Flutter SDK (v3.19+)](https://flutter.dev/docs/get-started/install)
- [Android Studio](https://developer.android.com/studio) or VS Code with Flutter extension
- Android device or emulator (API level 24+)

### 2. Installation
```bash
# Clone or open the project folder
cd flutter_project

# Install dependencies
flutter pub get

# Run on connected Android device
flutter run
```

---

## ☁️ Connecting Supabase (Optional Cloud Sync)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open and run the migration file provided at:
   `supabase/migrations/20241013000000_doodh_dost_schema.sql`
4. Copy your **Project URL** and **Anon Public Key**.
5. Configure them in the app's **Settings > Cloud Sync** screen or via `--dart-define`:
   ```bash
   flutter run \
     --dart-define=SUPABASE_URL=https://your-project.supabase.co \
     --dart-define=SUPABASE_ANON_KEY=your-anon-key
   ```
*(Note: If no Supabase credentials are provided, Doodh Dost automatically runs in Local Demo Mode with full local persistence.)*

---

## 📱 Building the Release APK

To generate an optimized Android APK for distribution to milk distributors:

```bash
flutter build apk --release --split-per-abi
```

The APK file will be available at:
`build/app/outputs/flutter-apk/app-arm64-v8a-release.apk`

---

## 🧪 Running Automated Tests

Run the complete 18-rule test suite:

```bash
flutter test test/business_rules_test.dart
```
