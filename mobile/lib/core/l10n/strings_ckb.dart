import 'package:mobile/core/l10n/app_strings.dart';

/// Central Kurdish (Sorani), written right to left. Prices, times and
/// dates use Western digits, as on Iraqi price tags and in the web app.
class CkbStrings extends AppStrings {
  const CkbStrings();

  @override
  String get code => 'ckb';

  @override
  bool get isRtl => true;

  // ─── Shared ────────────────────────────────────────────────────────────────
  @override
  String get tryAgain => 'دووبارە هەوڵبدەرەوە';
  @override
  String get cancel => 'پاشگەزبوونەوە';
  @override
  String get saveChanges => 'پاشەکەوتکردنی گۆڕانکارییەکان';
  @override
  String get continueLabel => 'بەردەوامبە';
  @override
  String get skip => 'تێپەڕاندن';
  @override
  String get edit => 'دەستکاریکردن';
  @override
  String get remove => 'سڕینەوە';
  @override
  String get delete => 'سڕینەوە';
  @override
  String get clear => 'سڕینەوە';
  @override
  String get viewAll => 'هەمووی ببینە';
  @override
  String get seeAll => 'هەمووی ببینە';
  @override
  String get required => 'پێویستە';
  @override
  String get iqd => 'د.ع';
  @override
  String get somethingWentWrong =>
      'هەڵەیەک ڕوویدا. تکایە دووبارە هەوڵ بدەرەوە.';
  @override
  String get backArrow => '→';
  @override
  String get forwardChevron => '‹';

  // ─── Formats, form checks, errors and shared widgets ───────────────────────
  @override
  String monthShort(int month) => const [
    'کانوونی دووەم',
    'شوبات',
    'ئازار',
    'نیسان',
    'ئایار',
    'حوزەیران',
    'تەمووز',
    'ئاب',
    'ئەیلوول',
    'تشرینی یەکەم',
    'تشرینی دووەم',
    'کانوونی یەکەم',
  ][month - 1];
  @override
  String monthName(int month) => const [
    'کانوونی دووەم',
    'شوبات',
    'ئازار',
    'نیسان',
    'ئایار',
    'حوزەیران',
    'تەمووز',
    'ئاب',
    'ئەیلوول',
    'تشرینی یەکەم',
    'تشرینی دووەم',
    'کانوونی یەکەم',
  ][month - 1];
  @override
  bool get use24HourClock => true;
  @override
  String get today => 'ئەمڕۆ';
  @override
  String get yesterday => 'دوێنێ';
  @override
  String get tomorrow => 'سبەینێ';
  @override
  String get am => 'پ.ن';
  @override
  String get pm => 'د.ن';
  @override
  String dayMonthYear(int day, String month, int year) => '$day $month $year';
  @override
  String hoursMinutesShort(int hours, int minutes) =>
      '$hours کاتژمێر و $minutes خولەک';
  @override
  String hoursShort(int hours) => '$hours کاتژمێر';
  @override
  String minutesShort(int minutes) => '$minutes خولەک';
  @override
  String get kmUnit => 'کم';
  @override
  String get metresUnit => 'م';
  @override
  String atLeastChars(int min) => 'لانیکەم $min پیت';
  @override
  String atMostChars(int max) => 'زۆرترین $max پیت';
  @override
  String get enterValidEmail => 'ئیمەیڵێکی دروست بنووسە';
  @override
  String get enterValidPhone => 'ژمارەیەکی مۆبایلی دروست بنووسە';
  @override
  String get noSpaces => 'بۆشایی بەکارمەهێنە';
  @override
  String get addUppercase => 'پیتێکی گەورە زیاد بکە';
  @override
  String get addLowercase => 'پیتێکی بچووک زیاد بکە';
  @override
  String get addNumber => 'ژمارەیەک زیاد بکە';
  @override
  String get addSymbol => 'هێمایەک زیاد بکە، بۆ نموونە ! یان #';
  @override
  String get passwordsDontMatch => 'وشە نهێنییەکان وەک یەک نین';
  @override
  String get plateCharacters => 'تەنها پیت، ژمارە، بۆشایی و هێڵی بچووک';
  @override
  String get enterYear => 'ساڵێک بنووسە';
  @override
  String yearBetween(int max) => 'لە نێوان 1950 و $max';
  @override
  String get sessionExpired =>
      'ماوەی چوونەژوورەوەکەت تەواو بووە. تکایە دووبارە بچۆ ژوورەوە.';
  @override
  String get requestTimedOut =>
      'وەڵامەکە زۆری خایاند. تکایە دووبارە هەوڵ بدەرەوە.';
  @override
  String get cantReachServer =>
      'ناتوانرێت پەیوەندی بە ڕاژەکارەوە بکرێت. هێڵەکەت بپشکنە و دووبارە هەوڵ بدەرەوە.';
  @override
  String somethingWentWrongCode(int code) =>
      'هەڵەیەک ڕوویدا ($code). تکایە دواتر هەوڵ بدەرەوە.';
  @override
  String get noInternetTitle => 'هێڵی ئینتەرنێت نییە';
  @override
  String get noInternetMessage =>
      'تکایە هێڵی ئینتەرنێتەکەت بپشکنە و دووبارە هەوڵ بدەرەوە.';
  @override
  String get navHome => 'سەرەکی';
  @override
  String get navMap => 'نەخشە';
  @override
  String get navBookings => 'حیجزەکان';
  @override
  String get navProfile => 'پرۆفایل';
  @override
  String get passwordWeak => 'وشەی نهێنیی لاواز';
  @override
  String get passwordFair => 'وشەی نهێنیی مامناوەند';
  @override
  String get passwordGood => 'وشەی نهێنیی باش';
  @override
  String get passwordStrong => 'وشەی نهێنیی بەهێز';
  @override
  String mapData(String attribution) => 'زانیاریی نەخشە $attribution';

