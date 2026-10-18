import 'package:equatable/equatable.dart';
import 'package:mobile/feature/wallet/domain/entities/top_up.dart';

/// What the user just tapped, while the server answers.
enum TopUpAction { none, approving, declining, cancelling }

class TopUpState extends Equatable {
  const TopUpState({
    required this.topUp,
    this.action = TopUpAction.none,
    this.errorMessage,
    this.errorSerial = 0,
  });

  final TopUp topUp;
  final TopUpAction action;
  final String? errorMessage;

  /// New for every error, so the screen shows two identical errors in a row.
  final int errorSerial;

  bool get isBusy => action != TopUpAction.none;

  TopUpState copyWith({
    TopUp? topUp,
    TopUpAction? action,
    String? errorMessage,
    int? errorSerial,
  }) {
    return TopUpState(
      topUp: topUp ?? this.topUp,
      action: action ?? this.action,
      errorMessage: errorMessage ?? this.errorMessage,
      errorSerial: errorSerial ?? this.errorSerial,
    );
  }

  @override
  List<Object?> get props => [topUp, action, errorMessage, errorSerial];
}
