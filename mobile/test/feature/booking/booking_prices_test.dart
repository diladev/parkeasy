import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/pricing/price_rules.dart';
import 'package:mobile/feature/booking/data/models/booking_model.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/domain/entities/booking_draft.dart';
import 'package:mobile/feature/booking/presentation/cubit/extend_booking_cubit.dart';
import 'package:mobile/feature/booking/presentation/cubit/payment_state.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';

/// 12:00 on 27 Oct 2026, Iraq time.
final noon = DateTime.utc(2026, 10, 27, 9);
const capped = PriceRules(pricePerHour: 1500, dailyCap: 9000);
const newroz = PriceOverride(
  label: 'Newroz',
  startDate: '2026-10-27',
  endDate: '2026-10-27',
  pricePerHour: 2500,
);

BookingDraft draft({PriceRules? rules}) => BookingDraft(
  lotId: 1,
  lotName: 'City Center Parking',
  slotId: 4,
  slotNumber: 'A04',
  level: 'B1',
  pricePerHour: 1500,
  priceRules: rules,
);

Booking booking({PriceRules? rules, int hours = 5}) => Booking(
  id: 6,
  status: BookingStatus.active,
  lotId: 1,
  lotName: 'City Center Parking',
  lotAddress: 'Salim Street, Sulaymaniyah',
  slotNumber: 'A04',
  level: 'B1',
  vehicleName: 'Toyota Corolla',
  plateNumber: '22 SUL 48213',
  startTime: noon,
  endTime: noon.add(Duration(hours: hours)),
  durationHours: hours,
  pricePerHour: 1500,
  priceRules: rules,
  totalCost: 1500 * hours,
  cancellableUntil: noon.add(const Duration(minutes: 10)),
);

void main() {
  group('the payment screen total', () {
    PaymentState payment(BookingDraft draft, int hours) =>
        PaymentState(draft: draft, startsAt: noon, durationHours: hours);

    test('is hours × the hourly price without a cap', () {
      expect(payment(draft(), 3).total, 4500);
    });

    test('stops at the daily cap, as the server will', () {
      final state = payment(draft(rules: capped), 11);
      expect(state.total, 9000);
      expect(state.quote.capSaving, 7500);
    });

    test('uses a special price on its day', () {
      const rules = PriceRules(pricePerHour: 1500, overrides: [newroz]);
      final state = payment(draft(rules: rules), 2);
      expect(state.total, 5000);
      expect(state.quote.specialPrices.single.label, 'Newroz');
    });
  });

  group('the extension charge', () {
    ExtendBookingState extend(Booking booking, int hours) =>
        ExtendBookingState(booking: booking, extraHours: hours);

    test('is hours × the hourly price for older bookings', () {
      expect(extend(booking(), 2).extraCost, 3000);
      expect(extend(booking(), 2).capSaving, 0);
    });

    test('adds only what fits under the cap the booking was made with', () {
      final state = extend(booking(rules: capped), 3);
      expect(state.extraCost, 1500);
      expect(state.capSaving, 3000);
      expect(extend(booking(rules: capped, hours: 6), 2).extraCost, 0);
    });
  });

  test('a booking from the API keeps its saved rules', () {
    final model = BookingModel.fromMap({
      'id': 6,
      'status': 'active',
      'parking_lot_id': 1,
      'start_time': '2026-10-27T09:00:00.000Z',
      'end_time': '2026-10-27T14:00:00.000Z',
      'duration_hours': 5,
      'price_per_hour': 1500,
      'price_rules': {'price_per_hour': 1500, 'daily_cap': 9000, 'overrides': []},
      'total_cost': 7500,
      'payment_method': 'wallet',
    });
    expect(model.rules, capped);
    // Older bookings, without saved rules, fall back to the hourly price.
    expect(booking().rules, const PriceRules(pricePerHour: 1500));
  });
}
