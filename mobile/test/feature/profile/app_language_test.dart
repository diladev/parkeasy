import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/connection/cubit/connectivity_cubit.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/l10n/language_cubit.dart';
import 'package:mobile/core/l10n/strings_en.dart';
import 'package:mobile/core/locale/app_language.dart';
import 'package:mobile/core/service/connectivity_service.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/profile/presentation/screens/app_language_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Always online, without the connectivity plugin.
class _Online implements ConnectivityService {
  @override
  Stream<bool> get connectivityStream => const Stream.empty();

  @override
  Future<bool> checkConnection() async => true;

  @override
  Future<void> dispose() async {}
}

/// [home] in an app wired like main.dart: the locale follows LanguageCubit
/// and every widget rebuilds when it changes.
Future<LanguageCubit> pumpApp(WidgetTester tester, Widget home) async {
  SharedPreferences.setMockInitialValues({});
  final cubit = LanguageCubit(
    AppLanguage(await SharedPreferences.getInstance()),
  );
  addTearDown(cubit.close);
  await tester.pumpWidget(
    MultiBlocProvider(
      providers: [
        BlocProvider.value(value: cubit),
        BlocProvider(create: (_) => ConnectivityCubit(_Online())),
      ],
      child: BlocBuilder<LanguageCubit, String>(
        builder: (context, code) => MaterialApp(
          theme: AppTheme.dark,
          locale: Locale(code),
          supportedLocales: AppLocales.supported,
          localizationsDelegates: AppLocales.delegates,
          builder: (context, child) => BlocListener<LanguageCubit, String>(
            listener: (_, _) => rebuildAllWidgets(),
            child: child!,
          ),
          home: home,
        ),
      ),
    ),
  );
  return cubit;
}

void main() {
  tearDown(() => AppStrings.current = const EnStrings());

  testWidgets('lists both languages, each in its own script', (tester) async {
    await pumpApp(tester, const AppLanguageScreen());

    expect(find.text('App language'), findsOneWidget);
    expect(find.text('English'), findsNWidgets(2)); // the name and its hint
    expect(find.text('کوردی'), findsOneWidget);
    expect(find.text('Kurdish (Sorani)'), findsOneWidget);
  });

  testWidgets('switches to Kurdish at once, right to left', (tester) async {
    await pumpApp(tester, const AppLanguageScreen());

    await tester.tap(find.text('کوردی'));
    await tester.pumpAndSettle();

    // The top bar was built before the change: it shows the new text too.
    expect(find.text('زمانی ئەپ'), findsOneWidget);
    expect(find.text('App language'), findsNothing);
    expect(
      Directionality.of(tester.element(find.text('زمانی ئەپ'))),
      TextDirection.rtl,
    );
    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getString('app_language'), 'ckb');

    // And back.
    await tester.tap(find.text('English').first);
    await tester.pumpAndSettle();
    expect(find.text('App language'), findsOneWidget);
    expect(
      Directionality.of(tester.element(find.text('App language'))),
      TextDirection.ltr,
    );
  });

  testWidgets('keeps the bottom tabs in the same order in Kurdish', (
    tester,
  ) async {
    final cubit = await pumpApp(
      tester,
      Scaffold(
        body: const SizedBox.expand(),
        bottomNavigationBar: AppBottomNav(currentIndex: 0, onTap: (_) {}),
      ),
    );
    await cubit.choose('ckb');
    await tester.pumpAndSettle();

    expect(find.text('سەرەکی'), findsOneWidget);
    double x(IconData icon) => tester.getCenter(find.byIcon(icon)).dx;
    expect(x(LucideIcons.house), lessThan(x(LucideIcons.map)));
    expect(x(LucideIcons.map), lessThan(x(LucideIcons.listCheck)));
    expect(x(LucideIcons.listCheck), lessThan(x(LucideIcons.userRound)));
  });
}
