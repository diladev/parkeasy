import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/l10n/app_strings.dart';
import 'package:mobile/core/l10n/strings_ckb.dart';
import 'package:mobile/core/l10n/strings_en.dart';

export 'package:mobile/core/l10n/app_strings.dart';

/// The app's texts in the language the user picked: `Text(l10n.signIn)`.
///
/// When the language changes, LanguageCubit swaps [AppStrings.current] and
/// main.dart rebuilds every screen, so each text is read again.
AppStrings get l10n => AppStrings.current;

class AppLocales {
  AppLocales._();

  static const Locale english = Locale('en');
  static const Locale kurdish = Locale('ckb');
  static const List<Locale> supported = [english, kurdish];

  static AppStrings stringsFor(String code) =>
      code == kurdish.languageCode ? const CkbStrings() : const EnStrings();

  /// Flutter ships English only (flutter_localizations isn't a dependency),
  /// so these give Material, Cupertino and the widgets layer their Kurdish
  /// texts and the right-to-left direction. English uses Flutter's defaults.
  static const List<LocalizationsDelegate<dynamic>> delegates = [
    _KurdishDelegate<MaterialLocalizations>(KurdishMaterialLocalizations()),
    _KurdishDelegate<CupertinoLocalizations>(KurdishCupertinoLocalizations()),
    _KurdishDelegate<WidgetsLocalizations>(KurdishWidgetsLocalizations()),
  ];
}

/// Marks every widget for a rebuild, so texts read through [l10n] show the
/// new language on every open screen, not only the ones that rebuild anyway.
void rebuildAllWidgets() {
  void mark(Element element) {
    element.markNeedsBuild();
    element.visitChildren(mark);
  }

  WidgetsBinding.instance.rootElement?.visitChildren(mark);
}

class _KurdishDelegate<T> extends LocalizationsDelegate<T> {
  const _KurdishDelegate(this.value);

  final T value;

  @override
  bool isSupported(Locale locale) =>
      locale.languageCode == AppLocales.kurdish.languageCode;

  @override
  Future<T> load(Locale locale) => SynchronousFuture<T>(value);

  @override
  bool shouldReload(_KurdishDelegate<T> old) => false;

  @override
  Type get type => T;
}

/// Sunday first, as DateTime.weekday % 7 counts.
const List<String> _kurdishWeekdays = [
  'یەکشەممە',
  'دووشەممە',
  'سێشەممە',
  'چوارشەممە',
  'پێنجشەممە',
  'هەینی',
  'شەممە',
];

/// Right to left, for every widget under MaterialApp. The bottom navigation
/// keeps its order (see AppBottomNav).
class KurdishWidgetsLocalizations extends DefaultWidgetsLocalizations {
  const KurdishWidgetsLocalizations();

  @override
  TextDirection get textDirection => TextDirection.rtl;
}

/// Material's own texts: dialogs, the date picker, the text selection menu,
/// tooltips and screen reader labels.
class KurdishMaterialLocalizations extends DefaultMaterialLocalizations {
  const KurdishMaterialLocalizations();

  static String _monthName(int month) => const CkbStrings().monthName(month);

  @override
  ScriptCategory get scriptCategory => ScriptCategory.tall;

  // Iraq's week starts on Saturday.
  @override
  int get firstDayOfWeekIndex => 6;

  @override
  List<String> get narrowWeekdays => const ['ی', 'د', 'س', 'چ', 'پ', 'ه', 'ش'];

  @override
  String formatMonthYear(DateTime date) =>
      '${_monthName(date.month)} ${date.year}';

  @override
  String formatMediumDate(DateTime date) =>
      '${_kurdishWeekdays[date.weekday % 7]}، ${date.day} ${_monthName(date.month)}';

  @override
  String formatFullDate(DateTime date) =>
      '${_kurdishWeekdays[date.weekday % 7]}، ${date.day} ${_monthName(date.month)} ${date.year}';

  @override
  String formatShortMonthDay(DateTime date) =>
      '${date.day} ${_monthName(date.month)}';

  @override
  String get backButtonTooltip => 'گەڕانەوە';

  @override
  String get closeButtonTooltip => 'داخستن';

  @override
  String get deleteButtonTooltip => 'سڕینەوە';

  @override
  String get moreButtonTooltip => 'زیاتر';

  @override
  String get nextMonthTooltip => 'مانگی داهاتوو';

  @override
  String get previousMonthTooltip => 'مانگی پێشوو';

  @override
  String get showMenuTooltip => 'پیشاندانی مێنیو';

  @override
  String get searchFieldLabel => 'گەڕان';

  @override
  String get cancelButtonLabel => 'پاشگەزبوونەوە';

  @override
  String get closeButtonLabel => 'داخستن';

  @override
  String get continueButtonLabel => 'بەردەوامبوون';

  @override
  String get okButtonLabel => 'باشە';

  @override
  String get copyButtonLabel => 'کۆپی';

  @override
  String get cutButtonLabel => 'بڕین';

  @override
  String get pasteButtonLabel => 'لکاندن';

  @override
  String get selectAllButtonLabel => 'هەمووی دیاری بکە';

  @override
  String get shareButtonLabel => 'هاوبەشکردن';

  @override
  String get modalBarrierDismissLabel => 'داخستن';

  @override
  String get dialogLabel => 'دیالۆگ';

  @override
  String get alertDialogLabel => 'ئاگاداری';

  @override
  String get refreshIndicatorSemanticLabel => 'نوێکردنەوە';

  @override
  String get datePickerHelpText => 'بەروارێک هەڵبژێرە';

  @override
  String get calendarModeButtonLabel => 'گۆڕین بۆ ساڵنامە';

  @override
  String get inputDateModeButtonLabel => 'گۆڕین بۆ نووسین';

  @override
  String get dateInputLabel => 'بەروار بنووسە';

  @override
  String get invalidDateFormatLabel => 'شێوەی بەروارەکە هەڵەیە.';

  @override
  String get dateOutOfRangeLabel => 'لە دەرەوەی ماوەکەیە.';

  @override
  String get selectYearSemanticsLabel => 'ساڵ هەڵبژێرە';
}

/// The iPhone text selection menu and dialogs.
class KurdishCupertinoLocalizations extends DefaultCupertinoLocalizations {
  const KurdishCupertinoLocalizations();

  @override
  String get copyButtonLabel => 'کۆپی';

  @override
  String get cutButtonLabel => 'بڕین';

  @override
  String get pasteButtonLabel => 'لکاندن';

  @override
  String get selectAllButtonLabel => 'هەمووی دیاری بکە';

  @override
  String get shareButtonLabel => 'هاوبەشکردن';

  @override
  String get modalBarrierDismissLabel => 'داخستن';

  @override
  String get alertDialogLabel => 'ئاگاداری';

  @override
  String get todayLabel => 'ئەمڕۆ';
}
