import 'package:mobile/core/l10n/app_strings.dart';

/// English.
class EnStrings extends AppStrings {
  const EnStrings();

  @override
  String get code => 'en';

  @override
  bool get isRtl => false;

  // ─── Shared ────────────────────────────────────────────────────────────────
  @override
  String get tryAgain => 'Try again';
  @override
  String get cancel => 'Cancel';
  @override
  String get saveChanges => 'Save changes';
  @override
  String get continueLabel => 'Continue';
  @override
  String get skip => 'Skip';
  @override
  String get edit => 'Edit';
  @override
  String get remove => 'Remove';
  @override
  String get delete => 'Delete';
  @override
  String get clear => 'Clear';
  @override
  String get viewAll => 'View all';
  @override
  String get seeAll => 'See all';
  @override
  String get required => 'Required';
  @override
  String get iqd => 'IQD';
  @override
  String get somethingWentWrong => 'Something went wrong. Please try again.';
  @override
  String get backArrow => '←';
  @override
  String get forwardChevron => '›';

  // ─── Formats, form checks, errors and shared widgets ───────────────────────
  @override
  String monthShort(int month) => const [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ][month - 1];
  @override
  String monthName(int month) => const [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ][month - 1];
  @override
  bool get use24HourClock => false;
  @override
  String get today => 'Today';
  @override
  String get yesterday => 'Yesterday';
  @override
  String get tomorrow => 'Tomorrow';
  @override
  String get am => 'AM';
  @override
  String get pm => 'PM';
  @override
  String dayMonthYear(int day, String month, int year) => '$day $month, $year';
  @override
  String hoursMinutesShort(int hours, int minutes) => '${hours}h ${minutes}m';
  @override
  String hoursShort(int hours) => '${hours}h';
  @override
  String minutesShort(int minutes) => '${minutes}m';
  @override
  String get kmUnit => 'km';
  @override
  String get metresUnit => 'm';
  @override
  String atLeastChars(int min) => 'At least $min characters';
  @override
  String atMostChars(int max) => 'At most $max characters';
  @override
  String get enterValidEmail => 'Enter a valid email';
  @override
  String get enterValidPhone => 'Enter a valid phone number';
  @override
  String get noSpaces => 'No spaces';
  @override
  String get addUppercase => 'Add an uppercase letter';
  @override
  String get addLowercase => 'Add a lowercase letter';
  @override
  String get addNumber => 'Add a number';
  @override
  String get addSymbol => 'Add a symbol, e.g. ! or #';
  @override
  String get passwordsDontMatch => 'Passwords do not match';
  @override
  String get plateCharacters => 'Letters, numbers, spaces and dashes only';
  @override
  String get enterYear => 'Enter a year';
  @override
  String yearBetween(int max) => 'Between 1950 and $max';
  @override
  String get sessionExpired =>
      'Your session has expired. Please sign in again.';
  @override
  String get requestTimedOut => 'Request timed out. Please try again.';
  @override
  String get cantReachServer =>
      "Can't reach the server. Check your connection and try again.";
  @override
  String somethingWentWrongCode(int code) =>
      'Something went wrong ($code). Please try again later.';
  @override
  String get noInternetTitle => 'No Internet Connection';
  @override
  String get noInternetMessage =>
      'Please check your internet connection and try again.';
  @override
  String get navHome => 'Home';
  @override
  String get navMap => 'Map';
  @override
  String get navBookings => 'Bookings';
  @override
  String get navProfile => 'Profile';
  @override
  String get passwordWeak => 'Weak password';
  @override
  String get passwordFair => 'Fair password';
  @override
  String get passwordGood => 'Good password';
  @override
  String get passwordStrong => 'Strong password';
  @override
  String mapData(String attribution) => 'Map data $attribution';

