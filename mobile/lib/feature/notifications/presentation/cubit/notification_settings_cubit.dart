import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/notifications/domain/entities/notification_settings.dart';
import 'package:mobile/feature/notifications/domain/usecases/get_notification_settings.dart';
import 'package:mobile/feature/notifications/domain/usecases/update_notification_setting.dart';

enum NotificationSettingsStatus { loading, loaded, failure }

class NotificationSettingsState extends Equatable {
  const NotificationSettingsState({
    this.status = NotificationSettingsStatus.loading,
    this.settings,
    this.errorMessage,
    this.errorSerial = 0,
  });

  final NotificationSettingsStatus status;
  final NotificationSettings? settings;
  final String? errorMessage;

  /// New for every error, so the screen shows two identical errors in a row.
  final int errorSerial;

  @override
  List<Object?> get props => [status, settings, errorMessage, errorSerial];
}

/// The Notifications screen's switches.
///
/// A switch moves as soon as it's tapped and is saved after; if saving
/// fails, it moves back.
class NotificationSettingsCubit extends Cubit<NotificationSettingsState> {
  NotificationSettingsCubit(this._getSettings, this._updateSetting)
    : super(const NotificationSettingsState());

  final GetNotificationSettings _getSettings;
  final UpdateNotificationSetting _updateSetting;

  Future<void> load() async {
    emit(const NotificationSettingsState());

    final result = await _getSettings();
    if (isClosed) return;
    result.fold(
      (failure) => emit(
        NotificationSettingsState(
          status: NotificationSettingsStatus.failure,
          errorMessage: failure.message,
        ),
      ),
      (settings) => emit(
        NotificationSettingsState(
          status: NotificationSettingsStatus.loaded,
          settings: settings,
        ),
      ),
    );
  }

  Future<void> toggle(NotificationSetting setting, bool value) async {
    final before = state.settings;
    if (before == null || !before.isAvailable(setting)) return;
    _show(before.copyWith(setting, value));

    final result = await _updateSetting(
      UpdateNotificationSettingParams(setting, value),
    );
    if (isClosed) return;
    result.fold(
      (failure) => emit(
        NotificationSettingsState(
          status: NotificationSettingsStatus.loaded,
          settings: before,
          errorMessage: failure.message,
          errorSerial: state.errorSerial + 1,
        ),
      ),
      _show,
    );
  }

  void _show(NotificationSettings settings) => emit(
    NotificationSettingsState(
      status: NotificationSettingsStatus.loaded,
      settings: settings,
      errorSerial: state.errorSerial,
    ),
  );
}