  // ─── Welcome, sign in, sign up and password reset ──────────────────────────
  @override
  String get tagline => 'لە چەند چرکەیەکدا پارکینگ بدۆزەوە و حیجز بکە';
  @override
  String get signIn => 'چوونەژوورەوە';
  @override
  String get or => 'یان';
  @override
  String get email => 'ئیمەیڵ';
  @override
  String get emailAddress => 'ئیمەیڵ';
  @override
  String get emailHint => 'you@example.com';
  @override
  String get password => 'وشەی نهێنی';
  @override
  String get newPassword => 'وشەی نهێنیی نوێ';
  @override
  String get confirmNewPassword => 'دووبارەکردنەوەی وشەی نهێنیی نوێ';
  @override
  String get resetPassword => 'گۆڕینی وشەی نهێنی';
  @override
  String get createAccount => 'دروستکردنی هەژمار';
  @override
  String get backToSignIn => 'گەڕانەوە بۆ چوونەژوورەوە';
  @override
  String get onboardingFindTitle => 'شوێنی نزیک بدۆزەوە';
  @override
  String get onboardingFindSubtitle => 'بەتاڵبوونی شوێنەکان بە ڕاستەوخۆ';
  @override
  String get onboardingReserveTitle => 'پێشوەختە حیجز بکە';
  @override
  String get onboardingReserveSubtitle => 'پێش گەیشتنت حیجز بکە';
  @override
  String get onboardingPayTitle => 'بە ئاسانی پارە بدە';
  @override
  String get onboardingPaySubtitle => 'لە جزدانی ParkEasy';
  @override
  String get getStarted => 'دەست پێبکە';
  @override
  String get alreadyHaveAccount => 'پێشتر هەژمارت هەیە؟';
  @override
  String get allowLocation => 'ڕێگەدان بە شوێنەکەت';
  @override
  String get locationWhy =>
      'ParkEasy پێویستی بە شوێنەکەتە بۆ پیشاندانی پارکینگە نزیکەکان و ڕێنموونیکردنت بۆ ئەو شوێنەی حیجزت کردووە.';
  @override
  String get locationFindTitle => 'شوێنی نزیک بدۆزەوە';
  @override
  String get locationFindSubtitle => 'پارکینگە بەتاڵەکانی دەوروبەرت ببینە';
  @override
  String get locationNavigateTitle => 'بڕۆ بۆ شوێنەکەت';
  @override
  String get locationNavigateSubtitle => 'هەنگاو بە هەنگاو تا پارکینگەکە';
  @override
  String get locationPrivateTitle => 'شوێنەکەت هەرگیز نافرۆشرێت';
  @override
  String get locationPrivateSubtitle =>
      'تەنها لە کاتی بەکارهێنانی ئەپەکەدا بەکاردێت';
  @override
  String get notNow => 'ئێستا نا';
  @override
  String get welcomeBack => 'بەخێربێیتەوە';
  @override
  String get signInToAccount => 'بچۆ ژوورەوەی هەژمارەکەت';
  @override
  String get enterYourPassword => 'تکایە وشەی نهێنییەکەت بنووسە';
  @override
  String get forgotPassword => 'وشەی نهێنیت بیرچووە؟';
  @override
  String get continueWithGoogle => 'G   بەردەوامبوون لەگەڵ Google';
  @override
  String get newHere => 'تازەیت؟ ';
  @override
  String get firstName => 'ناوی یەکەم';
  @override
  String get firstNameHint => 'دیلان';
  @override
  String get lastName => 'ناوی کۆتایی';
  @override
  String get lastNameHint => 'کەریمی';
  @override
  String get phoneNumber => 'ژمارەی مۆبایل';
  @override
  String get confirmPassword => 'دووبارەکردنەوەی وشەی نهێنی';
  @override
  String get agreeToThe => 'ڕازیم بە ';
  @override
  String get termsOfService => 'مەرجەکانی بەکارهێنان';
  @override
  String get and => ' و ';
  @override
  String get privacyPolicy => 'سیاسەتی تایبەتمەندی';
  @override
  String get signUpWithGoogle => 'G   خۆتۆمارکردن لەگەڵ Google';
  @override
  String get alreadyHaveAccountSpace => 'پێشتر هەژمارت هەیە؟ ';
  @override
  String get forgotYourPassword => 'وشەی نهێنیت بیرچووە؟';
  @override
  String get forgotPasswordHelp =>
      'ئەو ئیمەیڵە بنووسە کە بە هەژمارەکەتەوە بەستراوە\nو کۆدێکی گۆڕینت بۆ دەنێرین.';
  @override
  String get sendResetCode => 'ناردنی کۆدی گۆڕین';
  @override
  String get rememberedIt => 'بیرت کەوتەوە؟ ';
  @override
  String newCodeSent(String email) => 'کۆدێکی نوێمان بۆ $email نارد.';
  @override
  String get enterCode => 'کۆدەکە بنووسە';
  @override
  String get checkYourEmail => 'سەیری ئیمەیڵەکەت بکە';
  @override
  String get codeSentTo => 'کۆدێکی 6 ژمارەییمان نارد بۆ\n';
  @override
  String get verifyCode => 'پشتڕاستکردنەوەی کۆد';
  @override
  String get didntReceiveCode => 'کۆدەکەت پێنەگەیشت؟';
  @override
  String resendIn(String seconds) => 'دووبارە ناردنەوە دوای 0:$seconds';
  @override
  String get resendCode => 'دووبارە ناردنەوەی کۆد';
  @override
  String get setNewPassword => 'وشەی نهێنییەکی نوێ دابنێ';
  @override
  String get passwordRules =>
      'لانیکەم 8 پیت، لەگەڵ پیتێکی گەورە و پیتێکی بچووک، ژمارەیەک و هێمایەک.';
  @override
  String get passwordResetDone => 'وشەی نهێنی گۆڕدرا!';
  @override
  String get passwordResetSignedOut =>
      'وشەی نهێنییەکەت نوێکرایەوە. بۆ پاراستنت، لە هەموو ئامێرەکان دەرکرایت.';
  @override
  String get signInNow => 'ئێستا بچۆ ژوورەوە';

  // ─── Home and location ─────────────────────────────────────────────────────
  @override
  String get parkingLot => 'پارکینگ';
  @override
  String get statusActive => 'چالاک';
  @override
  String get statusCompleted => 'تەواوبوو';
  @override
  String get statusCancelled => 'هەڵوەشێنراوە';
  @override
  String get yourRegulars => 'شوێنە هەمیشەییەکانت';
  @override
  String get yourRegularsBadge => 'هەمیشەیی';
  @override
  String get recentBookings => 'دوایین حیجزەکان';
  @override
  String get findSpot => 'دۆزینەوەی شوێن';
  @override
  String get scanQr => 'سکانی QR';
  @override
  String get favorites => 'دڵخوازەکان';
  @override
  String get history => 'مێژوو';
  @override
  String get lookingForSpots => 'گەڕان بەدوای شوێنی نزیکدا...';
  @override
  String get couldntCheckSpots => 'نەتوانرا شوێنە نزیکەکان بپشکنرێن';
  @override
  String get noFreeSpotsNear => 'ئێستا هیچ شوێنێکی بەتاڵ لە نزیکت نییە';
  @override
  String spotsNearYou(int count) => '$count شوێنی بەتاڵ لە نزیکت هەیە';
  @override
  String get findNearbySpot => 'شوێنی نزیک بدۆزەوە';
  @override
  String get find => 'دۆزینەوە';
  @override
  String get yourLocation => 'شوێنەکەت';
  @override
  String get notifications => 'ئاگادارکردنەوەکان';
  @override
  String get notificationsUnread => 'ئاگادارکردنەوەکان، نەخوێندراوە';
  @override
  String get searchParkingSpots => 'گەڕان بۆ پارکینگ...';
  @override
  String get locationServiceOff => 'شوێن لەم مۆبایلەدا کوژاوەتەوە.';
  @override
  String get locationNotAllowed =>
      'ParkEasy ڕێگەی پێنەدراوە شوێنەکەت بەکاربهێنێت.';
  @override
  String get locationOffInSettings =>
      'شوێن بۆ ParkEasy کوژاوەتەوە. لە ڕێکخستنەکانی مۆبایلەکەدا هەڵیبکە.';
  @override
  String get locationTimeout =>
      'نەتوانرا شوێنەکەت بزانرێت. لە دەرەوە دووبارە هەوڵ بدەرەوە.';
  @override
  String get locationUnknown => 'نەتوانرا شوێنەکەت بزانرێت.';

