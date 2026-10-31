import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/connection/connectivity_wrapper.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/state/submit_state.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/validators.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/profile/presentation/cubit/change_password_cubit.dart';

class ChangePasswordScreen extends StatelessWidget {
  const ChangePasswordScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<ChangePasswordCubit>(),
      child: const _ChangePasswordView(),
    );
  }
}

class _ChangePasswordView extends StatefulWidget {
  const _ChangePasswordView();

  @override
  State<_ChangePasswordView> createState() => _ChangePasswordViewState();
}

class _ChangePasswordViewState extends State<_ChangePasswordView> {
  final _formKey = GlobalKey<FormState>();
  final _currentController = TextEditingController();
  final _newController = TextEditingController();
  final _confirmController = TextEditingController();

  @override
  void dispose() {
    _currentController.dispose();
    _newController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  void _submit() {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;
    context.read<ChangePasswordCubit>().submit(
      currentPassword: _currentController.text,
      newPassword: _newController.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return BaseScreenWrapper(
      child: AppScreen(
        body: BlocConsumer<ChangePasswordCubit, SubmitState<void>>(
          listener: (context, state) {
            if (state.status == SubmitStatus.success) {
              context.showSnack(l10n.passwordChanged);
              Navigator.pop(context);
            } else if (state.status == SubmitStatus.failure) {
              context.showSnack(
                state.message ?? l10n.couldntChangePassword,
                isError: true,
              );
            }
          },
          builder: (context, state) {
            return Column(
              children: [
                AppTopBar(title: l10n.changePassword),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(22),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            l10n.changePasswordRules,
                            style: TextStyle(
                              fontSize: 13,
                              color: palette.textMuted,
                              height: 1.5,
                            ),
                          ),
                          const SizedBox(height: 24),
                          AppPasswordField(
                            label: l10n.currentPassword,
                            controller: _currentController,
                            validator: Validators.required,
                            textInputAction: TextInputAction.next,
                            autofillHints: const [AutofillHints.password],
                          ),
                          const SizedBox(height: 16),
                          AppPasswordField(
                            label: l10n.newPassword,
                            controller: _newController,
                            textInputAction: TextInputAction.next,
                            autofillHints: const [AutofillHints.newPassword],
                            validator: (value) {
                              final error = Validators.strongPassword(value);
                              if (error != null) return error;
                              return value == _currentController.text
                                  ? l10n.chooseDifferentPassword
                                  : null;
                            },
                          ),
                          ValueListenableBuilder<TextEditingValue>(
                            valueListenable: _newController,
                            builder: (_, value, _) =>
                                PasswordStrengthBar(password: value.text),
                          ),
                          const SizedBox(height: 16),
                          AppPasswordField(
                            label: l10n.confirmNewPassword,
                            controller: _confirmController,
                            validator: Validators.matches(
                              () => _newController.text,
                            ),
                          ),
                          const SizedBox(height: 32),
                          AppButton(
                            label: l10n.updatePassword,
                            isLoading: state.isSubmitting,
                            onTap: _submit,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
