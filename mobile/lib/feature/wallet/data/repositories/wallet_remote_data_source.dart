import 'package:mobile/core/constants/end_points.dart';
import 'package:mobile/core/network/api_client.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/wallet/data/models/top_up_model.dart';
import 'package:mobile/feature/wallet/data/models/wallet_transaction_model.dart';
import 'package:mobile/feature/wallet/domain/entities/top_up.dart';
import 'package:mobile/feature/wallet/domain/entities/wallet_transaction_page.dart';

abstract class WalletRemoteDataSource {
  Future<int> getBalance();

  Future<WalletTransactionPage> getTransactions({int page = 1});

  Future<TopUp> startTopUp(int amount);

  Future<TopUp> getTopUp(int topUpId);

  Future<TopUp> cancelTopUp(int topUpId);

  Future<void> decideTestPayment(TopUp topUp, {required bool approve});
}

class WalletRemoteDataSourceImpl implements WalletRemoteDataSource {
  WalletRemoteDataSourceImpl(this._api);

  final ApiClient _api;

  static const int _pageSize = 20;

  @override
  Future<int> getBalance() async {
    final response = await _api.get(kWallet);
    return (response.map['balance'] as num? ?? 0).round();
  }

  @override
  Future<WalletTransactionPage> getTransactions({int page = 1}) async {
    final response = await _api.get(
      '$kWalletTransactions?page=$page&pageSize=$_pageSize',
    );

    // { data: [...], meta: { currentPage, totalPages, ... }, links }
    final items = response.map['data'] as List<dynamic>? ?? const [];
    final meta = response.map['meta'] as DataMap? ?? const {};
    final currentPage = (meta['currentPage'] as num? ?? page).toInt();
    final totalPages = (meta['totalPages'] as num? ?? page).toInt();

    return WalletTransactionPage(
      transactions: items
          .map((item) => WalletTransactionModel.fromMap(item as DataMap))
          .toList(),
      hasMore: currentPage < totalPages,
    );
  }

  @override
  Future<TopUp> startTopUp(int amount) async {
    final response = await _api.post(kTopUps, body: {'amount': amount});
    return TopUpModel.fromMap(response.map);
  }

  @override
  Future<TopUp> getTopUp(int topUpId) async {
    final response = await _api.get('$kTopUps/$topUpId');
    return TopUpModel.fromMap(response.map);
  }

  @override
  Future<TopUp> cancelTopUp(int topUpId) async {
    final response = await _api.post('$kTopUps/$topUpId/cancel');
    return TopUpModel.fromMap(response.map);
  }

  @override
  Future<void> decideTestPayment(TopUp topUp, {required bool approve}) async {
    // The test bank knows the payment by its own id, the end of the app
    // link ("parkeasy-mock-fib://pay/<id>"), as a banking app would.
    final providerPaymentId = Uri.parse(topUp.appLink).pathSegments.last;
    final action = approve ? 'approve' : 'decline';
    await _api.post('$kMockBank/$providerPaymentId/$action');
  }
}