  // ─── Welcome, sign in, sign up and password reset ──────────────────────────
  @override
  String get tagline => 'Find & book parking in seconds';
  @override
  String get signIn => 'Sign in';
  @override
  String get or => 'or';
  @override
  String get email => 'Email';
  @override
  String get emailAddress => 'Email address';
  @override
  String get emailHint => 'you@example.com';
  @override
  String get password => 'Password';
  @override
  String get newPassword => 'New password';
  @override
  String get confirmNewPassword => 'Confirm new password';
  @override
  String get resetPassword => 'Reset password';
  @override
  String get createAccount => 'Create account';
  @override
  String get backToSignIn => 'Back to sign in';
  @override
  String get onboardingFindTitle => 'Find nearby spots';
  @override
  String get onboardingFindSubtitle => 'Real-time availability';
  @override
  String get onboardingReserveTitle => 'Reserve in advance';
  @override
  String get onboardingReserveSubtitle => 'Book before you arrive';
  @override
  String get onboardingPayTitle => 'Pay seamlessly';
  @override
  String get onboardingPaySubtitle => 'From your ParkEasy wallet';
  @override
  String get getStarted => 'Get started';
  @override
  String get alreadyHaveAccount => 'Already have an account?';
  @override
  String get allowLocation => 'Allow location access';
  @override
  String get locationWhy =>
      'ParkEasy needs your location to show nearby parking spots and guide you to your booked slot.';
  @override
  String get locationFindTitle => 'Find nearby spots';
  @override
  String get locationFindSubtitle => 'See available parking around you';
  @override
  String get locationNavigateTitle => 'Navigate to your spot';
  @override
  String get locationNavigateSubtitle => 'Turn-by-turn to the parking lot';
  @override
  String get locationPrivateTitle => 'Location is never sold';
  @override
  String get locationPrivateSubtitle => 'Used only while using the app';
  @override
  String get notNow => 'Not now';
  @override
  String get welcomeBack => 'Welcome back';
  @override
  String get signInToAccount => 'Sign in to your account';
  @override
  String get enterYourPassword => 'Please enter your password';
  @override
  String get forgotPassword => 'Forgot password?';
  @override
  String get continueWithGoogle => 'G   Continue with Google';
  @override
  String get newHere => 'New here? ';
  @override
  String get firstName => 'First name';
  @override
  String get firstNameHint => 'Dilan';
  @override
  String get lastName => 'Last name';
  @override
  String get lastNameHint => 'Karimi';
  @override
  String get phoneNumber => 'Phone number';
  @override
  String get confirmPassword => 'Confirm password';
  @override
  String get agreeToThe => 'I agree to the ';
  @override
  String get termsOfService => 'Terms of Service';
  @override
  String get and => ' and ';
  @override
  String get privacyPolicy => 'Privacy Policy';
  @override
  String get signUpWithGoogle => 'G   Sign up with Google';
  @override
  String get alreadyHaveAccountSpace => 'Already have an account? ';
  @override
  String get forgotYourPassword => 'Forgot your password?';
  @override
  String get forgotPasswordHelp =>
      "Enter the email linked to your account\nand we'll send you a reset code.";
  @override
  String get sendResetCode => 'Send reset code';
  @override
  String get rememberedIt => 'Remembered it? ';
  @override
  String newCodeSent(String email) => 'We sent a new code to $email.';
  @override
  String get enterCode => 'Enter code';
  @override
  String get checkYourEmail => 'Check your email';
  @override
  String get codeSentTo => 'We sent a 6-digit code to\n';
  @override
  String get verifyCode => 'Verify code';
  @override
  String get didntReceiveCode => "Didn't receive the code?";
  @override
  String resendIn(String seconds) => 'Resend in 0:$seconds';
  @override
  String get resendCode => 'Resend code';
  @override
  String get setNewPassword => 'Set a new password';
  @override
  String get passwordRules =>
      'At least 8 characters, with an uppercase and a lowercase letter, a number and a symbol.';
  @override
  String get passwordResetDone => 'Password reset!';
  @override
  String get passwordResetSignedOut =>
      'Your password has been updated. For your safety you were signed out on every device.';
  @override
  String get signInNow => 'Sign in now';

  // ─── Home and location ─────────────────────────────────────────────────────
  @override
  String get parkingLot => 'Parking lot';
  @override
  String get statusActive => 'Active';
  @override
  String get statusCompleted => 'Completed';
  @override
  String get statusCancelled => 'Cancelled';
  @override
  String get yourRegulars => 'Your regulars';
  @override
  String get yourRegularsBadge => 'Your Regulars';
  @override
  String get recentBookings => 'Recent bookings';
  @override
  String get findSpot => 'Find spot';
  @override
  String get scanQr => 'Scan QR';
  @override
  String get favorites => 'Favorites';
  @override
  String get history => 'History';
  @override
  String get lookingForSpots => 'Looking for spots near you...';
  @override
  String get couldntCheckSpots => "Couldn't check spots near you";
  @override
  String get noFreeSpotsNear => 'No free spots near you right now';
  @override
  String spotsNearYou(int count) =>
      "${count == 1 ? '1 spot' : '$count spots'} available near you";
  @override
  String get findNearbySpot => 'Find nearby spot';
  @override
  String get find => 'Find';
  @override
  String get yourLocation => 'Your location';
  @override
  String get notifications => 'Notifications';
  @override
  String get notificationsUnread => 'Notifications, unread';
  @override
  String get searchParkingSpots => 'Search parking spots...';
  @override
  String get locationServiceOff => 'Location is turned off on this phone.';
  @override
  String get locationNotAllowed =>
      'ParkEasy is not allowed to use your location.';
  @override
  String get locationOffInSettings =>
      'Location is off for ParkEasy. Turn it on in Settings.';
  @override
  String get locationTimeout =>
      "Couldn't get your location. Try again outside.";
  @override
  String get locationUnknown => "Couldn't get your location.";

