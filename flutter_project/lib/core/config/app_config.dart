class AppConfig {
  static const String appName = 'Doodh Dost';
  static const String appTagline = 'Your daily milk business, made simple.';
  static const String appVersion = '1.0.0';

  /// Production Supabase project backend URL
  static const String defaultSupabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://wewqqugdrgtcmeclwttx.supabase.co',
  );

  /// Production Supabase Anon public key
  /// Can be overridden at compile time via --dart-define=SUPABASE_ANON_KEY=...
  /// or loaded from secure local preferences.
  static const String defaultSupabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: '',
  );
}
