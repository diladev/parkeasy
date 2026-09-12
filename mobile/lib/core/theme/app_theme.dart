import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // background
  static const Color bg = Color(0xFF111114);
  static const Color surface = Color(0xFF1C1C21);
  static const Color surface2 = Color(0xFF26262D);

  // brand
  static const Color teal = Color(0xFF1D9E75);
  static const Color tealDim = Color(0xFF0F6E56);
  static const Color tealLight = Color(0xFF5DCAA5);
  static const Color tealBg = Color(0x261D9E75);

  // status & actions
  static const Color red = Color(0xFFE24B4A);
  static const Color amber = Color(0xFFEF9F27);
  static const Color purple = Color(0xFF534AB7);
  static const Color blue = Color(0xFF003DA5);

  static const Color red15 = Color(0x26E24B4A);
  static const Color amber15 = Color(0x26EF9F27);
  static const Color purple15 = Color(0x26534AB7);
  static const Color blue15 = Color(0x26003DA5);

  static const Color red35 = Color(0x59E24B4A);
  static const Color amber35 = Color(0x59EF9F27);
  static const Color purple35 = Color(0x59534AB7);
  static const Color blue35 = Color(0x59003DA5);

  // text
  static const Color textPrimary = Color(0xFFF0EFF8);
  static const Color textMuted = Color(0xFF9998A8);
  static const Color textHint = Color(0xFF5C5B6E);

  // border
  static const Color border = Color(0x14FFFFFF);
}

class AppTheme {
  AppTheme._();

  static ThemeData get dark => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.bg,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.teal,
      onPrimary: Colors.white,
      secondary: AppColors.purple,
      onSecondary: Colors.white,
      error: AppColors.red,
      onError: Colors.white,
      surface: AppColors.surface,
      onSurface: AppColors.textPrimary,
      surfaceContainerHighest: AppColors.surface2,
      outline: AppColors.border,
      scrim: Colors.black,
      shadow: Colors.black,
    ),
    fontFamily: 'Inter',
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.bg,
      foregroundColor: AppColors.textPrimary,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        fontFamily: 'Inter',
        fontSize: 15,
        fontWeight: FontWeight.w500,
        color: AppColors.textPrimary,
      ),
    ),
  );

  static ThemeData get light => ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: Colors.white,
    colorScheme: const ColorScheme.light(
      primary: AppColors.teal,
      onPrimary: Colors.white,
      secondary: AppColors.purple,
      onSecondary: Colors.white,
      error: AppColors.red,
      onError: Colors.white,
      surface: Colors.white,
      onSurface: AppColors.textPrimary,
      surfaceContainerHighest: AppColors.surface2,
      outline: AppColors.border,
      scrim: Colors.black,
      shadow: Colors.black,
    ),
    fontFamily: 'Inter',
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: AppColors.textPrimary,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        fontFamily: 'Inter',
        fontSize: 15,
        fontWeight: FontWeight.w500,
        color: AppColors.textPrimary,
      ),
    ),
  );
}
