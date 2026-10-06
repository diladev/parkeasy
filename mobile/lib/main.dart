import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/connection/cubit/connectivity_cubit.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/theme/theme_cubit.dart';
import 'package:mobile/core/injection_container.dart' as di;
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/auth/presentation/bloc/auth_bloc.dart';
import 'package:mobile/feature/auth/presentation/bloc/auth_state.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await di.init();
  runApp(const ParkEasy());
}

class ParkEasy extends StatelessWidget {
  const ParkEasy({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<ThemeCubit>(create: (_) => di.sl<ThemeCubit>()),
        BlocProvider<ConnectivityCubit>(
          create: (context) => di.sl<ConnectivityCubit>(),
        ),
        // AppStarted is sent once, by the splash screen.
        BlocProvider<AuthBloc>(create: (_) => di.sl<AuthBloc>()),
      ],
      child: BlocBuilder<ThemeCubit, bool>(
        builder: (context, isDarkMode) {
          return MaterialApp(
            title: 'ParkEasy',
            debugShowCheckedModeBanner: false,
            navigatorKey: AppRouter.navigatorKey,
            theme: AppTheme.light,
            darkTheme: AppTheme.dark,
            themeMode: isDarkMode ? ThemeMode.dark : ThemeMode.light,
            initialRoute: AppRouter.initial,
            onGenerateRoute: AppRouter.onGenerateRoute,
            builder: (context, child) =>
                _SignedOutListener(child: child ?? const SizedBox.shrink()),
          );
        },
      ),
    );
  }
}

/// Wherever the user is, when the session ends (sign out, session expired)
/// go back to the login screen and show the reason.
class _SignedOutListener extends StatelessWidget {
  const _SignedOutListener({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listenWhen: (_, state) => state is AuthSignedOut,
      listener: (context, state) {
        AppRouter.navigatorKey.currentState?.pushNamedAndRemoveUntil(
          AppRouter.login,
          (_) => false,
        );
        final message = (state as AuthSignedOut).message;
        if (message != null) {
          context.showSnack(message);
        }
      },
      child: child,
    );
  }
}
