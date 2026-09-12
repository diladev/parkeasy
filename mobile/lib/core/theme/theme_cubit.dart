import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeCubit extends Cubit<bool> {
  static const String _isDarkModeKey = 'isDarkMode';
  ThemeCubit() : super(true) {
    _loadTheme();
  }

  Future<void> _loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    final isDarkMode = prefs.getBool(_isDarkModeKey) ?? true;
    emit(isDarkMode);
  }

  Future<void> toggleTheme() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_isDarkModeKey, !state);
    emit(!state);
  }
}
