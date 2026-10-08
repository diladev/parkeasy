import 'package:flutter/material.dart';
import 'package:mobile/feature/auth/presentation/screens/splash_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/login_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/register_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/forgot_password_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/otp_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/reset_password_screen.dart';
import 'package:mobile/feature/auth/presentation/screens/location_permission_screen.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';
import 'package:mobile/feature/profile/presentation/screens/change_password_screen.dart';
import 'package:mobile/feature/profile/presentation/screens/delete_account_screen.dart';
import 'package:mobile/feature/profile/presentation/screens/edit_profile_screen.dart';
import 'package:mobile/feature/profile/presentation/screens/my_vehicles_screen.dart';
import 'package:mobile/feature/profile/presentation/screens/profile_screen.dart';
import 'package:mobile/feature/profile/presentation/screens/vehicle_form_screen.dart';
import 'package:mobile/feature/shell/main_shell.dart';
import 'package:mobile/feature/stub/stub_screen.dart';

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
        return _route(const MainShell(), settings);

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
  static void toHome(BuildContext context) =>
      Navigator.pushNamedAndRemoveUntil(context, home, (_) => false);

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

  static void toNotificationsInbox(BuildContext context) =>
      Navigator.pushNamed(context, notificationsInbox);
}
