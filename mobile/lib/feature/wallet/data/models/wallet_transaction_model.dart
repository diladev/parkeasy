import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/wallet/domain/entities/wallet_transaction.dart';

class WalletTransactionModel extends WalletTransaction {
  const WalletTransactionModel({
    required super.id,
    required super.isCredit,
    required super.amount,
    required super.category,
    required super.description,
    required super.createdAt,
    super.lotName,
  });

  /// One item of GET /wallet/transactions.
  factory WalletTransactionModel.fromMap(DataMap map) {
    return WalletTransactionModel(
      id: (map['id'] as num).toInt(),
      isCredit: map['type'] == 'credit',
      amount: (map['amount'] as num? ?? 0).round(),
      category: WalletTransactionCategory.fromApi(map['category'] as String?),
      description: map['description'] as String? ?? '',
      // The API sends UTC; the app shows local time.
      createdAt: DateTime.parse(map['createdAt'] as String).toLocal(),
      lotName: map['lot_name'] as String?,
    );
  }
}