  // ─── Map and directions ────────────────────────────────────────────────────
  @override
  String perHourShort(String price) => '$price/کاتژمێر';
  @override
  String freeCount(int count) => '$count بەتاڵ';
  @override
  String get full => 'پڕە';
  @override
  String get couldntLoadParkingLots => 'نەتوانرا پارکینگەکان باربکرێن.';
  @override
  String get locationOffOnPhone => 'شوێن لەم مۆبایلەدا کوژاوەتەوە.';
  @override
  String get turnOn => 'هەڵکردن';
  @override
  String get locationOffForApp => 'شوێن بۆ ParkEasy کوژاوەتەوە.';
  @override
  String get settings => 'ڕێکخستنەکان';
  @override
  String get seeNearestSpots => 'نزیکترین شوێنەکان لە خۆت ببینە.';
  @override
  String get useMyLocation => 'شوێنەکەم بەکاربهێنە';
  @override
  String get couldntFindLocation => 'نەتوانرا شوێنەکەت بدۆزرێتەوە.';
  @override
  String lotCalloutSemantics(String name, int free) =>
      '$name، $free بەتاڵ، کردنەوەی وردەکارییەکان';
  @override
  String get searchArea => 'گەڕان لە ناوچەکە';
  @override
  String get searchAreaHint => 'گەڕان لە ناوچەکە...';
  @override
  String get showMyLocation => 'شوێنەکەم پیشان بدە';
  @override
  String get nearbySpots => 'شوێنە نزیکەکان';
  @override
  String get parkingInSulaymaniyah => 'پارکینگ لە سلێمانی';
  @override
  String get noParkingLotsYet => 'هێشتا هیچ پارکینگێک نییە.';
  @override
  String get getDirections => 'ڕێنمایی ڕێگا';
  @override
  String get couldntLoadLot => 'نەتوانرا ئەم پارکینگە باربکرێت.';
  @override
  String couldntOpenApp(String app) => 'نەتوانرا $app بکرێتەوە.';
  @override
  String couldntOpenAppCopied(String app) =>
      'نەتوانرا $app بکرێتەوە. پۆتانی پارکینگەکە کۆپی کرا.';
  @override
  String get openWith => 'کردنەوە بە';
  @override
  String get recommended => 'پێشنیارکراو';
  @override
  String recommendedSemantics(String name) => '$name، پێشنیارکراو';
  @override
  String straightLine(String distance) => '$distance  ·  هێڵی ڕاست';

  // ─── Search, parking lots and favorites ────────────────────────────────────
  @override
  String get perHourSuffix => '/کاتژمێر';
  @override
  String get covered => 'داپۆشراو';
  @override
  String get evShort => 'کارەبایی';
  @override
  String get evCharging => 'بارگاویکردنی کارەبایی';
  @override
  String get evCharge => 'بارگاویکردنی کارەبایی';
  @override
  String get accessible => 'گونجاو بۆ کەمئەندامان';
  @override
  String get cctv => 'کامێرای چاودێری';
  @override
  String get open24hAmenity => '24 کاتژمێر کراوەیە';
  @override
  String get open24hShort => '24 کاتژمێر';
  @override
  String get sortNearest => 'نزیکترین';
  @override
  String get sortCheapest => 'هەرزانترین';
  @override
  String get sortTopRated => 'باشترین هەڵسەنگاندن';
  @override
  String get anyDistance => 'هەر دوورییەک';
  @override
  String get couldntLoadFavorites => 'نەتوانرا دڵخوازەکانت باربکرێن.';
  @override
  String removedFromFavorites(String name) => '$name لە دڵخوازەکان لابرا.';
  @override
  String get undo => 'گەڕاندنەوە';
  @override
  String get noFavoritesYet => 'هێشتا هیچ دڵخوازێک نییە';
  @override
  String get noFavoritesHint =>
      'دڵەکەی سەر پارکینگێک دابگرە بۆ ئەوەی لێرە بمێنێتەوە.';
  @override
  String get removeFromFavorites => 'لابردن لە دڵخوازەکان';
  @override
  String get addToFavorites => 'زیادکردن بۆ دڵخوازەکان';
  @override
  String get couldntLoadParkingLot => 'نەتوانرا ئەم پارکینگە باربکرێت.';
  @override
  String get newLot => 'نوێ';
  @override
  String get freeSlots => 'شوێنی بەتاڵ';
  @override
  String get iqdPerHour => 'د.ع / کاتژمێر';
  @override
  String get rating => 'هەڵسەنگاندن';
  @override
  String get open => 'کاتی کارکردن';
  @override
  String get backToMap => '→ گەڕانەوە بۆ نەخشە';
  @override
  String get pickFreeSlot => 'شوێنێکی بەتاڵ هەڵبژێرە';
  @override
  String slotAndLevel(String slot, String level) =>
      'شوێنی $slot · نهۆمی $level';
  @override
  String get bookNow => 'ئێستا حیجز بکە';
  @override
  String get pickSlot => 'شوێنێک هەڵبژێرە';
  @override
  String get noSlotsYet => 'ئەم پارکینگە هێشتا هیچ شوێنێکی نییە.';
  @override
  String levelName(String level) => 'نهۆمی $level';
  @override
  String slotSemantics(String slot, bool taken) =>
      "شوێنی $slot${taken ? '، گیراوە' : ''}";
  @override
  String get slotFree => 'بەتاڵ';
  @override
  String get slotSelected => 'هەڵبژێردراو';
  @override
  String get slotTaken => 'گیراو';
  @override
  String specialPriceToday(String label, String price) =>
      'نرخی $label ئەمڕۆ: $price/کاتژمێر';
  @override
  String neverMoreThanADay(String amount) =>
      'هەرگیز زیاتر لە $amount لە ڕۆژێکدا';
  @override
  String specialPriceOn(String label, String price, String days) =>
      '$label: $price/کاتژمێر لە $days';
  @override
  String get filters => 'پاڵاوتنەکان';
  @override
  String get chipNearest => 'نزیکترین';
  @override
  String get chipPrice => 'نرخ';
  @override
  String get couldntSearch => 'نەتوانرا بە پارکینگەکاندا بگەڕێت.';
  @override
  String get searching => 'گەڕان...';
  @override
  String spotsFound(int count) => '$count شوێن دۆزرایەوە';
  @override
  String get listView => 'پیشاندانی لیست';
  @override
  String get mapView => 'پیشاندانی نەخشە';
  @override
  String get noSpotsMatchFilters => 'هیچ شوێنێک لەگەڵ ئەم پاڵاوتنانە ناگونجێت';
  @override
  String get changeOrResetFilters => 'پاڵاوتنەکان بگۆڕە یان سفریان بکەرەوە.';
  @override
  String get noParkingFound => 'هیچ پارکینگێک نەدۆزرایەوە';
  @override
  String get tryAnotherName => 'ناوێکی تر یان شەقامێکی تر تاقی بکەرەوە.';
  @override
  String get clearSearch => 'سڕینەوەی گەڕان';
  @override
  String get showResults => 'پیشاندانی ئەنجامەکان';
  @override
  String get noSpotsMatch => 'هیچ شوێنێک ناگونجێت';
  @override
  String showCountResults(int count) => 'پیشاندانی $count ئەنجام';
  @override
  String get priceRangeLabel => 'مەودای نرخ';
  @override
  String get distanceLabel => 'دووری';
  @override
  String get amenitiesLabel => 'خزمەتگوزارییەکان';
  @override
  String get sortByLabel => 'ڕیزکردن بەپێی';
  @override
  String get resetAll => 'سفرکردنەوەی هەموو';
  @override
  String get anyPrice => 'هەر نرخێک';
  @override
  String priceRangePerHour(String min, String max) =>
      '$min – $max د.ع / کاتژمێر';

