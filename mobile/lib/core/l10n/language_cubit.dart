import 'package:flutter/widgets.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/locale/app_language.dart';

/// The app's language: 'en' or 'ckb'. Starts with the one saved on this
/// phone (English the first time) and saves every change, so the API's
/// messages (x-lang) and the app's texts always match.
class LanguageCubit extends Cubit<String> {
  LanguageCubit(this._language) : super(_language.code) {
    AppStrings.current = AppLocales.stringsFor(state);
  }

  final AppLanguage _language;

  Locale get locale => Locale(state);

  Future<void> choose(String code) async {
    if (code == state || !AppLanguage.supported.contains(code)) return;
    await _language.setCode(code);
    AppStrings.current = AppLocales.stringsFor(code);
    emit(code);
  }
}
