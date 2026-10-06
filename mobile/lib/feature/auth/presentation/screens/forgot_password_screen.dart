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

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  void _sendCode() {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;
    context.read<AuthBloc>().add(
      ForgotPasswordRequested(email: _emailController.text.trim()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return BaseScreenWrapper(
      child: Scaffold(
        body: BlocConsumer<AuthBloc, AuthState>(
          listener: (context, state) {
            // The code screen sends ForgotPasswordRequested again for
            // "Resend code"; without this check, this screen (still mounted
            // underneath) would open a second code screen.
            if (!context.isCurrentRoute) return;
            if (state is ForgotPasswordError) {
              context.showSnack(state.message, isError: true);
            } else if (state is ForgotPasswordSent) {
              AppRouter.toOtp(context, _emailController.text.trim());
            }
          },
          builder: (context, state) {
            return SafeArea(
              child: Column(
                children: [
                  const AppTopBar(title: 'Reset password'),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(22),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            const SizedBox(height: 30),
                            // Icon
                            Container(
                              width: 76,
                              height: 76,
                              decoration: BoxDecoration(
                                color: AppColors.purple15,
                                borderRadius: BorderRadius.circular(22),
                                border: Border.all(
                                  color: AppColors.purple,
                                  width: 1.5,
                                ),
                              ),
                              child: const Icon(
                                Icons.lock_rounded,
                                size: 36,
                                color: AppColors.purple,
                              ),
                            ),
                            const SizedBox(height: 20),
                            Text(
                              'Forgot your password?',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w500,
                                color: palette.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              "Enter the email linked to your account\nand we'll send you a reset code.",
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 13,
                                color: palette.textHint,
                              ),
                            ),
                            const SizedBox(height: 32),
                            AppInputField(
                              label: 'Email address',
                              hint: 'you@example.com',
                              controller: _emailController,
                              keyboardType: TextInputType.emailAddress,
                              autofillHints: const [AutofillHints.email],
                              validator: Validators.email,
                            ),
                            const SizedBox(height: 24),
                            AppButton(
                              label: 'Send reset code',
                              isLoading: state is AuthLoading,
                              onTap: _sendCode,
                            ),
                            const SizedBox(height: 20),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Remembered it? ',
                                  style: TextStyle(color: palette.textHint),
                                ),
                                GestureDetector(
                                  onTap: () => Navigator.pop(context),
                                  child: const Text(
                                    'Back to sign in',
                                    style: TextStyle(
                                      color: AppColors.teal,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ],
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