  // ─── Map and directions ────────────────────────────────────────────────────
  @override
  String perHourShort(String price) => '$price/hr';
  @override
  String freeCount(int count) => '$count free';
  @override
  String get full => 'Full';
  @override
  String get couldntLoadParkingLots => "Couldn't load the parking lots.";
  @override
  String get locationOffOnPhone => 'Location is off on this phone.';
  @override
  String get turnOn => 'Turn on';
  @override
  String get locationOffForApp => 'Location is off for ParkEasy.';
  @override
  String get settings => 'Settings';
  @override
  String get seeNearestSpots => 'See the spots nearest to you.';
  @override
  String get useMyLocation => 'Use my location';
  @override
  String get couldntFindLocation => "Couldn't find your location.";
  @override
  String lotCalloutSemantics(String name, int free) =>
      '$name, $free free, open details';
  @override
  String get searchArea => 'Search area';
  @override
  String get searchAreaHint => 'Search area...';
  @override
  String get showMyLocation => 'Show my location';
  @override
  String get nearbySpots => 'Nearby spots';
  @override
  String get parkingInSulaymaniyah => 'Parking in Sulaymaniyah';
  @override
  String get noParkingLotsYet => 'No parking lots yet.';
  @override
  String get getDirections => 'Get directions';
  @override
  String get couldntLoadLot => "Couldn't load this lot.";
  @override
  String couldntOpenApp(String app) => "Couldn't open $app.";
  @override
  String couldntOpenAppCopied(String app) =>
      "Couldn't open $app. The lot's coordinates were copied.";
  @override
  String get openWith => 'OPEN WITH';
  @override
  String get recommended => 'Recommended';
  @override
  String recommendedSemantics(String name) => '$name, recommended';
  @override
  String straightLine(String distance) => '$distance  ·  straight line';

  // ─── Search, parking lots and favorites ────────────────────────────────────
  @override
  String get perHourSuffix => '/hr';
  @override
  String get covered => 'Covered';
  @override
  String get evShort => 'EV';
  @override
  String get evCharging => 'EV charging';
  @override
  String get evCharge => 'EV charge';
  @override
  String get accessible => 'Accessible';
  @override
  String get cctv => 'CCTV';
  @override
  String get open24hAmenity => '24h open';
  @override
  String get open24hShort => '24h';
  @override
  String get sortNearest => 'Nearest';
  @override
  String get sortCheapest => 'Cheapest';
  @override
  String get sortTopRated => 'Top rated';
  @override
  String get anyDistance => 'Any';
  @override
  String get couldntLoadFavorites => "Couldn't load your favorites.";
  @override
  String removedFromFavorites(String name) => '$name removed from favorites.';
  @override
  String get undo => 'Undo';
  @override
  String get noFavoritesYet => 'No favorites yet';
  @override
  String get noFavoritesHint =>
      'Tap the heart on a parking lot to keep it here.';
  @override
  String get removeFromFavorites => 'Remove from favorites';
  @override
  String get addToFavorites => 'Add to favorites';
  @override
  String get couldntLoadParkingLot => "Couldn't load this parking lot.";
  @override
  String get newLot => 'New';
  @override
  String get freeSlots => 'Free slots';
  @override
  String get iqdPerHour => 'IQD / hour';
  @override
  String get rating => 'Rating';
  @override
  String get open => 'Open';
  @override
  String get backToMap => '← Back to map';
  @override
  String get pickFreeSlot => 'Pick a free slot';
  @override
  String slotAndLevel(String slot, String level) => 'Slot $slot · Level $level';
  @override
  String get bookNow => 'Book now';
  @override
  String get pickSlot => 'Pick a slot';
  @override
  String get noSlotsYet => 'This lot has no slots yet.';
  @override
  String levelName(String level) => 'Level $level';
  @override
  String slotSemantics(String slot, bool taken) =>
      "Slot $slot${taken ? ', taken' : ''}";
  @override
  String get slotFree => 'Free';
  @override
  String get slotSelected => 'Selected';
  @override
  String get slotTaken => 'Taken';
  @override
  String specialPriceToday(String label, String price) =>
      '$label price today: $price/hr';
  @override
  String neverMoreThanADay(String amount) => 'Never more than $amount a day';
  @override
  String specialPriceOn(String label, String price, String days) =>
      '$label: $price/hr on $days';
  @override
  String get filters => 'Filters';
  @override
  String get chipNearest => 'Nearest';
  @override
  String get chipPrice => 'Price';
  @override
  String get couldntSearch => "Couldn't search parking lots.";
  @override
  String get searching => 'Searching...';
  @override
  String spotsFound(int count) =>
      "${count == 1 ? '1 spot' : '$count spots'} found";
  @override
  String get listView => 'List view';
  @override
  String get mapView => 'Map view';
  @override
  String get noSpotsMatchFilters => 'No spots match these filters';
  @override
  String get changeOrResetFilters => 'Change or reset the filters.';
  @override
  String get noParkingFound => 'No parking found';
  @override
  String get tryAnotherName => 'Try another name or street.';
  @override
  String get clearSearch => 'Clear search';
  @override
  String get showResults => 'Show results';
  @override
  String get noSpotsMatch => 'No spots match';
  @override
  String showCountResults(int count) =>
      "Show ${count == 1 ? '1 result' : '$count results'}";
  @override
  String get priceRangeLabel => 'PRICE RANGE';
  @override
  String get distanceLabel => 'DISTANCE';
  @override
  String get amenitiesLabel => 'AMENITIES';
  @override
  String get sortByLabel => 'SORT BY';
  @override
  String get resetAll => 'Reset all';
  @override
  String get anyPrice => 'Any price';
  @override
  String priceRangePerHour(String min, String max) => '$min – $max IQD / hr';

