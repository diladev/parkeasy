import 'package:equatable/equatable.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';

/// One page of the user's bookings, and whether more pages follow.
class BookingPage extends Equatable {
  const BookingPage({required this.bookings, required this.hasMore});

  final List<Booking> bookings;
  final bool hasMore;

  @override
  List<Object?> get props => [bookings, hasMore];
}
