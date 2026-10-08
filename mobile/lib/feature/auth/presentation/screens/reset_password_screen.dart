import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/validators.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/auth/presentation/bloc/auth_bloc.dart';
import 'package:mobile/feature/auth/presentation/bloc/auth_event.dart';
import 'package:mobile/feature/auth/presentation/bloc/auth_state.dart';
import 'package:mobile/core/connection/connectivity_wrapper.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String token;

  const ResetPasswordScreen({super.key, required this.token});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  void _reset() {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;
    context.read<AuthBloc>().add(
      PasswordReset(token: widget.token, newPassword: _passwordController.text),
    );
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return BaseScreenWrapper(
      child: Scaffold(
        body: BlocConsumer<AuthBloc, AuthState>(
          listener: (context, state) {
            if (!context.isCurrentRoute) return;
            if (state is PasswordResetError) {
              context.showSnack(state.message, isError: true);
            } else if (state is PasswordResetSuccess) {
              Navigator.pushNamedAndRemoveUntil(
                context,
                AppRouter.resetPasswordSuccess,
                (route) => false,
              );
            }
          },
          builder: (context, state) {
            return SafeArea(
              child: Column(
                children: [
                  const AppTopBar(title: 'New password'),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(22),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            const SizedBox(height: 30),
                            Container(
                              width: 76,
                              height: 76,
                              decoration: BoxDecoration(
                                color: AppColors.tealBg,
                                borderRadius: BorderRadius.circular(22),
                                border: Border.all(
                                  color: AppColors.teal,
                                  width: 1.5,
                                ),
                              ),
                              child: const Icon(
                                Icons.lock_open_rounded,
                                size: 36,
                                color: AppColors.tealLight,
                              ),
                            ),
                            const SizedBox(height: 20),
                            Text(
                              'Set a new password',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w500,
                                color: palette.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              'At least 8 characters, with an uppercase and a lowercase letter, a number and a symbol.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 13,
                                color: palette.textHint,
                              ),
                            ),
                            const SizedBox(height: 32),
                            AppPasswordField(
                              label: 'New password',
                              controller: _passwordController,
                              textInputAction: TextInputAction.next,
                              autofillHints: const [AutofillHints.newPassword],
                              validator: Validators.strongPassword,
                            ),
                            ValueListenableBuilder<TextEditingValue>(
                              valueListenable: _passwordController,
                              builder: (_, value, _) =>
                                  PasswordStrengthBar(password: value.text),
                            ),
                            const SizedBox(height: 16),
                            AppPasswordField(
                              label: 'Confirm new password',
                              controller: _confirmController,
                              validator: Validators.matches(
                                () => _passwordController.text,
                              ),
                            ),
                            const SizedBox(height: 32),
                            AppButton(
                              label: 'Reset password',
                              isLoading: state is AuthLoading,
                              onTap: _reset,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

// ─── Reset Password Success Screen ───────────────────────────────────────────
class ResetPasswordSuccessScreen extends StatelessWidget {
  const ResetPasswordSuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return BaseScreenWrapper(
      child: Scaffold(
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.tealBg,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.teal, width: 1.5),
                  ),
                  child: const Icon(
                    Icons.check_rounded,
                    size: 40,
                    color: AppColors.tealLight,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Password reset!',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w500,
                    color: palette.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Your password has been updated. For your safety you were signed out on every device.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, color: palette.textHint),
                ),
                const SizedBox(height: 40),
                AppButton(
                  label: 'Sign in now',
                  onTap: () => AppRouter.toLogin(context),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
