import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/wallet/domain/entities/top_up.dart';

class TopUpModel extends TopUp {
  const TopUpModel({
    required super.id,
    required super.status,
    required super.amount,
    required super.provider,
    required super.readableCode,
    required super.appLink,
    required super.validUntil,
    super.paidAt,
    super.declineReason,
  });

  /// The response of POST /wallet/top-ups and GET /wallet/top-ups/:id.
  factory TopUpModel.fromMap(DataMap map) {
    // The API sends UTC; the app shows local time.
    DateTime? date(String key) {
      final value = map[key] as String?;
      return value == null ? null : DateTime.parse(value).toLocal();
    }

    return TopUpModel(
      id: (map['id'] as num).toInt(),
      status: TopUpStatus.fromApi(map['status'] as String?),
      amount: (map['amount'] as num? ?? 0).round(),
      provider: map['provider'] as String? ?? '',
      readableCode: map['readable_code'] as String? ?? '',
      appLink: map['app_link'] as String? ?? '',
      validUntil: date('valid_until') ?? DateTime.now(),
      paidAt: date('paid_at'),
      declineReason: map['decline_reason'] as String?,
    );
  }
}
