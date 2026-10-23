import 'package:flutter/material.dart';
import 'package:mobile/feature/auth/presentation/screens/splash_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/login_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/register_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/forgot_password_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/otp_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/reset_password_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/location_permission_screen.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/domain/entities/booking_draft.dart';
import 'package:mobile/feature/booking/domain/entities/cancellation.dart';
import 'package:mobile/feature/booking/presentation/screens/booking_confirmation_screen.dart';
import 'package:mobile/feature/booking/presentation/screens/booking_detail_screen.dart';
import 'package:mobile/feature/booking/presentation/screens/booking_receipt_screen.dart';
import 'package:mobile/feature/booking/presentation/screens/cancellation_success_screen.dart';
import 'package:mobile/feature/booking/presentation/screens/extend_booking_screen.dart';
import 'package:mobile/feature/booking/presentation/screens/my_bookings_screen.dart';
import 'package:mobile/feature/booking/presentation/screens/payment_screen.dart';
import 'package:mobile/feature/directions/presentation/screens/directions_screen.dart';
import 'package:mobile/feature/notifications/presentation/screens/notification_settings_screen.dart';
import 'package:mobile/feature/notifications/presentation/screens/notifications_screen.dart';
import 'package:mobile/feature/parking/presentation/screens/parking_details_screen.dart';
import 'package:mobile/feature/parking/presentation/screens/search_screen.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';
import 'package:mobile/feature/profile/presentation/screens/change_password_screen.dart';
import 'package:mobile/feature/profile/presentation/screens/delete_account_screen.dart';
import 'package:mobile/feature/profile/presentation/screens/edit_profile_screen.dart';
import 'package:mobile/feature/profile/presentation/screens/my_vehicles_screen.dart';
import 'package:mobile/feature/profile/presentation/screens/profile_screen.dart';
import 'package:mobile/feature/profile/presentation/screens/vehicle_form_screen.dart';
import 'package:mobile/feature/shell/main_shell.dart';
import 'package:mobile/feature/stub/stub_screen.dart';
import 'package:mobile/feature/wallet/domain/entities/top_up.dart';
import 'package:mobile/feature/wallet/presentation/screens/top_up_payment_screen.dart';
import 'package:mobile/feature/wallet/presentation/screens/wallet_screen.dart';

/// Which lot Get directions is for.
typedef DirectionsArgs = ({int lotId, String? slotLabel});

/// What the search screen opens with.
typedef SearchArgs = ({String query, bool openFilters});

class AppRouter {
  /// Lets code outside the widget tree navigate, e.g. back to the login
  /// screen when the session expires (see main.dart).
  static final GlobalKey<NavigatorState> navigatorKey =
      GlobalKey<NavigatorState>();

  // ─── Route names ────────────────────────────────────────────────────────────
  static const String initial = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';
  static const String otp = '/otp';
  static const String resetPassword = '/reset-password';
  static const String resetPasswordSuccess = '/reset-password-success';
  static const String locationPermission = '/location-permission';
  static const String vehicleSetup = '/vehicle-setup';

  static const String home = '/home';
  static const String map = '/map';
  static const String searchResults = '/search-results';
  static const String parkingDetails = '/parking-details';
  static const String scanQr = '/scan-qr';
  static const String favorites = '/favorites';

  static const String payment = '/payment';
  static const String bookingConfirmation = '/booking-confirmation';
  static const String myBookings = '/my-bookings';
  static const String bookingDetail = '/booking-detail';
  static const String extendParking = '/extend-parking';
  static const String cancelConfirmation = '/cancel-confirmation';
  static const String cancellationSuccess = '/cancellation-success';
  static const String bookingReceipt = '/booking-receipt';
  static const String directions = '/directions';

  static const String profile = '/profile';
  static const String editProfile = '/edit-profile';
  static const String paymentMethods = '/payment-methods';
  static const String wallet = '/wallet';
  static const String topUpPayment = '/top-up-payment';
  static const String myVehicles = '/my-vehicles';
  static const String vehicleForm = '/vehicle-form';
  static const String notificationSettings = '/notification-settings';
  static const String helpSupport = '/help-support';
  static const String changePassword = '/change-password';
  static const String deleteAccount = '/delete-account';
  static const String notificationsInbox = '/notifications-inbox';

  // ─── Route generator ────────────────────────────────────────────────────────
  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      // Auth
      case initial:
        return _route(const SplashScreen(), settings);
      case login:
        return _route(const LoginScreen(), settings);
      case register:
        return _route(const RegisterScreen(), settings);
      case forgotPassword:
        return _route(const ForgotPasswordScreen(), settings);
      case otp:
        final email = settings.arguments as String? ?? '';
        return _route(OtpScreen(email: email), settings);
      case resetPassword:
        final token = settings.arguments as String? ?? '';
        return _route(ResetPasswordScreen(token: token), settings);
      case resetPasswordSuccess:
        return _route(const ResetPasswordSuccessScreen(), settings);
      case locationPermission:
        return _route(const LocationPermissionScreen(), settings);
      case vehicleSetup:
        // Step 3 of sign-up: the same form as "Add vehicle", with a Skip button.
        return _route(const VehicleFormScreen(isOnboarding: true), settings);

