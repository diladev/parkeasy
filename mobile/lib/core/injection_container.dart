import 'package:get_it/get_it.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'package:mobile/core/connection/cubit/connectivity_cubit.dart';
import 'package:mobile/core/locale/app_language.dart';
import 'package:mobile/core/network/api_client.dart';
import 'package:mobile/core/network/token_provider.dart';
import 'package:mobile/core/service/connectivity_service.dart';
import 'package:mobile/core/theme/theme_cubit.dart';
import 'package:mobile/feature/auth/data/repositories/auth_local_data_source.dart';
import 'package:mobile/feature/auth/data/repositories/auth_remote_data_source.dart';
import 'package:mobile/feature/auth/data/repositories/auth_repository_implementation.dart';
import 'package:mobile/feature/auth/data/repositories/auth_token_provider.dart';
import 'package:mobile/feature/auth/domain/repositories/auth_repository.dart';
import 'package:mobile/feature/auth/domain/usecases/clear_session.dart';
import 'package:mobile/feature/auth/domain/usecases/forgot_password.dart';
import 'package:mobile/feature/auth/domain/usecases/reset_password.dart';
import 'package:mobile/feature/auth/domain/usecases/user_login.dart';
import 'package:mobile/feature/auth/domain/usecases/user_logout.dart';
import 'package:mobile/feature/auth/domain/usecases/user_register.dart';
import 'package:mobile/feature/auth/domain/usecases/verify_otp.dart';
import 'package:mobile/feature/auth/presentation/bloc/auth_bloc.dart';
import 'package:mobile/feature/booking/data/repositories/booking_remote_data_source.dart';
import 'package:mobile/feature/booking/data/repositories/booking_repository_implementation.dart';
import 'package:mobile/feature/booking/domain/entities/booking_draft.dart';
import 'package:mobile/feature/booking/domain/repositories/booking_repository.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/domain/usecases/cancel_booking.dart';
import 'package:mobile/feature/booking/domain/usecases/create_booking.dart';
import 'package:mobile/feature/booking/domain/usecases/extend_booking.dart';
import 'package:mobile/feature/booking/domain/usecases/get_booking.dart';
import 'package:mobile/feature/booking/domain/usecases/get_booking_receipt.dart';
import 'package:mobile/feature/booking/domain/usecases/get_bookings.dart';
import 'package:mobile/feature/booking/domain/usecases/get_wallet_balance.dart';
import 'package:mobile/feature/booking/presentation/cubit/booking_detail_cubit.dart';
import 'package:mobile/feature/booking/presentation/cubit/booking_receipt_cubit.dart';
import 'package:mobile/feature/booking/presentation/cubit/cancel_booking_cubit.dart';
import 'package:mobile/feature/booking/presentation/cubit/extend_booking_cubit.dart';
import 'package:mobile/feature/booking/presentation/cubit/my_bookings_cubit.dart';
import 'package:mobile/feature/booking/presentation/cubit/payment_cubit.dart';
import 'package:mobile/feature/home/data/repositories/home_remote_data_source.dart';
import 'package:mobile/feature/home/data/repositories/home_repository_implementation.dart';
import 'package:mobile/feature/home/domain/repositories/home_repository.dart';
import 'package:mobile/feature/home/domain/usecases/get_my_bookings.dart';
import 'package:mobile/feature/home/domain/usecases/get_nearby_lots.dart';
import 'package:mobile/feature/home/domain/usecases/get_unread_notification_count.dart';
import 'package:mobile/feature/home/presentation/cubit/home_cubit.dart';
import 'package:mobile/feature/notifications/data/repositories/notification_remote_data_source.dart';
import 'package:mobile/feature/notifications/data/repositories/notification_repository_implementation.dart';
import 'package:mobile/feature/notifications/domain/repositories/notification_repository.dart';
import 'package:mobile/feature/notifications/domain/usecases/get_notification_settings.dart';
import 'package:mobile/feature/notifications/domain/usecases/get_notifications.dart';
import 'package:mobile/feature/notifications/domain/usecases/update_notification_setting.dart';
import 'package:mobile/feature/notifications/domain/usecases/mark_all_notifications_read.dart';
import 'package:mobile/feature/notifications/domain/usecases/mark_notification_read.dart';
import 'package:mobile/feature/notifications/presentation/cubit/notification_settings_cubit.dart';
import 'package:mobile/feature/notifications/presentation/cubit/notifications_cubit.dart';
import 'package:mobile/feature/parking/data/repositories/parking_remote_data_source.dart';
import 'package:mobile/feature/parking/data/repositories/parking_repository_implementation.dart';
import 'package:mobile/feature/parking/domain/repositories/parking_repository.dart';
import 'package:mobile/feature/directions/data/directions_repository_implementation.dart';
import 'package:mobile/feature/directions/domain/repositories/directions_repository.dart';
import 'package:mobile/feature/directions/domain/usecases/open_directions.dart';
import 'package:mobile/feature/directions/presentation/cubit/directions_cubit.dart';
import 'package:mobile/feature/location/data/repositories/location_repository_implementation.dart';
import 'package:mobile/feature/location/domain/repositories/location_repository.dart';
import 'package:mobile/feature/location/domain/usecases/get_current_location.dart';
import 'package:mobile/feature/location/presentation/cubit/location_cubit.dart';
import 'package:mobile/feature/map/presentation/cubit/map_cubit.dart';
import 'package:mobile/feature/parking/domain/usecases/get_parking_lot_details.dart';
import 'package:mobile/feature/parking/domain/usecases/search_parking_lots.dart';
import 'package:mobile/feature/parking/presentation/cubit/parking_details_cubit.dart';
import 'package:mobile/feature/parking/presentation/cubit/search_cubit.dart';
import 'package:mobile/feature/profile/data/repositories/profile_local_data_source.dart';
import 'package:mobile/feature/profile/data/repositories/profile_remote_data_source.dart';
import 'package:mobile/feature/profile/data/repositories/profile_repository_implementation.dart';
import 'package:mobile/feature/profile/domain/repositories/profile_repository.dart';
import 'package:mobile/feature/profile/domain/usecases/add_vehicle.dart';
import 'package:mobile/feature/profile/domain/usecases/change_password.dart';
import 'package:mobile/feature/profile/domain/usecases/delete_account.dart';
import 'package:mobile/feature/profile/domain/usecases/delete_vehicle.dart';
import 'package:mobile/feature/profile/domain/usecases/get_profile.dart';
import 'package:mobile/feature/profile/domain/usecases/get_vehicles.dart';
import 'package:mobile/feature/profile/domain/usecases/set_default_vehicle.dart';
import 'package:mobile/feature/profile/domain/usecases/update_profile.dart';
import 'package:mobile/feature/profile/domain/usecases/update_vehicle.dart';
import 'package:mobile/feature/profile/presentation/bloc/profile_bloc.dart';
import 'package:mobile/feature/profile/presentation/cubit/change_password_cubit.dart';
import 'package:mobile/feature/profile/presentation/cubit/delete_account_cubit.dart';
import 'package:mobile/feature/profile/presentation/cubit/edit_profile_cubit.dart';
import 'package:mobile/feature/profile/presentation/cubit/vehicle_form_cubit.dart';
import 'package:mobile/feature/profile/presentation/cubit/vehicles_cubit.dart';
import 'package:mobile/feature/wallet/data/repositories/wallet_remote_data_source.dart';
import 'package:mobile/feature/wallet/data/repositories/wallet_repository_implementation.dart';
import 'package:mobile/feature/wallet/domain/entities/top_up.dart';
import 'package:mobile/feature/wallet/domain/repositories/wallet_repository.dart';
import 'package:mobile/feature/wallet/domain/usecases/cancel_top_up.dart';
import 'package:mobile/feature/wallet/domain/usecases/decide_test_payment.dart';
import 'package:mobile/feature/wallet/domain/usecases/get_balance.dart';
import 'package:mobile/feature/wallet/domain/usecases/get_top_up.dart';
import 'package:mobile/feature/wallet/domain/usecases/get_wallet_transactions.dart';
import 'package:mobile/feature/wallet/domain/usecases/start_top_up.dart';
import 'package:mobile/feature/wallet/presentation/cubit/top_up_cubit.dart';
import 'package:mobile/feature/wallet/presentation/cubit/wallet_cubit.dart';

