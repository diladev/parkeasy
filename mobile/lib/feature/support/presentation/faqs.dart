import 'package:mobile/core/l10n/l10n.dart';

/// A question and its answer on the Help & support screen.
class Faq {
  const Faq(this.question, this.answer);

  final String question;
  final String answer;
}

/// The answers follow the app's real rules (see BookingService on the API):
/// keep them in step when those change. Read on every build, so they follow
/// the app's language.
List<Faq> get kFaqs => [
  Faq(l10n.faqCancelQ, l10n.faqCancelA),
  Faq(l10n.faqExtendQ, l10n.faqExtendA),
  Faq(l10n.faqPricesQ, l10n.faqPricesA),
  Faq(l10n.faqTakenQ, l10n.faqTakenA),
  Faq(l10n.faqQrQ, l10n.faqQrA),
];