      // Main app: the bottom-navigation shell.
      case home:
        final tab = settings.arguments as int? ?? 0;
        return _route(MainShell(initialIndex: tab), settings);

      // Notifications
      case notificationsInbox:
        return _route(const NotificationsScreen(), settings);
      case notificationSettings:
        return _route(const NotificationSettingsScreen(), settings);

      // Parking
      case searchResults:
        final args = settings.arguments as SearchArgs?;
        return _route(
          SearchScreen(
            initialQuery: args?.query ?? '',
            openFilters: args?.openFilters ?? false,
          ),
          settings,
        );
      case parkingDetails:
        final lotId = settings.arguments as int;
        return _route(ParkingDetailsScreen(lotId: lotId), settings);

      // Booking
      case payment:
        final draft = settings.arguments as BookingDraft;
        return _route(PaymentScreen(draft: draft), settings);
      case bookingConfirmation:
        final booking = settings.arguments as Booking;
        return _route(BookingConfirmationScreen(booking: booking), settings);
      case myBookings:
        return _route(const MyBookingsScreen(), settings);
      case bookingDetail:
        final bookingId = int.parse(settings.arguments as String);
        return _route(BookingDetailScreen(bookingId: bookingId), settings);
      case bookingReceipt:
        final bookingId = settings.arguments as int;
        return _route(BookingReceiptScreen(bookingId: bookingId), settings);
      case extendParking:
        final booking = settings.arguments as Booking;
        return _route(ExtendBookingScreen(booking: booking), settings);
      case directions:
        final args = settings.arguments as DirectionsArgs;
        return _route(
          DirectionsScreen(lotId: args.lotId, slotLabel: args.slotLabel),
          settings,
        );
      case cancellationSuccess:
        final cancellation = settings.arguments as Cancellation;
        return _route(
          CancellationSuccessScreen(cancellation: cancellation),
          settings,
        );

      // Profile
      case profile:
        return _route(const ProfileScreen(), settings);
      case editProfile:
        return _route(const EditProfileScreen(), settings);
      case changePassword:
        return _route(const ChangePasswordScreen(), settings);
      case deleteAccount:
        return _route(const DeleteAccountScreen(), settings);
      case myVehicles:
        return _route(const MyVehiclesScreen(), settings);
      case vehicleForm:
        final vehicle = settings.arguments as Vehicle?;
        // Typed <Vehicle> because toVehicleForm awaits a Vehicle result:
        // Navigator casts the route to Route<Vehicle?>, and a
        // MaterialPageRoute<dynamic> would fail that cast at runtime.
        return _route<Vehicle>(VehicleFormScreen(vehicle: vehicle), settings);

      // Wallet
      case wallet:
        return _route(const WalletScreen(), settings);
      case topUpPayment:
        final topUp = settings.arguments as TopUp;
        // Typed <bool>: toTopUpPayment awaits whether it was paid.
        return _route<bool>(TopUpPaymentScreen(topUp: topUp), settings);

