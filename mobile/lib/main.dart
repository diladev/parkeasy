import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/theme/theme_cubit.dart';
import 'package:mobile/core/injection_container.dart' as di;

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  di.init();
  runApp(ParkEasy());
}

class ParkEasy extends StatelessWidget {
  const ParkEasy({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [BlocProvider<ThemeCubit>(create: (context) => ThemeCubit())],
      child: BlocBuilder<ThemeCubit, bool>(
        builder: (context, isDarkMode) {
          return MaterialApp(
            title: 'ParkEasy',
            theme: AppTheme.light,
            darkTheme: AppTheme.dark,
            themeMode: isDarkMode ? ThemeMode.dark : ThemeMode.light,
            home: Scaffold(
              appBar: AppBar(title: Text('ParkEasy')),
              body: Center(child: Text('Welcome to ParkEasy!')),
            ),
          );
        },
      ),
    );
  }
}
