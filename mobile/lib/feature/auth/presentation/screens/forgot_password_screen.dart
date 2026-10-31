import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/validators.dart';
import 'package:mobile/core/widgets/app_screen.dart';
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
      child: AppScreen(
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
            return Column(
              children: [
                AppTopBar(title: l10n.resetPassword),
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
                            width: 72,
                            height: 72,
                            decoration: BoxDecoration(
                              color: AppColors.yellow15,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Icon(
                              LucideIcons.lockKeyhole200,
                              size: 44,
                              color: AppColors.yellow,
                            ),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            l10n.forgotYourPassword,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w500,
                              color: palette.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            l10n.forgotPasswordHelp,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 13,
                              color: palette.textHint,
                            ),
                          ),
                          const SizedBox(height: 32),
                          AppInputField(
                            label: l10n.emailAddress,
                            hint: l10n.emailHint,
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            autofillHints: const [AutofillHints.email],
                            validator: Validators.email,
                          ),
                          const SizedBox(height: 24),
                          AppButton(
                            label: l10n.sendResetCode,
                            isLoading: state is AuthLoading,
                            onTap: _sendCode,
                          ),
                          const SizedBox(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                l10n.rememberedIt,
                                style: TextStyle(color: palette.textHint),
                              ),
                              GestureDetector(
                                onTap: () => Navigator.pop(context),
                                child: Text(
                                  l10n.backToSignIn,
                                  style: const TextStyle(
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
            );
          },
        ),
      ),
    );
  }
}