  // ─── Bookings, payment and receipts ────────────────────────────────────────
  @override
  String slotLevelLabel(String slot, String level) => '$slot · نهۆمی $level';
  @override
  String slotName(String slot) => 'شوێنی $slot';
  @override
  String hoursLong(int hours) => '$hours کاتژمێر';
  @override
  String get parkEasyWallet => 'جزدانی ParkEasy';
  @override
  String get card => 'کارت';
  @override
  String get receiptPaid => 'پارەدراو';
  @override
  String get receiptRefunded => 'گەڕێنرایەوە';
  @override
  String get receiptPartlyRefunded => 'بەشێکی گەڕێنرایەوە';
  @override
  String get receiptCancelled => 'هەڵوەشێنراوە';
  @override
  String get location => 'شوێن';
  @override
  String get address => 'ناونیشان';
  @override
  String get slot => 'شوێن';
  @override
  String get vehicle => 'ئۆتۆمبێل';
  @override
  String get duration => 'ماوە';
  @override
  String get rate => 'نرخ';
  @override
  String ratePerHour(String price) => '$price / کاتژمێر';
  @override
  String get total => 'کۆی گشتی';
  @override
  String get paidWith => 'پارەدان بە';
  @override
  String get backToHome => 'گەڕانەوە بۆ سەرەکی';
  @override
  String get viewReceipt => 'بینینی پسوولە';
  @override
  String get couldntLoadWallet => 'نەتوانرا جزدانەکەت باربکرێت.';
  @override
  String get bookingConfirmed => 'حیجزەکەت پشتڕاستکرایەوە!';
  @override
  String get spotReserved => 'شوێنەکەت گیراوە. هەر کاتێک بتەوێت بڕۆ بۆی.';
  @override
  String get dateAndTime => 'بەروار و کات';
  @override
  String get paid => 'پارەدراو';
  @override
  String get viewMyBooking => 'بینینی حیجزەکەم';
  @override
  String get bookingQrCode => 'کۆدی QR ی حیجز';
  @override
  String get scanAtGate => 'لە دەروازەکە سکانی بکە بۆ چوونەژوورەوە';
  @override
  String get bookingDetails => 'وردەکاریی حیجز';
  @override
  String get couldntLoadBooking => 'نەتوانرا ئەم حیجزە باربکرێت.';
  @override
  String get startTime => 'کاتی دەستپێکردن';
  @override
  String get gateQrUnavailable => 'کۆدی QR ی دەروازە هێشتا بەردەست نییە.';
  @override
  String get gateQrCode => 'کۆدی QR ی دەروازە';
  @override
  String get scanToEnterOrExit => 'سکانی بکە بۆ چوونەژوورەوە یان دەرچوون';
  @override
  String get extend => 'درێژکردنەوە';
  @override
  String get directions => 'ڕێنمایی ڕێگا';
  @override
  String get cancelBookingButton => '✕  هەڵوەشاندنەوەی حیجز';
  @override
  String freeCancellationFor(int minutes, bool refund) =>
      "هەڵوەشاندنەوەی بێبەرامبەر بۆ $minutes خولەکی تر${refund ? ' · گەڕاندنەوەی هەموو پارەکە' : ''}";
  @override
  String get endParking => 'کۆتاییهێنان بە وەستان';
  @override
  String freeCancellationEndedAt(String time) =>
      'کاتی هەڵوەشاندنەوەی بێبەرامبەر لە $time تەواو بوو';
  @override
  String get receipt => 'پسوولە';
  @override
  String get couldntLoadReceipt => 'نەتوانرا ئەم پسوولەیە باربکرێت.';
  @override
  String get couldntCreatePdf => 'نەتوانرا فایلی PDF دروست بکرێت.';
  @override
  String get parkingDetailsLabel => 'وردەکاریی وەستان';
  @override
  String get sessionLabel => 'ماوەی وەستان';
  @override
  String get paymentLabel => 'پارەدان';
  @override
  String get entry => 'چوونەژوورەوە';
  @override
  String get bookedUntil => 'حیجزکراو تا';
  @override
  String get exit => 'دەرچوون';
  @override
  String get booked => 'حیجزکراو';
  @override
  String get subtotal => 'کۆی سەرەتایی';
  @override
  String get discount => 'داشکاندن';
  @override
  String get tax => 'باج';
  @override
  String get refunded => 'گەڕێنرایەوە';
  @override
  String get downloadPdf => 'داگرتنی PDF';
  @override
  String get share => 'هاوبەشکردن';
  @override
  String receiptHeadline(bool paid, String date) =>
      "${paid ? 'پارەدراوە' : 'حیجزکراوە'} · $date";
  @override
  String get bookingCancelled => 'حیجزەکە هەڵوەشێنرایەوە';
  @override
  String get cancelledAndRefunded =>
      'حیجزەکەت هەڵوەشێنرایەوە\nو پارەکەی گەڕێنرایەوە بۆ جزدانەکەت.';
  @override
  String get bookingWasCancelled => 'حیجزەکەت هەڵوەشێنرایەوە.';
  @override
  String get cancelledAt => 'کاتی هەڵوەشاندنەوە';
  @override
  String get refundAmount => 'بڕی گەڕاوە';
  @override
  String get refundTo => 'گەڕاندنەوە بۆ';
  @override
  String get estimated => 'ماوەی خەمڵێنراو';
  @override
  String get instant => 'دەستبەجێ';
  @override
  String get findAnotherSpot => 'شوێنێکی تر بدۆزەوە';
  @override
  String get extendParking => 'درێژکردنەوەی وەستان';
  @override
  String get bookingExtended => 'حیجزەکەت درێژکرایەوە.';
  @override
  String get notEnoughBalanceTopUp =>
      'باڵانس بەش ناکات. سەرەتا جزدانەکەت پڕ بکەرەوە.';
  @override
  String get addExtraTime => 'کاتی زیادە زیاد بکە';
  @override
  String confirmExtension(String charge) =>
      'پشتڕاستکردنەوەی درێژکردنەوە · $charge';
  @override
  String get currentBooking => 'حیجزی ئێستا';
  @override
  String get started => 'دەستیپێکرد';
  @override
  String get endsAt => 'کۆتایی دێت';
  @override
  String get elapsed => 'تێپەڕیوە';
  @override
  String hoursChip(int hours) => '$hours کاتژمێر';
  @override
  String get newEndTime => 'کاتی کۆتایی نوێ';
  @override
  String get extraCharge => 'پارەی زیادە';
  @override
  String balance(String amount) => 'باڵانس: $amount';
  @override
  String balanceNotEnough(String amount) => 'باڵانس: $amount · بەش ناکات';
  @override
  String get myBookings => 'حیجزەکانم';
  @override
  String get couldntLoadBookings => 'نەتوانرا حیجزەکانت باربکرێن.';
  @override
  String get noActiveBooking => 'هیچ حیجزێکی چالاک نییە';
  @override
  String get noActiveBookingHint => 'شوێنێک حیجز بکە و لێرە دەردەکەوێت.';
  @override
  String get noPastBookings => 'هێشتا هیچ حیجزێکی پێشوو نییە';
  @override
  String get noPastBookingsHint =>
      'ئەو حیجزانەی تەواوت کردوون یان هەڵتوەشاندوونەتەوە لێرە دەردەکەون.';
  @override
  String get tabActive => 'چالاک';
  @override
  String get tabHistory => 'مێژوو';
  @override
  String get statusDone => 'تەواو';
  @override
  String get parkingEnded => 'وەستان کۆتایی هات';
  @override
  String get slotFreeThanks =>
      'شوێنەکەت بۆ شۆفێری داهاتوو ئازادە.\nسوپاس بۆ وەستان لەگەڵ ParkEasy.';
  @override
  String get parked => 'وەستاو';
  @override
  String get charged => 'وەرگیرا';
  @override
  String get payment => 'پارەدان';
  @override
  String get addVehicleToBook =>
      'ئۆتۆمبێلێک زیاد بکە بۆ ئەوەی شوێنێک حیجز بکەیت.';
  @override
  String get notEnoughBalanceTapWallet =>
      'باڵانس بەش ناکات. جزدانی ParkEasy دابگرە بۆ پڕکردنەوە.';
  @override
  String get bookingSummary => 'پوختەی حیجز';
  @override
  String get paymentMethod => 'شێوازی پارەدان';
  @override
  String balanceTapToTopUp(String amount) =>
      'باڵانس: $amount · دابگرە بۆ پڕکردنەوە';
  @override
  String get addNewCard => 'زیادکردنی کارتی نوێ';
  @override
  String confirmAndPay(String total) => 'پشتڕاستکردنەوە و پارەدانی $total';
  @override
  String freeCancellationWithin(int minutes) =>
      'هەڵوەشاندنەوەی بێبەرامبەر تا $minutes خولەک دوای دەستپێکردن';
  @override
  String get noFreeCancellation =>
      'ئەم پارکینگە هەڵوەشاندنەوەی بێبەرامبەری نییە';
  @override
  String endedAt(String time) => 'کۆتایی هات $time';
  @override
  String startedElapsed(String time, String elapsed) =>
      'دەستیپێکرد $time · $elapsed تێپەڕیوە';
  @override
  String get activeBooking => 'حیجزی چالاک';
  @override
  String get completedBooking => 'حیجزی تەواوبوو';
  @override
  String endedEarlyBooked(String time, String hours) =>
      'زووتر کۆتایی هات $time · $hours حیجزکرابوو';
  @override
  String endedHours(String time, String hours) => 'کۆتایی هات $time · $hours';
  @override
  String get cancelledBooking => 'حیجزی هەڵوەشێنراوە';
  @override
  String startedHours(String time, String hours) => 'دەستیپێکرد $time · $hours';
  @override
  String get refundNoteCard =>
      'هەڵوەشاندنەوەی بێبەرامبەر دەگرێتەوە. ئەم حیجزە بە کارت پارەی دراوە، بۆیە هیچ شتێک ناگەڕێتەوە بۆ جزدانەکەت.';
  @override
  String refundNoteWallet(String amount) =>
      'هەڵوەشاندنەوەی بێبەرامبەر دەگرێتەوە. هەموو $amount دەستبەجێ دەگەڕێتەوە بۆ جزدانی ParkEasy.';
  @override
  String get cancelBookingQuestion => 'حیجزەکە هەڵدەوەشێنیتەوە؟';
  @override
  String cancelBookingConfirm(String lot, String slot) =>
      'دڵنیایت دەتەوێت حیجزەکەت لە $lot، شوێنی $slot هەڵبوەشێنیتەوە؟';
  @override
  String get yesCancelBooking => '✕  بەڵێ، هەڵیبوەشێنەوە';
  @override
  String get keepMyBooking => 'حیجزەکەم بهێڵەوە';
  @override
  String get oneHourLess => 'کاتژمێرێک کەمتر';
  @override
  String get oneHourMore => 'کاتژمێرێک زیاتر';
  @override
  String parkedSoFar(String parked, String hours, String lot, String slot) =>
      'تا ئێستا $parked وەستاویت لە کۆی $hours\nلە $lot، شوێنی $slot.';
  @override
  String get endParkingQuestion => 'ئێستا وەستان کۆتایی پێدەهێنیت؟';
  @override
  String endingEarlyNote(String amount) =>
      'کۆتاییهێنانی زوو پارەی ناگەڕێتەوە: هەموو $amount وەرگیراو دەمێنێتەوە. شوێنەکەت دەستبەجێ بۆ شۆفێرانی تر ئازاد دەبێت.';
  @override
  String get keepParking => 'بەردەوامبوون لە وەستان';
  @override
  String specialPrice(String label, String price) =>
      'نرخی $label: $price/کاتژمێر';
  @override
  String dailyCapSaved(String amount) =>
      'سنووری ڕۆژانە جێبەجێ کرا: $amount پاشەکەوت دەکەیت';
  @override
  String get addAVehicle => 'ئۆتۆمبێلێک زیاد بکە';
  @override
  String get changeVehicle => 'گۆڕینی ئۆتۆمبێل';

