import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/service/connectivity_service.dart';

class ConnectivityCubit extends Cubit<bool> {
  final ConnectivityService _connectivityService;
  late final StreamSubscription<bool> _subscription;

  ConnectivityCubit(this._connectivityService) : super(true) {
    _subscription = _connectivityService.connectivityStream.listen(emit);
    _checkInitial();
  }

  Future<void> _checkInitial() async {
    emit(await _connectivityService.checkConnection());
  }

  @override
  Future<void> close() {
    _subscription.cancel();
    return super.close();
  }
}
