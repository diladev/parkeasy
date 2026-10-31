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

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _agreedToTerms = false;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _register() {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;
    context.read<AuthBloc>().add(
      Registered(
        email: _emailController.text.trim(),
        password: _passwordController.text,
        name:
            '${_firstNameController.text.trim()} ${_lastNameController.text.trim()}',
        phone: _phoneController.text.trim(),
      ),
    );
  }

  Widget _stepDots(int filled, Color empty) {
    return Row(
      children: List.generate(
        3,
        (i) => Container(
          width: i < filled ? 28 : 7,
          height: 7,
          margin: const EdgeInsetsDirectional.only(end: 6),
          decoration: BoxDecoration(
            color: i < filled ? AppColors.teal : empty,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return BaseScreenWrapper(
      child: AppScreen(
        body: BlocConsumer<AuthBloc, AuthState>(
          listener: (context, state) {
            // The login screen underneath shares this bloc; this check keeps
            // the two screens from both reacting to the same state.
            if (!context.isCurrentRoute) return;
            if (state is RegistrationError) {
              context.showSnack(state.message, isError: true);
            } else if (state is AuthAuthenticated) {
              // Step 3: add a vehicle. The stack is cleared, so Back can't
              // return to the sign-up form of an account that now exists.
              AppRouter.toVehicleSetup(context);
            }
          },
          builder: (context, state) {
            return Column(
              children: [
                // Topbar
                AppTopBar(
                  title: l10n.createAccount,
                  onBack: () => Navigator.pop(context),
                ),

                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(22),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _stepDots(2, palette.surface2),
                          const SizedBox(height: 20),

                          // Name row
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: AppInputField(
                                  label: l10n.firstName,
                                  hint: l10n.firstNameHint,
                                  controller: _firstNameController,
                                  textCapitalization: TextCapitalization.words,
                                  textInputAction: TextInputAction.next,
                                  validator: Validators.text(max: 30),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: AppInputField(
                                  label: l10n.lastName,
                                  hint: l10n.lastNameHint,
                                  controller: _lastNameController,
                                  textCapitalization: TextCapitalization.words,
                                  textInputAction: TextInputAction.next,
                                  validator: Validators.text(max: 29),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          AppInputField(
                            label: l10n.emailAddress,
                            hint: l10n.emailHint,
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            textInputAction: TextInputAction.next,
                            autofillHints: const [AutofillHints.email],
                            validator: Validators.email,
                          ),
                          const SizedBox(height: 16),
                          AppInputField(
                            label: l10n.phoneNumber,
                            hint: '+964  07XX XXX XXXX',
                            controller: _phoneController,
                            keyboardType: TextInputType.phone,
                            textInputAction: TextInputAction.next,
                            autofillHints: const [
                              AutofillHints.telephoneNumber,
                            ],
                            validator: Validators.phone,
                          ),
                          const SizedBox(height: 16),
                          AppPasswordField(
                            label: l10n.password,
                            controller: _passwordController,
                            textInputAction: TextInputAction.next,
                            autofillHints: const [AutofillHints.newPassword],
                            validator: Validators.strongPassword,
                          ),
                          // Password strength
                          ValueListenableBuilder<TextEditingValue>(
                            valueListenable: _passwordController,
                            builder: (_, value, _) =>
                                PasswordStrengthBar(password: value.text),
                          ),
                          const SizedBox(height: 16),
                          AppPasswordField(
                            label: l10n.confirmPassword,
                            controller: _confirmPasswordController,
                            validator: Validators.matches(
                              () => _passwordController.text,
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Terms
                          GestureDetector(
                            onTap: () => setState(
                              () => _agreedToTerms = !_agreedToTerms,
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                AnimatedContainer(
                                  duration: const Duration(milliseconds: 150),
                                  width: 20,
                                  height: 20,
                                  decoration: BoxDecoration(
                                    color: _agreedToTerms
                                        ? AppColors.teal
                                        : Colors.transparent,
                                    borderRadius: BorderRadius.circular(5),
                                    border: Border.all(
                                      color: _agreedToTerms
                                          ? AppColors.teal
                                          : palette.textHint,
                                    ),
                                  ),
                                  child: _agreedToTerms
                                      ? const Icon(
                                          LucideIcons.check,
                                          size: 14,
                                          color: Colors.white,
                                        )
                                      : null,
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text.rich(
                                    TextSpan(
                                      text: l10n.agreeToThe,
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: palette.textHint,
                                      ),
                                      children: [
                                        TextSpan(
                                          text: l10n.termsOfService,
                                          style: const TextStyle(
                                            color: AppColors.teal,
                                          ),
                                        ),
                                        TextSpan(text: l10n.and),
                                        TextSpan(
                                          text: l10n.privacyPolicy,
                                          style: const TextStyle(
                                            color: AppColors.teal,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),

                          AppButton(
                            label: l10n.continueLabel,
                            isLoading: state is AuthLoading,
                            onTap: _agreedToTerms ? _register : null,
                          ),
                          const SizedBox(height: 24),
                          AppDividerWithLabel(label: l10n.or),
                          const SizedBox(height: 16),
                          AppOutlinedButton(
                            label: l10n.signUpWithGoogle,
                            onTap: () {
                              // TODO: Google sign up
                            },
                          ),
                          const SizedBox(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                l10n.alreadyHaveAccountSpace,
                                style: TextStyle(color: palette.textHint),
                              ),
                              GestureDetector(
                                onTap: () => Navigator.pop(context),
                                child: Text(
                                  l10n.signIn,
                                  style: const TextStyle(
                                    color: AppColors.teal,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 32),
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
