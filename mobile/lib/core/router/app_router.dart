import 'package:flutter/material.dart';
import 'package:mobile/feature/auth/presentation/screens/splash_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/login_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/register_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/forgot_password_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/otp_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/reset_password_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/location_permission_screen.dart';
import 'package:mobile/feature/stub/stub_screen.dart';

class AppRouter {
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
  static const String myVehicles = '/my-vehicles';
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
        return _route(const SplashScreen());
      case login:
        return _route(const LoginScreen());
      case register:
        return _route(const RegisterScreen());
      case forgotPassword:
        return _route(const ForgotPasswordScreen());
      case otp:
        final email = settings.arguments as String? ?? '';
        return _route(OtpScreen(email: email));
      case resetPassword:
        final token = settings.arguments as String? ?? '';
        return _route(ResetPasswordScreen(token: token));
      case resetPasswordSuccess:
        return _route(const ResetPasswordSuccessScreen());
      case locationPermission:
        return _route(const LocationPermissionScreen());
      case vehicleSetup:
        return _route(StubScreen(routeName: 'VehicleSetupScreen'));

      // All remaining screens are stubs — will be replaced as features are built
      default:
        return _route(StubScreen(routeName: settings.name ?? 'unknown'));
    }
  }

  static MaterialPageRoute _route(Widget screen) =>
      MaterialPageRoute(builder: (_) => screen);

  // ─── Navigation helpers ─────────────────────────────────────────────────────
  static void toLogin(BuildContext context) =>
      Navigator.pushReplacementNamed(context, login);

  static void toRegister(BuildContext context) =>
      Navigator.pushNamed(context, register);

  static void toHome(BuildContext context) =>
      Navigator.pushReplacementNamed(context, home);

  static void toForgotPassword(BuildContext context) =>
      Navigator.pushNamed(context, forgotPassword);

  static void toOtp(BuildContext context, String email) =>
      Navigator.pushNamed(context, otp, arguments: email);

  static void toResetPassword(BuildContext context, String token) =>
      Navigator.pushNamed(context, resetPassword, arguments: token);

  static void toLocationPermission(BuildContext context) =>
      Navigator.pushReplacementNamed(context, locationPermission);

  static void toVehicleSetup(BuildContext context) =>
      Navigator.pushNamed(context, vehicleSetup);

  static void toMap(BuildContext context) => Navigator.pushNamed(context, map);

  static void toSearchResults(BuildContext context, String query) =>
      Navigator.pushNamed(context, searchResults, arguments: query);

  static void toParkingDetails(BuildContext context, String parkingId) =>
      Navigator.pushNamed(context, parkingDetails, arguments: parkingId);

  static void toPayment(BuildContext context, Map<String, dynamic> args) =>
      Navigator.pushNamed(context, payment, arguments: args);

  static void toBookingConfirmation(BuildContext context, String bookingId) =>
      Navigator.pushReplacementNamed(
        context,
        bookingConfirmation,
        arguments: bookingId,
      );

  static void toMyBookings(BuildContext context) =>
      Navigator.pushNamed(context, myBookings);

  static void toBookingDetail(BuildContext context, String bookingId) =>
      Navigator.pushNamed(context, bookingDetail, arguments: bookingId);

  static void toExtendParking(BuildContext context, String bookingId) =>
      Navigator.pushNamed(context, extendParking, arguments: bookingId);

  static void toCancelConfirmation(BuildContext context, String bookingId) =>
      Navigator.pushNamed(context, cancelConfirmation, arguments: bookingId);

  static void toProfile(BuildContext context) =>
      Navigator.pushNamed(context, profile);

  static void toEditProfile(BuildContext context) =>
      Navigator.pushNamed(context, editProfile);

  static void toPaymentMethods(BuildContext context) =>
      Navigator.pushNamed(context, paymentMethods);

  static void toWallet(BuildContext context) =>
      Navigator.pushNamed(context, wallet);

  static void toMyVehicles(BuildContext context) =>
      Navigator.pushNamed(context, myVehicles);

  static void toNotificationSettings(BuildContext context) =>
      Navigator.pushNamed(context, notificationSettings);

  static void toHelpSupport(BuildContext context) =>
      Navigator.pushNamed(context, helpSupport);

  static void toChangePassword(BuildContext context) =>
      Navigator.pushNamed(context, changePassword);

  static void toDeleteAccount(BuildContext context) =>
      Navigator.pushNamed(context, deleteAccount);

  static void toNotificationsInbox(BuildContext context) =>
      Navigator.pushNamed(context, notificationsInbox);
}