  // ─── Bookings, payment and receipts ────────────────────────────────────────
  @override
  String slotLevelLabel(String slot, String level) => '$slot · Level $level';
  @override
  String slotName(String slot) => 'Slot $slot';
  @override
  String hoursLong(int hours) => hours == 1 ? '1 hour' : '$hours hours';
  @override
  String get parkEasyWallet => 'ParkEasy Wallet';
  @override
  String get card => 'Card';
  @override
  String get receiptPaid => 'PAID';
  @override
  String get receiptRefunded => 'REFUNDED';
  @override
  String get receiptPartlyRefunded => 'PART REFUNDED';
  @override
  String get receiptCancelled => 'CANCELLED';
  @override
  String get location => 'Location';
  @override
  String get address => 'Address';
  @override
  String get slot => 'Slot';
  @override
  String get vehicle => 'Vehicle';
  @override
  String get duration => 'Duration';
  @override
  String get rate => 'Rate';
  @override
  String ratePerHour(String price) => '$price / hr';
  @override
  String get total => 'Total';
  @override
  String get paidWith => 'Paid with';
  @override
  String get backToHome => 'Back to home';
  @override
  String get viewReceipt => 'View receipt';
  @override
  String get couldntLoadWallet => "Couldn't load your wallet.";
  @override
  String get bookingConfirmed => 'Booking confirmed!';
  @override
  String get spotReserved => 'Your spot is reserved. Head there anytime.';
  @override
  String get dateAndTime => 'Date & time';
  @override
  String get paid => 'Paid';
  @override
  String get viewMyBooking => 'View my booking';
  @override
  String get bookingQrCode => 'Booking QR code';
  @override
  String get scanAtGate => 'Scan at the gate to enter';
  @override
  String get bookingDetails => 'Booking details';
  @override
  String get couldntLoadBooking => "Couldn't load this booking.";
  @override
  String get startTime => 'Start time';
  @override
  String get gateQrUnavailable => "Gate QR codes aren't available yet.";
  @override
  String get gateQrCode => 'Gate QR code';
  @override
  String get scanToEnterOrExit => 'Scan to enter or exit the lot';
  @override
  String get extend => 'Extend';
  @override
  String get directions => 'Directions';
  @override
  String get cancelBookingButton => '✕  Cancel booking';
  @override
  String freeCancellationFor(int minutes, bool refund) =>
      "Free cancellation for $minutes more min${refund ? ' · full refund' : ''}";
  @override
  String get endParking => 'End parking';
  @override
  String freeCancellationEndedAt(String time) =>
      'Free cancellation ended at $time';
  @override
  String get receipt => 'Receipt';
  @override
  String get couldntLoadReceipt => "Couldn't load this receipt.";
  @override
  String get couldntCreatePdf => "Couldn't create the PDF.";
  @override
  String get parkingDetailsLabel => 'PARKING DETAILS';
  @override
  String get sessionLabel => 'SESSION';
  @override
  String get paymentLabel => 'PAYMENT';
  @override
  String get entry => 'Entry';
  @override
  String get bookedUntil => 'Booked until';
  @override
  String get exit => 'Exit';
  @override
  String get booked => 'Booked';
  @override
  String get subtotal => 'Subtotal';
  @override
  String get discount => 'Discount';
  @override
  String get tax => 'Tax';
  @override
  String get refunded => 'Refunded';
  @override
  String get downloadPdf => 'Download PDF';
  @override
  String get share => 'Share';
  @override
  String receiptHeadline(bool paid, String date) =>
      "${paid ? 'Paid' : 'Booked'} · $date";
  @override
  String get bookingCancelled => 'Booking cancelled';
  @override
  String get cancelledAndRefunded =>
      'Your booking has been cancelled\nand refunded to your wallet.';
  @override
  String get bookingWasCancelled => 'Your booking has been cancelled.';
  @override
  String get cancelledAt => 'Cancelled at';
  @override
  String get refundAmount => 'Refund amount';
  @override
  String get refundTo => 'Refund to';
  @override
  String get estimated => 'Estimated';
  @override
  String get instant => 'Instant';
  @override
  String get findAnotherSpot => 'Find another spot';
  @override
  String get extendParking => 'Extend parking';
  @override
  String get bookingExtended => 'Your booking has been extended.';
  @override
  String get notEnoughBalanceTopUp =>
      'Not enough balance. Top up your wallet first.';
  @override
  String get addExtraTime => 'ADD EXTRA TIME';
  @override
  String confirmExtension(String charge) => 'Confirm extension · $charge';
  @override
  String get currentBooking => 'CURRENT BOOKING';
  @override
  String get started => 'Started';
  @override
  String get endsAt => 'Ends at';
  @override
  String get elapsed => 'Elapsed';
  @override
  String hoursChip(int hours) => '$hours hr';
  @override
  String get newEndTime => 'New end time';
  @override
  String get extraCharge => 'Extra charge';
  @override
  String balance(String amount) => 'Balance: $amount';
  @override
  String balanceNotEnough(String amount) => 'Balance: $amount · not enough';
  @override
  String get myBookings => 'My bookings';
  @override
  String get couldntLoadBookings => "Couldn't load your bookings.";
  @override
  String get noActiveBooking => 'No active booking';
  @override
  String get noActiveBookingHint => 'Book a slot and it will show up here.';
  @override
  String get noPastBookings => 'No past bookings yet';
  @override
  String get noPastBookingsHint =>
      'Bookings you finished or cancelled show up here.';
  @override
  String get tabActive => 'Active';
  @override
  String get tabHistory => 'History';
  @override
  String get statusDone => 'Done';
  @override
  String get parkingEnded => 'Parking ended';
  @override
  String get slotFreeThanks =>
      'Your slot is free for the next driver.\nThanks for parking with ParkEasy.';
  @override
  String get parked => 'Parked';
  @override
  String get charged => 'Charged';
  @override
  String get payment => 'Payment';
  @override
  String get addVehicleToBook => 'Add a vehicle to book a slot.';
  @override
  String get notEnoughBalanceTapWallet =>
      'Not enough balance. Tap ParkEasy Wallet to top up.';
  @override
  String get bookingSummary => 'BOOKING SUMMARY';
  @override
  String get paymentMethod => 'PAYMENT METHOD';
  @override
  String balanceTapToTopUp(String amount) => 'Balance: $amount · tap to top up';
  @override
  String get addNewCard => 'Add new card';
  @override
  String confirmAndPay(String total) => 'Confirm & pay $total';
  @override
  String freeCancellationWithin(int minutes) =>
      'Free cancellation within $minutes min of the start';
  @override
  String get noFreeCancellation => "This lot doesn't offer free cancellation";
  @override
  String endedAt(String time) => 'Ended $time';
  @override
  String startedElapsed(String time, String elapsed) =>
      'Started $time · $elapsed elapsed';
  @override
  String get activeBooking => 'Active booking';
  @override
  String get completedBooking => 'Completed booking';
  @override
  String endedEarlyBooked(String time, String hours) =>
      'Ended early $time · $hours booked';
  @override
  String endedHours(String time, String hours) => 'Ended $time · $hours';
  @override
  String get cancelledBooking => 'Cancelled booking';
  @override
  String startedHours(String time, String hours) => 'Started $time · $hours';
  @override
  String get refundNoteCard =>
      "Free cancellation applies. This booking was paid by card, so there's nothing to refund to your wallet.";
  @override
  String refundNoteWallet(String amount) =>
      "Free cancellation applies. You'll get a full refund of $amount back to your ParkEasy Wallet right away.";
  @override
  String get cancelBookingQuestion => 'Cancel booking?';
  @override
  String cancelBookingConfirm(String lot, String slot) =>
      'Are you sure you want to cancel your booking at $lot, Slot $slot?';
  @override
  String get yesCancelBooking => '✕  Yes, cancel booking';
  @override
  String get keepMyBooking => 'Keep my booking';
  @override
  String get oneHourLess => 'One hour less';
  @override
  String get oneHourMore => 'One hour more';
  @override
  String parkedSoFar(String parked, String hours, String lot, String slot) =>
      "You've parked $parked of your $hours at\n$lot, Slot $slot.";
  @override
  String get endParkingQuestion => 'End parking now?';
  @override
  String endingEarlyNote(String amount) =>
      "Ending early isn't refunded: the full $amount stays charged. Your slot opens up for other drivers right away.";
  @override
  String get keepParking => 'Keep parking';
  @override
  String specialPrice(String label, String price) => '$label price: $price/hr';
  @override
  String dailyCapSaved(String amount) => 'Daily cap applied: you save $amount';
  @override
  String get addAVehicle => 'Add a vehicle';
  @override
  String get changeVehicle => 'Change vehicle';

