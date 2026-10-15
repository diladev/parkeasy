import 'package:equatable/equatable.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';

/// A booking that was just cancelled, for the cancellation screen.
class Cancellation extends Equatable {
  const Cancellation({
    required this.booking,
    required this.refund,
    required this.cancelledAt,
  });

  final Booking booking;

  /// What went back to the wallet; 0 when nothing was refundable.
  final double refund;
  final DateTime cancelledAt;

  @override
  List<Object?> get props => [booking, refund, cancelledAt];
}
