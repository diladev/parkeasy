import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityService {
  final Connectivity _connectivity = Connectivity();
  final StreamController<bool> _connectivityController =
      StreamController<bool>.broadcast();
  late final StreamSubscription<List<ConnectivityResult>> _subscription;

  ConnectivityService() {
    _initConnectivity();
    _subscription = _connectivity.onConnectivityChanged.listen((results) {
      _connectivityController.add(results.hasConnectivity);
    });
  }

  Future<void> _initConnectivity() async {
    try {
      final results = await _connectivity.checkConnectivity();
      _connectivityController.add(results.hasConnectivity);
    } catch (_) {
      _connectivityController.add(false);
    }
  }

  Stream<bool> get connectivityStream => _connectivityController.stream;

  Future<bool> checkConnection() async {
    final results = await _connectivity.checkConnectivity();
    return results.hasConnectivity;
  }

  Future<void> dispose() async {
    await _subscription.cancel();
    await _connectivityController.close();
  }
}