  // ─── Wallet, top-ups and payment methods ───────────────────────────────────
  @override
  String topUpBetween(String min, String max) =>
      'Top up between $min and $max.';
  @override
  String get payWithFib => 'Pay with FIB';
  @override
  String get paymentCode => 'PAYMENT CODE';
  @override
  String get testBank => 'TEST BANK';
  @override
  String get approvePayment => 'Approve payment';
  @override
  String get declining => 'Declining…';
  @override
  String get decline => 'Decline';
  @override
  String get cancelling => 'Cancelling…';
  @override
  String get cancelTopUp => 'Cancel top-up';
  @override
  String get walletTopUp => 'Wallet top-up';
  @override
  String get topUpWaiting => 'Waiting';
  @override
  String get topUpPaid => 'Paid';
  @override
  String get topUpDeclined => 'Declined';
  @override
  String get topUpExpired => 'Expired';
  @override
  String get topUpCancelled => 'Cancelled';
  @override
  String get paymentCodeCopied => 'Payment code copied.';
  @override
  String get copyCode => 'Copy code';
  @override
  String enterCodeInFib(int minutes, String seconds) =>
      'Enter this code in the FIB app to pay. It expires in $minutes:$seconds.';
  @override
  String get testModeNote =>
      'Test mode: no real money moves. This stands in for the FIB app, so approve or decline the payment here as the customer would.';
  @override
  String get waitingForFib =>
      'Waiting for you to approve the payment in the FIB app…';
  @override
  String get walletToppedUp => 'Wallet topped up';
  @override
  String amountAdded(String amount) => '$amount was added to your wallet.';
  @override
  String get paymentDeclined => 'Payment declined';
  @override
  String get paymentDeclinedBody =>
      'The bank refused the payment, so your wallet was not charged.';
  @override
  String get paymentExpired => 'Payment expired';
  @override
  String get paymentExpiredBody =>
      'Nobody approved it in time. Start a new top-up to try again.';
  @override
  String get topUpCancelledTitle => 'Top-up cancelled';
  @override
  String get nothingCharged => 'Nothing was charged.';
  @override
  String get backToWallet => 'Back to wallet';
  @override
  String topUpAmountButton(String amount) => 'Top up $amount';
  @override
  String get topUp => 'Top up';
  @override
  String get withdrawalsUnavailable => "Withdrawals aren't available yet.";
  @override
  String get topUpAmountLabel => 'TOP UP AMOUNT';
  @override
  String get recentTransactions => 'RECENT TRANSACTIONS';
  @override
  String get transactionsEmpty => 'Top-ups, payments and refunds show up here.';
  @override
  String get availableBalance => 'Available balance';
  @override
  String get topUpChip => '+ Top up';
  @override
  String get withdrawChip => '↑ Withdraw';
  @override
  String get firstIraqiBank => 'First Iraqi Bank (FIB)';
  @override
  String get approveInFib => 'Approve the payment in the FIB app';
  @override
  String get paymentMethods => 'Payment methods';
  @override
  String get walletLabel => 'WALLET';
  @override
  String get addMoneyWith => 'ADD MONEY WITH';
  @override
  String get cardsLabel => 'CARDS';
  @override
  String get addNewCardRow => 'Add a new card';
  @override
  String get cardsUnavailable =>
      "Paying by card isn't available yet. Top up your wallet with FIB instead.";
  @override
  String get paysForBookings => 'Pays for bookings and extensions';
  @override
  String get comingSoon => 'Coming soon';