  // ─── Wallet, top-ups and payment methods ───────────────────────────────────
  @override
  String topUpBetween(String min, String max) =>
      'بڕی پڕکردنەوە دەبێت لە نێوان $min و $max بێت.';
  @override
  String get payWithFib => 'پارەدان بە FIB';
  @override
  String get paymentCode => 'کۆدی پارەدان';
  @override
  String get testBank => 'بانکی تاقیکردنەوە';
  @override
  String get approvePayment => 'پەسەندکردنی پارەدان';
  @override
  String get declining => 'ڕەتکردنەوە…';
  @override
  String get decline => 'ڕەتکردنەوە';
  @override
  String get cancelling => 'هەڵوەشاندنەوە…';
  @override
  String get cancelTopUp => 'هەڵوەشاندنەوەی پڕکردنەوە';
  @override
  String get walletTopUp => 'پڕکردنەوەی جزدان';
  @override
  String get topUpWaiting => 'چاوەڕوان';
  @override
  String get topUpPaid => 'پارەدراو';
  @override
  String get topUpDeclined => 'ڕەتکرایەوە';
  @override
  String get topUpExpired => 'بەسەرچوو';
  @override
  String get topUpCancelled => 'هەڵوەشێنراوە';
  @override
  String get paymentCodeCopied => 'کۆدی پارەدان کۆپی کرا.';
  @override
  String get copyCode => 'کۆپیکردنی کۆد';
  @override
  String enterCodeInFib(int minutes, String seconds) =>
      'ئەم کۆدە لە ئەپی FIB بنووسە بۆ پارەدان. دوای $minutes:$seconds بەسەردەچێت.';
  @override
  String get testModeNote =>
      'دۆخی تاقیکردنەوە: هیچ پارەیەکی ڕاستەقینە ناگوازرێتەوە. ئەمە جێگەی ئەپی FIB دەگرێتەوە، بۆیە وەک کڕیار لێرەوە پارەدانەکە پەسەند یان ڕەت بکەرەوە.';
  @override
  String get waitingForFib => 'چاوەڕێی پەسەندکردنی پارەدانەکەیت لە ئەپی FIB…';
  @override
  String get walletToppedUp => 'جزدان پڕکرایەوە';
  @override
  String amountAdded(String amount) => '$amount خرایە سەر جزدانەکەت.';
  @override
  String get paymentDeclined => 'پارەدان ڕەتکرایەوە';
  @override
  String get paymentDeclinedBody =>
      'بانکەکە پارەدانەکەی ڕەتکردەوە، بۆیە هیچ پارەیەک لە جزدانەکەت نەبڕا.';
  @override
  String get paymentExpired => 'کاتی پارەدان بەسەرچوو';
  @override
  String get paymentExpiredBody =>
      'لە کاتی خۆیدا پەسەند نەکرا. پڕکردنەوەیەکی نوێ دەست پێبکە بۆ ئەوەی دووبارە هەوڵ بدەیتەوە.';
  @override
  String get topUpCancelledTitle => 'پڕکردنەوە هەڵوەشێنرایەوە';
  @override
  String get nothingCharged => 'هیچ پارەیەک وەرنەگیرا.';
  @override
  String get backToWallet => 'گەڕانەوە بۆ جزدان';
  @override
  String topUpAmountButton(String amount) => 'پڕکردنەوەی $amount';
  @override
  String get topUp => 'پڕکردنەوە';
  @override
  String get withdrawalsUnavailable => 'ڕاکێشانی پارە هێشتا بەردەست نییە.';
  @override
  String get topUpAmountLabel => 'بڕی پڕکردنەوە';
  @override
  String get recentTransactions => 'دوایین مامەڵەکان';
  @override
  String get transactionsEmpty =>
      'پڕکردنەوە، پارەدان و گەڕاندنەوەکان لێرە دەردەکەون.';
  @override
  String get availableBalance => 'باڵانسی بەردەست';
  @override
  String get topUpChip => '+ پڕکردنەوە';
  @override
  String get withdrawChip => '↑ ڕاکێشان';
  @override
  String get firstIraqiBank => 'یەکەم بانکی عێراقی (FIB)';
  @override
  String get approveInFib => 'پارەدانەکە لە ئەپی FIB پەسەند بکە';
  @override
  String get paymentMethods => 'شێوازەکانی پارەدان';
  @override
  String get walletLabel => 'جزدان';
  @override
  String get addMoneyWith => 'زیادکردنی پارە بە';
  @override
  String get cardsLabel => 'کارتەکان';
  @override
  String get addNewCardRow => 'زیادکردنی کارتێکی نوێ';
  @override
  String get cardsUnavailable =>
      'پارەدان بە کارت هێشتا بەردەست نییە. لە جیاتی ئەوە جزدانەکەت بە FIB پڕ بکەرەوە.';
  @override
  String get paysForBookings => 'پارەی حیجز و درێژکردنەوەکان دەدات';
  @override
  String get comingSoon => 'بەم زووانە';

