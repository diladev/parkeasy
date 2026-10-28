/// A question and its answer on the Help & support screen.
class Faq {
  const Faq(this.question, this.answer);

  final String question;
  final String answer;
}

/// The answers follow the app's real rules (see BookingService on the API):
/// keep them in step when those change.
const List<Faq> kFaqs = [
  Faq(
    'How do I cancel a booking?',
    'Go to My bookings, tap the booking, and select Cancel booking. '
        'You can cancel for a full refund within 10 minutes of the start '
        '(some lots give longer: Payment shows it). After that, tap End '
        "parking to leave early; the booked time isn't refunded.",
  ),
  Faq(
    'Can I extend my parking time?',
    'Yes. While a booking is active, open it and tap Extend. The extra hours '
        'are paid from your wallet at the prices you booked with, up to 24 '
        'hours in total, as long as the lot is open. Hours on a day that '
        "already reached the lot's daily cap cost nothing.",
  ),
  Faq(
    'How are prices worked out?',
    "Every started hour is charged at the lot's hourly price. Some lots "
        'have a daily cap: however long you stay, one day never costs more. '
        'On special days, like Eid or Newroz, a lot can set a different '
        'price; the lot page shows it. Payment always shows the exact total '
        'before you pay.',
  ),
  Faq(
    'What if the spot is already taken?',
    'Your slot is reserved for you from the moment you book. If someone is '
        'parked in it anyway, cancel while free cancellation is still open '
        '(the booking shows how long) and book another slot, then email us '
        'with your receipt number.',
  ),
  Faq(
    'How does the QR code work?',
    'Each garage has a ParkEasy QR code at its entrance. Tap the scan '
        'button on the home screen and point the camera at it: the garage '
        'opens, ready to pick a slot and book.',
  ),
];