  // ─── Profile, vehicles and app language ────────────────────────────────────
  @override
  String get signOutQuestion => 'Sign out?';
  @override
  String get signOutMessage =>
      'You can sign back in any time with your email and password.';
  @override
  String get signOut => 'Sign out';
  @override
  String get couldntLoadProfile => "Couldn't load your profile.";
  @override
  String get profile => 'Profile';
  @override
  String get account => 'Account';
  @override
  String get personalDetails => 'Personal details';
  @override
  String get personalDetailsHint => 'Name, email, phone and birthday';
  @override
  String get myVehicles => 'My vehicles';
  @override
  String get myVehiclesHint => 'Add your cars and pick a default';
  @override
  String get changePassword => 'Change password';
  @override
  String get preferences => 'Preferences';
  @override
  String get darkMode => 'Dark mode';
  @override
  String get more => 'More';
  @override
  String get wallet => 'Wallet';
  @override
  String get helpAndSupport => 'Help & support';
  @override
  String get deleteAccount => 'Delete account';
  @override
  String get appLanguage => 'App language';
  @override
  String get appLanguageNote =>
      'Choose the language for the app and its messages. Kurdish reads right to left.';
  @override
  String get currentLanguageName => 'English';
  @override
  String languageHint(String code) =>
      code == 'ckb' ? 'Kurdish (Sorani)' : 'English';
  @override
  String get dateOfBirth => 'Date of birth';
  @override
  String get profileUpdated => 'Your profile has been updated.';
  @override
  String get couldntSaveChanges => "Couldn't save your changes.";
  @override
  String get fullName => 'Full name';
  @override
  String get fullNameHint => 'Dilan Karimi';
  @override
  String get phoneHint => '+964 750 123 4567';
  @override
  String get dateOfBirthOptional => 'Date of birth (optional)';
  @override
  String get notSet => 'Not set';
  @override
  String get editProfile => 'Edit profile';
  @override
  String get passwordChanged => 'Your password has been changed.';
  @override
  String get couldntChangePassword => "Couldn't change your password.";
  @override
  String get changePasswordRules =>
      'Use at least 8 characters with an uppercase and a lowercase letter, a number and a symbol.';
  @override
  String get currentPassword => 'Current password';
  @override
  String get chooseDifferentPassword => 'Choose a different password';
  @override
  String get updatePassword => 'Update password';
  @override
  String get deleteAccountQuestion => 'Delete your account?';
  @override
  String get cantBeUndone => "This can't be undone.";
  @override
  String get accountDeleted => 'Your account has been deleted.';
  @override
  String get couldntDeleteAccount => "Couldn't delete your account.";
  @override
  String get deleteAccountWarning =>
      'Your profile, your vehicles and your saved details will be removed and you will be signed out. Past bookings are kept for our records. This cannot be undone.';
  @override
  String get enterPasswordToConfirm => 'Enter your password to confirm';
  @override
  String get deleteMyAccount => 'Delete my account';
  @override
  String get keepMyAccount => 'Keep my account';
  @override
  String get vehicleSedan => 'Sedan';
  @override
  String get vehicleSuv => 'SUV';
  @override
  String get vehicleTruck => 'Truck';
  @override
  String nowDefaultVehicle(String name) => '$name is now your default vehicle.';
  @override
  String vehicleRemoved(String name) => '$name was removed.';
  @override
  String deleteVehicleQuestion(String name) => 'Delete $name?';
  @override
  String plateWillBeRemoved(String plate) =>
      'Plate $plate will be removed from your account.';
  @override
  String get addVehicle => 'Add vehicle';
  @override
  String get couldntLoadVehicles => "Couldn't load your vehicles.";
  @override
  String get addAnotherVehicle => 'Add another vehicle';
  @override
  String get noVehiclesYet => 'No vehicles yet';
  @override
  String get noVehiclesHint =>
      'Add your car so you can book a parking spot in one tap.';
  @override
  String get vehicleUpdated => 'Vehicle updated.';
  @override
  String get vehicleAdded => 'Vehicle added.';
  @override
  String get addYourVehicle => 'Add your vehicle';
  @override
  String get editVehicle => 'Edit vehicle';
  @override
  String get couldntSaveVehicle => "Couldn't save the vehicle.";
  @override
  String get addVehicleIntro =>
      'Add the car you park most often. You can add more, or change it, later in your profile.';
  @override
  String get brand => 'Brand';
  @override
  String get brandHint => 'Toyota';
  @override
  String get model => 'Model';
  @override
  String get modelHint => 'Camry';
  @override
  String get color => 'Color';
  @override
  String get colorHint => 'Silver';
  @override
  String get licensePlate => 'License plate';
  @override
  String get plateHint => '22 SUL 12345';
  @override
  String get vehicleTypeLabel => 'Type';
  @override
  String get saveVehicle => 'Save vehicle';
  @override
  String get year => 'Year';
  @override
  String get defaultBadge => 'Default';
  @override
  String get makeDefault => 'Make default';