  // ─── Profile, vehicles and app language ────────────────────────────────────
  @override
  String get signOutQuestion => 'دەچیتە دەرەوە؟';
  @override
  String get signOutMessage =>
      'هەر کاتێک بتەوێت دەتوانیت بە ئیمەیڵ و وشەی نهێنییەکەت بگەڕێیتەوە ژوورەوە.';
  @override
  String get signOut => 'چوونەدەرەوە';
  @override
  String get couldntLoadProfile => 'نەتوانرا پرۆفایلەکەت باربکرێت.';
  @override
  String get profile => 'پرۆفایل';
  @override
  String get account => 'هەژمار';
  @override
  String get personalDetails => 'زانیارییە کەسییەکان';
  @override
  String get personalDetailsHint => 'ناو، ئیمەیڵ، مۆبایل و ڕۆژی لەدایکبوون';
  @override
  String get myVehicles => 'ئۆتۆمبێلەکانم';
  @override
  String get myVehiclesHint =>
      'ئۆتۆمبێلەکانت زیاد بکە و یەکێکیان بکە بە سەرەکی';
  @override
  String get changePassword => 'گۆڕینی وشەی نهێنی';
  @override
  String get preferences => 'هەڵبژاردنەکان';
  @override
  String get darkMode => 'دۆخی تاریک';
  @override
  String get more => 'زیاتر';
  @override
  String get wallet => 'جزدان';
  @override
  String get helpAndSupport => 'یارمەتی و پشتگیری';
  @override
  String get deleteAccount => 'سڕینەوەی هەژمار';
  @override
  String get appLanguage => 'زمانی ئەپ';
  @override
  String get appLanguageNote =>
      'زمانی ئەپەکە و نامەکانی هەڵبژێرە. کوردی لە ڕاستەوە بۆ چەپ دەخوێنرێتەوە.';
  @override
  String get currentLanguageName => 'کوردی';
  @override
  String languageHint(String code) =>
      code == 'ckb' ? 'کوردیی سۆرانی' : 'ئینگلیزی';
  @override
  String get dateOfBirth => 'ڕۆژی لەدایکبوون';
  @override
  String get profileUpdated => 'پرۆفایلەکەت نوێکرایەوە.';
  @override
  String get couldntSaveChanges => 'نەتوانرا گۆڕانکارییەکانت پاشەکەوت بکرێن.';
  @override
  String get fullName => 'ناوی تەواو';
  @override
  String get fullNameHint => 'دیلان کەریمی';
  @override
  String get phoneHint => '+964 750 123 4567';
  @override
  String get dateOfBirthOptional => 'ڕۆژی لەدایکبوون (ئارەزوومەندانە)';
  @override
  String get notSet => 'دانەنراوە';
  @override
  String get editProfile => 'دەستکاریکردنی پرۆفایل';
  @override
  String get passwordChanged => 'وشەی نهێنییەکەت گۆڕدرا.';
  @override
  String get couldntChangePassword => 'نەتوانرا وشەی نهێنییەکەت بگۆڕدرێت.';
  @override
  String get changePasswordRules =>
      'لانیکەم 8 پیت بەکاربهێنە لەگەڵ پیتێکی گەورە و پیتێکی بچووک، ژمارەیەک و هێمایەک.';
  @override
  String get currentPassword => 'وشەی نهێنیی ئێستا';
  @override
  String get chooseDifferentPassword => 'وشەی نهێنییەکی جیاواز هەڵبژێرە';
  @override
  String get updatePassword => 'نوێکردنەوەی وشەی نهێنی';
  @override
  String get deleteAccountQuestion => 'هەژمارەکەت دەسڕیتەوە؟';
  @override
  String get cantBeUndone => 'ئەمە ناگەڕێتەوە.';
  @override
  String get accountDeleted => 'هەژمارەکەت سڕایەوە.';
  @override
  String get couldntDeleteAccount => 'نەتوانرا هەژمارەکەت بسڕدرێتەوە.';
  @override
  String get deleteAccountWarning =>
      'پرۆفایلەکەت، ئۆتۆمبێلەکانت و زانیارییە پاشەکەوتکراوەکانت دەسڕدرێنەوە و لە هەژمارەکەت دەچیتە دەرەوە. حیجزە پێشووەکان بۆ تۆمارەکانمان دەمێننەوە. ئەمە ناگەڕێتەوە.';
  @override
  String get enterPasswordToConfirm =>
      'وشەی نهێنییەکەت بنووسە بۆ پشتڕاستکردنەوە';
  @override
  String get deleteMyAccount => 'هەژمارەکەم بسڕەوە';
  @override
  String get keepMyAccount => 'هەژمارەکەم بهێڵەوە';
  @override
  String get vehicleSedan => 'سیدان';
  @override
  String get vehicleSuv => 'SUV';
  @override
  String get vehicleTruck => 'بارهەڵگر';
  @override
  String nowDefaultVehicle(String name) => '$name ئێستا ئۆتۆمبێلی سەرەکیتە.';
  @override
  String vehicleRemoved(String name) => '$name لابرا.';
  @override
  String deleteVehicleQuestion(String name) => '$name دەسڕیتەوە؟';
  @override
  String plateWillBeRemoved(String plate) =>
      'ژمارەی تابلۆی $plate لە هەژمارەکەت لادەبرێت.';
  @override
  String get addVehicle => 'زیادکردنی ئۆتۆمبێل';
  @override
  String get couldntLoadVehicles => 'نەتوانرا ئۆتۆمبێلەکانت باربکرێن.';
  @override
  String get addAnotherVehicle => 'ئۆتۆمبێلێکی تر زیاد بکە';
  @override
  String get noVehiclesYet => 'هێشتا هیچ ئۆتۆمبێلێک نییە';
  @override
  String get noVehiclesHint =>
      'ئۆتۆمبێلەکەت زیاد بکە بۆ ئەوەی بە یەک دەستلێدان شوێنی وەستان حیجز بکەیت.';
  @override
  String get vehicleUpdated => 'ئۆتۆمبێلەکە نوێکرایەوە.';
  @override
  String get vehicleAdded => 'ئۆتۆمبێلەکە زیادکرا.';
  @override
  String get addYourVehicle => 'ئۆتۆمبێلەکەت زیاد بکە';
  @override
  String get editVehicle => 'دەستکاریکردنی ئۆتۆمبێل';
  @override
  String get couldntSaveVehicle => 'نەتوانرا ئۆتۆمبێلەکە پاشەکەوت بکرێت.';
  @override
  String get addVehicleIntro =>
      'ئەو ئۆتۆمبێلە زیاد بکە کە زۆرتر دەیوەستێنیت. دواتر لە پرۆفایلەکەتدا دەتوانیت زیاتر زیاد بکەیت یان بیگۆڕیت.';
  @override
  String get brand => 'مارکە';
  @override
  String get brandHint => 'Toyota';
  @override
  String get model => 'مۆدێل';
  @override
  String get modelHint => 'Camry';
  @override
  String get color => 'ڕەنگ';
  @override
  String get colorHint => 'زیوی';
  @override
  String get licensePlate => 'ژمارەی تابلۆ';
  @override
  String get plateHint => '22 SUL 12345';
  @override
  String get vehicleTypeLabel => 'جۆر';
  @override
  String get saveVehicle => 'پاشەکەوتکردنی ئۆتۆمبێل';
  @override
  String get year => 'ساڵ';
  @override
  String get defaultBadge => 'سەرەکی';
  @override
  String get makeDefault => 'بیکە بە سەرەکی';

