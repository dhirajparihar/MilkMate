import 'dart:convert';
import 'package:crypto/crypto.dart';

class UuidConverter {
  static final _uuidRegex = RegExp(
    r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
  );

  /// Default standalone fallback distributor profile UUID
  static const String defaultDistributorId = '00000000-0000-0000-0000-000000000001';

  /// Deterministically converts any string identifier (e.g. "prod-001", "shop-001")
  /// into a valid RFC 4122 UUID.
  /// If the input is already a valid UUID, it is returned normalized in lowercase.
  static String toUuid(String id) {
    final trimmed = id.trim();
    if (trimmed.isEmpty) {
      return defaultDistributorId;
    }
    if (_uuidRegex.hasMatch(trimmed)) {
      return trimmed.toLowerCase();
    }

    // RFC 4122 UUID v3 (MD5-based deterministic namespace UUID)
    final hashBytes = md5.convert(utf8.encode('doodh_dost_ns:$trimmed')).bytes;
    final b = List<int>.from(hashBytes);

    // Set version to 3 (0011xxxx)
    b[6] = (b[6] & 0x0f) | 0x30;
    // Set variant to RFC 4122 (10xxxxxx)
    b[8] = (b[8] & 0x3f) | 0x80;

    final hex = b.map((byte) => byte.toRadixString(16).padLeft(2, '0')).join();
    return '${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}';
  }
}