  // ─── Notifications ─────────────────────────────────────────────────────────
  @override
  String get couldntLoadNotificationSettings =>
      "Couldn't load your notification settings.";
  @override
  String get bookingReminders => 'Booking reminders';
  @override
  String get bookingRemindersHint => '15 min before booking';
  @override
  String get expiryAlerts => 'Expiry alerts';
  @override
  String get expiryAlertsHint => '15 min before your time is up';
  @override
  String get offers => 'Offers & promotions';
  @override
  String get offersHint => 'Deals near you';
  @override
  String get loyaltyRewards => 'Loyalty rewards';
  @override
  String get loyaltyRewardsHint => 'Progress & unlocked perks';
  @override
  String get bookingReceipts => 'Booking receipts';
  @override
  String get bookingReceiptsHint => 'After each session ends';
  @override
  String get newsletter => 'Newsletter';
  @override
  String get newsletterHint => 'Monthly updates';
  @override
  String get inAppNotifications => 'IN-APP NOTIFICATIONS';
  @override
  String get emailNotifications => 'EMAIL NOTIFICATIONS';
  @override
  String withComingSoon(String text) => '$text · Coming soon';
  @override
  String get markAllRead => 'Mark all read';
  @override
  String get couldntLoadNotifications => "Couldn't load your notifications.";
  @override
  String get bookingUpdatesHere => 'Updates about your bookings show up here.';
  @override
  String get walletUpdatesHere => 'Wallet top-ups show up here.';
  @override
  String get allUpdatesHere => 'Booking and wallet updates show up here.';
  @override
  String get noNotificationsYet => 'No notifications yet';
  @override
  String get unread => 'Unread';
  @override
  String get tabAll => 'All';
  @override
  String get tabBookings => 'Bookings';
  @override
  String get tabWallet => 'Wallet';