  // ─── Notifications ─────────────────────────────────────────────────────────
  @override
  String get couldntLoadNotificationSettings =>
      'نەتوانرا ڕێکخستنەکانی ئاگادارکردنەوە باربکرێن.';
  @override
  String get bookingReminders => 'بیرخستنەوەی حیجز';
  @override
  String get bookingRemindersHint => '15 خولەک پێش حیجز';
  @override
  String get expiryAlerts => 'ئاگادارکردنەوەی تەواوبوونی کات';
  @override
  String get expiryAlertsHint => '15 خولەک پێش تەواوبوونی کاتەکەت';
  @override
  String get offers => 'داشکاندن و پێشکەشکراوەکان';
  @override
  String get offersHint => 'داشکاندنەکانی نزیک تۆ';
  @override
  String get loyaltyRewards => 'خەڵاتی دڵسۆزی';
  @override
  String get loyaltyRewardsHint => 'پێشکەوتن و ئیمتیازە کراوەکان';
  @override
  String get bookingReceipts => 'پسوولەی حیجز';
  @override
  String get bookingReceiptsHint => 'دوای کۆتاییهاتنی هەر وەستانێک';
  @override
  String get newsletter => 'هەواڵنامە';
  @override
  String get newsletterHint => 'نوێکارییە مانگانەکان';
  @override
  String get inAppNotifications => 'ئاگادارکردنەوەکانی ناو ئەپ';
  @override
  String get emailNotifications => 'ئاگادارکردنەوەکانی ئیمەیڵ';
  @override
  String withComingSoon(String text) => '$text · بەم زووانە';
  @override
  String get markAllRead => 'هەمووی وەک خوێندراوە دیاری بکە';
  @override
  String get couldntLoadNotifications =>
      'نەتوانرا ئاگادارکردنەوەکانت باربکرێن.';
  @override
  String get bookingUpdatesHere => 'نوێکارییەکانی حیجزەکانت لێرە دەردەکەون.';
  @override
  String get walletUpdatesHere => 'پڕکردنەوەکانی جزدان لێرە دەردەکەون.';
  @override
  String get allUpdatesHere => 'نوێکارییەکانی حیجز و جزدان لێرە دەردەکەون.';
  @override
  String get noNotificationsYet => 'هێشتا هیچ ئاگادارکردنەوەیەک نییە';
  @override
  String get unread => 'نەخوێندراوە';
  @override
  String get tabAll => 'هەموو';
  @override
  String get tabBookings => 'حیجزەکان';
  @override
  String get tabWallet => 'جزدان';

