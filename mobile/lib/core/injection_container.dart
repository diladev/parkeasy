import 'package:get_it/get_it.dart';
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
import 'package:mobile/feature/profile/data/repositories/profile_local_data_source.dart';
import 'package:mobile/feature/profile/data/repositories/profile_remote_data_source.dart';
import 'package:mobile/feature/profile/data/repositories/profile_repository_implementation.dart';
import 'package:mobile/feature/profile/domain/repositories/profile_repository.dart';
import 'package:mobile/feature/profile/domain/usecases/add_vehicle.dart';
import 'package:mobile/feature/profile/domain/usecases/delete_account.dart';
import 'package:mobile/feature/profile/domain/usecases/delete_vehicle.dart';
import 'package:mobile/feature/profile/domain/usecases/get_profile.dart';
import 'package:mobile/feature/profile/domain/usecases/get_vehicles.dart';
import 'package:mobile/feature/profile/domain/usecases/set_default_vehicle.dart';
import 'package:mobile/feature/profile/domain/usecases/update_profile.dart';
import 'package:mobile/feature/profile/domain/usecases/update_vehicle.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/core/connection/cubit/connectivity_cubit.dart';
import 'package:mobile/feature/auth/presentation/bloc/auth_bloc.dart';

final sl = GetIt.instance;
Future<void> init() async {
  // External dependencies
  final prefs = await SharedPreferences.getInstance();
  sl.registerLazySingleton(() => prefs);
  sl.registerLazySingleton(() => http.Client());

  // Session: one instance, used as AuthTokenProvider and as TokenProvider.
  sl.registerLazySingleton(() => AuthTokenProvider(sl(), sl(), sl()));
  sl.registerLazySingleton<TokenProvider>(() => sl<AuthTokenProvider>());

  // Services
  sl.registerLazySingleton(() => ConnectivityService());
  sl.registerLazySingleton(
    () => ApiClient(
      sl(),
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

  // Repositories
  sl.registerLazySingleton<AuthenticationRepository>(
    () => AuthenticationRepositoryImpl(sl(), sl(), sl(), sl()),
  );
  sl.registerLazySingleton<ProfileRepository>(
    () => ProfileRepositoryImpl(sl(), sl()),
  );

  // Use cases: authentication
  sl.registerLazySingleton(() => UserLogin(sl()));
  sl.registerLazySingleton(() => UserLogout(sl()));
  sl.registerLazySingleton(() => UserRegister(sl()));
  sl.registerLazySingleton(() => ForgotPassword(sl()));
  sl.registerLazySingleton(() => ResetPassword(sl()));
  sl.registerLazySingleton((() => VerifyOtp(sl())));
  sl.registerLazySingleton(() => ClearSession(sl()));

  // Use cases: profile
  sl.registerLazySingleton(() => GetProfile(sl()));
  sl.registerLazySingleton(() => UpdateProfile(sl()));
  sl.registerLazySingleton(() => DeleteAccount(sl()));
  sl.registerLazySingleton(() => GetVehicles(sl()));
  sl.registerLazySingleton(() => AddVehicle(sl()));
  sl.registerLazySingleton(() => UpdateVehicle(sl()));
  sl.registerLazySingleton(() => DeleteVehicle(sl()));
  sl.registerLazySingleton(() => SetDefaultVehicle(sl()));

  // Blocs
  sl.registerFactory(() => ThemeCubit());
  sl.registerFactory(() => ConnectivityCubit(sl()));
  sl.registerFactory(() => AuthBloc(sl(), sl(), sl(), sl(), sl(), sl()));
}
