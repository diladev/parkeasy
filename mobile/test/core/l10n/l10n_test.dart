import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/l10n/language_cubit.dart';
import 'package:mobile/core/l10n/strings_ckb.dart';
import 'package:mobile/core/l10n/strings_en.dart';
import 'package:mobile/core/locale/app_language.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/utils/validators.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  // Each test starts and ends in English, the default.
  tearDown(() => AppStrings.current = const EnStrings());

  group('English', () {
    test('formats as before', () {
      expect(l10n.code, 'en');
      expect(l10n.isRtl, isFalse);
      expect(Formatters.money(1500), '1,500 IQD');
      expect(Formatters.money(-4500), '-4,500 IQD');
      expect(Formatters.signedMoney(5000), '+5,000 IQD');
      expect(Formatters.time(DateTime(2026, 10, 12, 21, 30)), '9:30 PM');
      expect(Formatters.readableDate(DateTime(2026, 10, 12)), '12 Oct, 2026');
      expect(
        Formatters.duration(const Duration(hours: 1, minutes: 22)),
        '1h 22m',
      );
      expect(Formatters.distance(2.4), '2.4 km');
      expect(Validators.required(''), 'Required');
    });
  });

  group('Kurdish', () {
    setUp(() => AppStrings.current = const CkbStrings());

    test('reads right to left, with Western digits', () {
      expect(l10n.code, 'ckb');
      expect(l10n.isRtl, isTrue);
      expect(Formatters.money(1500), '1,500 د.ع');
    });

    test('uses the 24-hour clock and Kurdish month names', () {
      final start = DateTime(2026, 10, 12, 14);
      final end = DateTime(2026, 10, 12, 17, 5);
      expect(Formatters.time(start), '14:00');
      expect(Formatters.readableDate(start), '12 تشرینی یەکەم 2026');
      expect(
        Formatters.bookingTime(start, end, now: start),
        'ئەمڕۆ · 14:00–17:05',
      );
      expect(Formatters.day(DateTime(2026, 10, 11), now: start), 'دوێنێ');
    });

    test('keeps a minus or plus sign in front of the amount', () {
      // Isolated left to right, so the sign doesn't jump to the other side.
      expect(Formatters.money(-4500), '\u2066-4,500\u2069 د.ع');
      expect(Formatters.signedMoney(5000), '\u2066+5,000\u2069 د.ع');
    });

    test('durations and distances', () {
      expect(Formatters.duration(const Duration(hours: 2)), '2 کاتژمێر');
      expect(
        Formatters.duration(const Duration(hours: 1, minutes: 5)),
        '1 کاتژمێر و 5 خولەک',
      );
      expect(Formatters.distance(2.4), '2.4 کم');
    });

    test('form checks answer in Kurdish', () {
      expect(Validators.required(''), 'پێویستە');
      expect(Validators.email('nope'), 'ئیمەیڵێکی دروست بنووسە');
    });
  });

  group('LanguageCubit', () {
    test('starts in English on a new phone', () async {
      SharedPreferences.setMockInitialValues({});
      final cubit = LanguageCubit(
        AppLanguage(await SharedPreferences.getInstance()),
      );
      expect(cubit.state, 'en');
      expect(l10n.code, 'en');
      await cubit.close();
    });

    test('starts in the language saved on this phone', () async {
      SharedPreferences.setMockInitialValues({'app_language': 'ckb'});
      final cubit = LanguageCubit(
        AppLanguage(await SharedPreferences.getInstance()),
      );
      expect(cubit.state, 'ckb');
      expect(l10n.isRtl, isTrue);
      await cubit.close();
    });

    test('saves a new language, which the API then gets too', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final language = AppLanguage(prefs);
      final cubit = LanguageCubit(language);

      await cubit.choose('ckb');
      expect(cubit.state, 'ckb');
      expect(l10n.code, 'ckb');
      // ApiClient sends x-lang from AppLanguage.
      expect(language.code, 'ckb');
      expect(prefs.getString('app_language'), 'ckb');
      await cubit.close();
    });

    test("ignores a language the app doesn't have", () async {
      SharedPreferences.setMockInitialValues({});
      final cubit = LanguageCubit(
        AppLanguage(await SharedPreferences.getInstance()),
      );
      await cubit.choose('fr');
      expect(cubit.state, 'en');
      await cubit.close();
    });
  });
}
