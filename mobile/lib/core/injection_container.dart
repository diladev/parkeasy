import 'package:get_it/get_it.dart';
import 'package:mobile/core/service/connectivity_service.dart';
import 'package:mobile/core/theme/theme_cubit.dart';
import 'package:mobile/feature/auth/data/repositories/auth_remote_data_source.dart';
import 'package:mobile/feature/auth/data/repositories/auth_repository_implementation.dart';
import 'package:mobile/feature/auth/domain/repositories/auth_repository.dart';
import 'package:mobile/feature/auth/domain/usecase/auth_usecase.dart';
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

  // Services
  sl.registerLazySingleton(() => ConnectivityService());

  // Data sources
  sl.registerLazySingleton<AuthenticationRemoteDataSource>(
    () => AuthenticationRemoteDataSourceImpl(sl()),
  );

  // Repositories
  sl.registerLazySingleton<AuthenticationRepository>(
    () => AuthenticationRepositoryImpl(sl(), sl()),
  );

  // Use cases
  sl.registerLazySingleton(() => UserLogin(sl()));
  sl.registerLazySingleton(() => UserLogout(sl()));
  sl.registerLazySingleton(() => UserRegister(sl()));
  sl.registerLazySingleton(() => ForgotPassword(sl()));
  sl.registerLazySingleton(() => ResetPassword(sl()));
  sl.registerLazySingleton((() => VerifyOtp(sl())));

  // Blocs
  sl.registerFactory(() => ThemeCubit());
  sl.registerFactory(() => ConnectivityCubit(sl()));
  sl.registerFactory(() => AuthBloc(sl(), sl(), sl(), sl(), sl(), sl()));
}