      // All remaining screens are stubs — will be replaced as features are built
      default:
        return _route(
          StubScreen(routeName: settings.name ?? 'unknown'),
          settings,
        );
    }
  }

  // The settings are passed on so ModalRoute.of(context) knows the route name.
  static MaterialPageRoute<T> _route<T>(
    Widget screen,
    RouteSettings settings,
  ) => MaterialPageRoute<T>(builder: (_) => screen, settings: settings);

  // ─── Navigation helpers ─────────────────────────────────────────────────────
  static void toLogin(BuildContext context) =>
      Navigator.pushReplacementNamed(context, login);

  static void toRegister(BuildContext context) =>
      Navigator.pushNamed(context, register);

  /// Clears the stack: after this, Back leaves the app instead of returning
  /// to the auth screens.
  /// Opens on [tab], e.g. [mapTab].
  static void toHome(BuildContext context, {int tab = 0}) =>
      Navigator.pushNamedAndRemoveUntil(
        context,
        home,
        (_) => false,
        arguments: tab,
      );

  static const int mapTab = MainShell.mapTab;

  static void toForgotPassword(BuildContext context) =>
      Navigator.pushNamed(context, forgotPassword);

  static void toOtp(BuildContext context, String email) =>
      Navigator.pushNamed(context, otp, arguments: email);

  static void toResetPassword(BuildContext context, String token) =>
      Navigator.pushNamed(context, resetPassword, arguments: token);

  static void toLocationPermission(BuildContext context) =>
      Navigator.pushNamedAndRemoveUntil(
        context,
        locationPermission,
        (_) => false,
      );

  /// Right after sign-up. Clears the stack, so Back can't return to the
  /// sign-up form of an account that already exists.
  static void toVehicleSetup(BuildContext context) =>
      Navigator.pushNamedAndRemoveUntil(context, vehicleSetup, (_) => false);

  static void toMap(BuildContext context) => Navigator.pushNamed(context, map);

  /// [openFilters] opens the Filters sheet on arrival.
  static void toSearchResults(
    BuildContext context,
    String query, {
    bool openFilters = false,
  }) => Navigator.pushNamed(
    context,
    searchResults,
    arguments: (query: query, openFilters: openFilters),
  );

  static void toParkingDetails(BuildContext context, int lotId) =>
      Navigator.pushNamed(context, parkingDetails, arguments: lotId);

  static void toScanQr(BuildContext context) =>
      Navigator.pushNamed(context, scanQr);

  static void toFavorites(BuildContext context) =>
      Navigator.pushNamed(context, favorites);

  static void toPayment(BuildContext context, BookingDraft draft) =>
      Navigator.pushNamed(context, payment, arguments: draft);

  /// Replaces the booking screens (details, payment) with the confirmation,
  /// so back doesn't return to a payment that's already done.
  static void toBookingConfirmation(BuildContext context, Booking booking) =>
      Navigator.pushNamedAndRemoveUntil(
        context,
        bookingConfirmation,
        (route) => route.isFirst,
        arguments: booking,
      );

  static void toMyBookings(BuildContext context) =>
      Navigator.pushNamed(context, myBookings);

  /// Completes when the user comes back, so the caller can reload.
  static Future<void> toBookingDetail(BuildContext context, String bookingId) =>
      Navigator.pushNamed(context, bookingDetail, arguments: bookingId);

  static void toBookingReceipt(BuildContext context, int bookingId) =>
      Navigator.pushNamed(context, bookingReceipt, arguments: bookingId);

  static Future<void> toExtendParking(BuildContext context, Booking booking) =>
      Navigator.pushNamed(context, extendParking, arguments: booking);

  /// Replaces the booking screens with the cancellation result, so back
  /// doesn't return to a booking that no longer exists.
  static void toCancellationSuccess(
    BuildContext context,
    Cancellation cancellation,
  ) => Navigator.pushNamedAndRemoveUntil(
    context,
    cancellationSuccess,
    (route) => route.isFirst,
    arguments: cancellation,
  );

  /// [slotLabel] ("Slot A04") when coming from a booking.
  static void toDirections(
    BuildContext context,
    int lotId, {
    String? slotLabel,
  }) => Navigator.pushNamed(
    context,
    directions,
    arguments: (lotId: lotId, slotLabel: slotLabel),
  );

  static void toProfile(BuildContext context) =>
      Navigator.pushNamed(context, profile);

  static void toEditProfile(BuildContext context) =>
      Navigator.pushNamed(context, editProfile);

  static void toPaymentMethods(BuildContext context) =>
      Navigator.pushNamed(context, paymentMethods);

  /// Completes when the user comes back, so the caller can reload the balance.
  static Future<void> toWallet(BuildContext context) =>
      Navigator.pushNamed(context, wallet);

  /// Completes with true if the top-up was paid.
  static Future<bool?> toTopUpPayment(BuildContext context, TopUp topUp) =>
      Navigator.pushNamed<bool>(context, topUpPayment, arguments: topUp);

  static void toMyVehicles(BuildContext context) =>
      Navigator.pushNamed(context, myVehicles);

  /// Opens the vehicle form: adds a vehicle, or edits [vehicle].
  /// Completes with the saved vehicle, or null if the user went back.
  static Future<Vehicle?> toVehicleForm(
    BuildContext context, {
    Vehicle? vehicle,
  }) => Navigator.pushNamed<Vehicle>(context, vehicleForm, arguments: vehicle);

  static void toNotificationSettings(BuildContext context) =>
      Navigator.pushNamed(context, notificationSettings);

  static void toHelpSupport(BuildContext context) =>
      Navigator.pushNamed(context, helpSupport);

  static void toChangePassword(BuildContext context) =>
      Navigator.pushNamed(context, changePassword);

  static void toDeleteAccount(BuildContext context) =>
      Navigator.pushNamed(context, deleteAccount);

  /// Completes when the user comes back, so the bell's dot can be updated.
  static Future<void> toNotificationsInbox(BuildContext context) =>
      Navigator.pushNamed(context, notificationsInbox);
}