final sl = GetIt.instance;

Future<void> init() async {
  // External dependencies
  final prefs = await SharedPreferences.getInstance();
  sl.registerLazySingleton<SharedPreferences>(() => prefs);
  sl.registerLazySingleton<http.Client>(() => http.Client());

  // Core
  sl.registerLazySingleton(() => ConnectivityService());
  sl.registerLazySingleton(() => AppLanguage(sl()));
  sl.registerLazySingleton(
    () => ApiClient(
      sl(),
      // Looked up on use: AuthTokenProvider itself needs ApiClient (for /refresh).
      tokenProvider: () => sl<TokenProvider>(),
      languageCode: () => sl<AppLanguage>().code,
    ),
  );

  // Data sources
  sl.registerLazySingleton<AuthenticationRemoteDataSource>(
    () => AuthenticationRemoteDataSourceImpl(sl()),
  );
  sl.registerLazySingleton<AuthenticationLocalDataSource>(
    () => AuthenticationLocalDataSourceImpl(sl()),
  );
  sl.registerLazySingleton<ProfileRemoteDataSource>(
    () => ProfileRemoteDataSourceImpl(sl()),
  );
  sl.registerLazySingleton<ProfileLocalDataSource>(
    () => ProfileLocalDataSourceImpl(sl()),
  );
  sl.registerLazySingleton<HomeRemoteDataSource>(
    () => HomeRemoteDataSourceImpl(sl()),
  );
  sl.registerLazySingleton<ParkingRemoteDataSource>(
    () => ParkingRemoteDataSourceImpl(sl()),
  );
  sl.registerLazySingleton<NotificationRemoteDataSource>(
    () => NotificationRemoteDataSourceImpl(sl()),
  );
  sl.registerLazySingleton<BookingRemoteDataSource>(
    () => BookingRemoteDataSourceImpl(sl()),
  );
  sl.registerLazySingleton<WalletRemoteDataSource>(
    () => WalletRemoteDataSourceImpl(sl()),
  );

  // Session: one instance, used as AuthTokenProvider and as TokenProvider.
  sl.registerLazySingleton(() => AuthTokenProvider(sl(), sl(), sl()));
  sl.registerLazySingleton<TokenProvider>(() => sl<AuthTokenProvider>());

  // Repositories
  sl.registerLazySingleton<AuthenticationRepository>(
    () => AuthenticationRepositoryImpl(sl(), sl(), sl(), sl()),
  );
  sl.registerLazySingleton<ProfileRepository>(
    () => ProfileRepositoryImpl(sl(), sl()),
  );
  sl.registerLazySingleton<HomeRepository>(() => HomeRepositoryImpl(sl()));
  sl.registerLazySingleton<ParkingRepository>(
    () => ParkingRepositoryImpl(sl()),
  );
  sl.registerLazySingleton<NotificationRepository>(
    () => NotificationRepositoryImpl(sl()),
  );
  sl.registerLazySingleton<BookingRepository>(
    () => BookingRepositoryImpl(sl()),
  );
  sl.registerLazySingleton<WalletRepository>(
    () => WalletRepositoryImpl(sl()),
  );

  // Use cases: authentication
  sl.registerLazySingleton(() => UserLogin(sl()));
  sl.registerLazySingleton(() => UserLogout(sl()));
  sl.registerLazySingleton(() => UserRegister(sl()));
  sl.registerLazySingleton(() => ForgotPassword(sl()));
  sl.registerLazySingleton(() => ResetPassword(sl()));
  sl.registerLazySingleton(() => VerifyOtp(sl()));
  sl.registerLazySingleton(() => ClearSession(sl()));

  // Use cases: profile
  sl.registerLazySingleton(() => GetProfile(sl()));
  sl.registerLazySingleton(() => UpdateProfile(sl()));
  sl.registerLazySingleton(() => ChangePassword(sl()));
  sl.registerLazySingleton(() => DeleteAccount(sl()));
  sl.registerLazySingleton(() => GetVehicles(sl()));
  sl.registerLazySingleton(() => AddVehicle(sl()));
  sl.registerLazySingleton(() => UpdateVehicle(sl()));
  sl.registerLazySingleton(() => DeleteVehicle(sl()));
  sl.registerLazySingleton(() => SetDefaultVehicle(sl()));

  // Use cases: home
  sl.registerLazySingleton(() => GetNearbyLots(sl()));
  sl.registerLazySingleton(() => GetMyBookings(sl()));
  sl.registerLazySingleton(() => GetUnreadNotificationCount(sl()));

  // Use cases: parking
  sl.registerLazySingleton(() => GetParkingLotDetails(sl()));
  sl.registerLazySingleton(() => SearchParkingLots(sl()));

  // Location and directions
  sl.registerLazySingleton<LocationRepository>(
    () => LocationRepositoryImpl(),
  );
  sl.registerLazySingleton<DirectionsRepository>(
    () => DirectionsRepositoryImpl(),
  );
  sl.registerLazySingleton(() => GetCurrentLocation(sl()));
  sl.registerLazySingleton(() => OpenDirections(sl()));

  // Use cases: notifications
  sl.registerLazySingleton(() => GetNotifications(sl()));
  sl.registerLazySingleton(() => MarkNotificationRead(sl()));
  sl.registerLazySingleton(() => MarkAllNotificationsRead(sl()));
  sl.registerLazySingleton(() => GetNotificationSettings(sl()));
  sl.registerLazySingleton(() => UpdateNotificationSetting(sl()));

  // Use cases: booking
  sl.registerLazySingleton(() => GetWalletBalance(sl()));
  sl.registerLazySingleton(() => CreateBooking(sl()));
  sl.registerLazySingleton(() => GetBookings(sl()));
  sl.registerLazySingleton(() => GetBooking(sl()));
  sl.registerLazySingleton(() => GetBookingReceipt(sl()));
  sl.registerLazySingleton(() => ExtendBooking(sl()));
  sl.registerLazySingleton(() => CancelBooking(sl()));

  // Use cases: wallet
  sl.registerLazySingleton(() => GetBalance(sl()));
  sl.registerLazySingleton(() => GetWalletTransactions(sl()));
  sl.registerLazySingleton(() => StartTopUp(sl()));
  sl.registerLazySingleton(() => GetTopUp(sl()));
  sl.registerLazySingleton(() => CancelTopUp(sl()));
  sl.registerLazySingleton(() => DecideTestPayment(sl()));

  // Blocs and cubits: a new instance every time one is asked for
  sl.registerFactory(() => ThemeCubit());
  sl.registerFactory(() => ConnectivityCubit(sl()));
  sl.registerFactory(
    () => AuthBloc(
      sl(),
      sl(),
      sl(),
      sl(),
      sl(),
      sl(),
      sl(),
      sessionExpired: sl<ApiClient>().sessionExpired,
    ),
  );
  sl.registerFactory(() => ProfileBloc(sl()));
  sl.registerFactory(() => EditProfileCubit(sl()));
  sl.registerFactory(() => ChangePasswordCubit(sl()));
  sl.registerFactory(() => DeleteAccountCubit(sl()));
  sl.registerFactory(() => VehiclesCubit(sl(), sl(), sl()));
  sl.registerFactory(() => VehicleFormCubit(sl(), sl()));
  sl.registerFactory(() => HomeCubit(sl(), sl(), sl()));
  sl.registerFactory(() => ParkingDetailsCubit(sl()));
  sl.registerFactory(() => LocationCubit(sl(), sl()));
  sl.registerFactory(() => MapCubit(sl()));
  sl.registerFactory(() => DirectionsCubit(sl(), sl(), sl()));
  sl.registerFactory(() => NotificationsCubit(sl(), sl(), sl()));
  sl.registerFactory(() => NotificationSettingsCubit(sl(), sl()));
  // The text typed on Home, passed as param1.
  sl.registerFactoryParam<SearchCubit, String, void>(
    (query, _) => SearchCubit(sl(), initialQuery: query),
  );
  // Needs what the user picked, passed as param1.
  sl.registerFactory(() => MyBookingsCubit(sl()));
  sl.registerFactory(() => BookingDetailCubit(sl()));
  sl.registerFactory(() => BookingReceiptCubit(sl()));
  sl.registerFactory(() => CancelBookingCubit(sl()));
  // Needs the booking being extended, passed as param1.
  sl.registerFactoryParam<ExtendBookingCubit, Booking, void>(
    (booking, _) => ExtendBookingCubit(sl(), sl(), booking: booking),
  );
  sl.registerFactoryParam<PaymentCubit, BookingDraft, void>(
    (draft, _) => PaymentCubit(sl(), sl(), sl(), draft: draft),
  );
  sl.registerFactory(() => WalletCubit(sl(), sl(), sl()));
  // Needs the top-up being paid, passed as param1.
  sl.registerFactoryParam<TopUpCubit, TopUp, void>(
    (topUp, _) => TopUpCubit(sl(), sl(), sl(), topUp: topUp),
  );
}