  // ─── Help, QR scanning and placeholders ────────────────────────────────────
  @override
  String noEmailAppCopied(String email) =>
      'هیچ ئەپێکی ئیمەیڵ نەدۆزرایەوە. $email کۆپی کرا.';
  @override
  String get couldntOpenDocs => 'نەتوانرا ڕێنماییەکان بکرێنەوە.';
  @override
  String get contactUs => 'پەیوەندیمان پێوە بکە';
  @override
  String get liveChat => 'چاتی ڕاستەوخۆ';
  @override
  String get liveChatUnavailable =>
      'چاتی ڕاستەوخۆ هێشتا بەردەست نییە. لە جیاتی ئەوە ئیمەیڵمان بۆ بنێرە.';
  @override
  String get emailUs => 'ئیمەیڵمان بۆ بنێرە';
  @override
  String get replyIn24h => 'وەڵام لە ماوەی 24 کاتژمێردا';
  @override
  String get faqsLabel => 'پرسیارە باوەکان';
  @override
  String get viewDocumentation => 'بینینی هەموو ڕێنماییەکان';
  @override
  String get supportEmailSubject => 'پشتگیریی ParkEasy';
  @override
  String get faqCancelQ => 'چۆن حیجزێک هەڵبوەشێنمەوە؟';
  @override
  String get faqCancelA =>
      'بڕۆ بۆ حیجزەکانم، حیجزەکە دابگرە و هەڵوەشاندنەوەی حیجز هەڵبژێرە. تا 10 خولەک دوای دەستپێکردن دەتوانیت هەڵیبوەشێنیتەوە و هەموو پارەکەت بۆ دەگەڕێتەوە (هەندێک پارکینگ ماوەی درێژتر دەدەن: لاپەڕەی پارەدان پیشانی دەدات). دوای ئەوە، بۆ ڕۆیشتنی زوو کۆتاییهێنان بە وەستان دابگرە؛ پارەی کاتی حیجزکراو ناگەڕێتەوە.';
  @override
  String get faqExtendQ => 'دەتوانم کاتی وەستانەکەم درێژ بکەمەوە؟';
  @override
  String get faqExtendA =>
      'بەڵێ. تا حیجزەکە چالاکە، بیکەرەوە و درێژکردنەوە دابگرە. کاتژمێرە زیادەکان لە جزدانەکەتەوە بە هەمان ئەو نرخانەی حیجزت پێکردووە دەدرێن، تا کۆی 24 کاتژمێر، بە مەرجێک پارکینگەکە کراوە بێت. کاتژمێرەکانی ڕۆژێک کە پێشتر گەیشتووەتە سنووری ڕۆژانەی پارکینگەکە هیچ ناکەون.';
  @override
  String get faqPricesQ => 'نرخەکان چۆن حیساب دەکرێن؟';
  @override
  String get faqPricesA =>
      'هەر کاتژمێرێک دەست پێبکات بە نرخی کاتژمێری پارکینگەکە حیساب دەکرێت. هەندێک پارکینگ سنووری ڕۆژانەیان هەیە: هەرچەند بمێنیتەوە، یەک ڕۆژ لەوە زیاتر ناکەوێت. لە ڕۆژە تایبەتەکاندا، وەک جەژن یان نەورۆز، پارکینگێک دەتوانێت نرخێکی جیاواز دابنێت؛ لاپەڕەی پارکینگەکە پیشانی دەدات. لاپەڕەی پارەدان هەمیشە کۆی گشتیی ورد پێش پارەدان پیشان دەدات.';
  @override
  String get faqTakenQ => 'ئەگەر شوێنەکە پێشتر گیرابوو چی بکەم؟';
  @override
  String get faqTakenA =>
      'لەو کاتەوەی حیجز دەکەیت شوێنەکەت بۆت گیراوە. ئەگەر لەگەڵ ئەوەشدا کەسێک تێیدا وەستابوو، تا کاتی هەڵوەشاندنەوەی بێبەرامبەر ماوە هەڵیبوەشێنەوە (حیجزەکە پیشانی دەدات چەندی ماوە) و شوێنێکی تر حیجز بکە، پاشان بە ژمارەی پسوولەکەتەوە ئیمەیڵمان بۆ بنێرە.';
  @override
  String get faqQrQ => 'کۆدی QR چۆن کار دەکات؟';
  @override
  String get faqQrA =>
      'هەر گەراجێک کۆدێکی QR ی ParkEasy لە دەروازەکەیدا هەیە. لە شاشەی سەرەکی دوگمەی سکان دابگرە و کامێراکە ئاراستەی بکە: گەراجەکە دەکرێتەوە و ئامادەیە بۆ هەڵبژاردنی شوێن و حیجزکردن.';
  @override
  String get notAParkEasyCode => 'ئەمە کۆدی پارکینگی ParkEasy نییە.';
  @override
  String get turnOffLight => 'کوژاندنەوەی گڵۆپ';
  @override
  String get turnOnLight => 'هەڵکردنی گڵۆپ';
  @override
  String get pointAtQr => 'کامێراکە ئاراستەی کۆدی QR ی دەروازەی پارکینگەکە بکە';
  @override
  String get enterLotCode => 'کۆدی پارکینگ بنووسە';
  @override
  String get cameraOff => 'دەستگەیشتن بە کامێرا بۆ ParkEasy کوژاوەتەوە.';
  @override
  String get cameraUnavailable => 'کامێرا لەم ئامێرەدا بەردەست نییە.';
  @override
  String get openSettings => 'کردنەوەی ڕێکخستنەکان';
  @override
  String get enterLotCodeInstead => 'لە جیاتی ئەوە کۆدی پارکینگ بنووسە';
  @override
  String get enterNumberUnderQr =>
      'ئەو ژمارەیە بنووسە کە لە ژێر کۆدەکەی QR دایە.';
  @override
  String get openButton => 'کردنەوە';

  // ─── Right to left ─────────────────────────────────────────────────────────
}