  // ─── Help, QR scanning and placeholders ────────────────────────────────────
  @override
  String noEmailAppCopied(String email) => 'No email app found. Copied $email.';
  @override
  String get couldntOpenDocs => "Couldn't open the documentation.";
  @override
  String get contactUs => 'CONTACT US';
  @override
  String get liveChat => 'Live chat';
  @override
  String get liveChatUnavailable =>
      "Live chat isn't available yet. Email us instead.";
  @override
  String get emailUs => 'Email us';
  @override
  String get replyIn24h => 'Reply in 24h';
  @override
  String get faqsLabel => 'FAQS';
  @override
  String get viewDocumentation => 'View full documentation';
  @override
  String get supportEmailSubject => 'ParkEasy support';
  @override
  String get faqCancelQ => 'How do I cancel a booking?';
  @override
  String get faqCancelA =>
      "Go to My bookings, tap the booking, and select Cancel booking. You can cancel for a full refund within 10 minutes of the start (some lots give longer: Payment shows it). After that, tap End parking to leave early; the booked time isn't refunded.";
  @override
  String get faqExtendQ => 'Can I extend my parking time?';
  @override
  String get faqExtendA =>
      "Yes. While a booking is active, open it and tap Extend. The extra hours are paid from your wallet at the prices you booked with, up to 24 hours in total, as long as the lot is open. Hours on a day that already reached the lot's daily cap cost nothing.";
  @override
  String get faqPricesQ => 'How are prices worked out?';
  @override
  String get faqPricesA =>
      "Every started hour is charged at the lot's hourly price. Some lots have a daily cap: however long you stay, one day never costs more. On special days, like Eid or Newroz, a lot can set a different price; the lot page shows it. Payment always shows the exact total before you pay.";
  @override
  String get faqTakenQ => 'What if the spot is already taken?';
  @override
  String get faqTakenA =>
      'Your slot is reserved for you from the moment you book. If someone is parked in it anyway, cancel while free cancellation is still open (the booking shows how long) and book another slot, then email us with your receipt number.';
  @override
  String get faqQrQ => 'How does the QR code work?';
  @override
  String get faqQrA =>
      'Each garage has a ParkEasy QR code at its entrance. Tap the scan button on the home screen and point the camera at it: the garage opens, ready to pick a slot and book.';
  @override
  String get notAParkEasyCode => "That isn't a ParkEasy parking code.";
  @override
  String get turnOffLight => 'Turn off the light';
  @override
  String get turnOnLight => 'Turn on the light';
  @override
  String get pointAtQr => 'Point at the QR code at the parking entrance';
  @override
  String get enterLotCode => 'Enter lot code';
  @override
  String get cameraOff => 'Camera access is off for ParkEasy.';
  @override
  String get cameraUnavailable => "The camera isn't available on this device.";
  @override
  String get openSettings => 'Open Settings';
  @override
  String get enterLotCodeInstead => 'Enter lot code instead';
  @override
  String get enterNumberUnderQr => 'Enter the number under the QR code.';
  @override
  String get openButton => 'Open';

  // ─── Right to left ─────────────────────────────────────────────────────────
}
