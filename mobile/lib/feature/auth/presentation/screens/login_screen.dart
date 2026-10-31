import 'package:flutter/material.dart';
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

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _signIn() {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;
    context.read<AuthBloc>().add(
      LoggedIn(
        email: _emailController.text.trim(),
        password: _passwordController.text,
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
            // Screens pushed on top (register, forgot password) share this
            // bloc: only react while this screen is the one being shown.
            if (!context.isCurrentRoute) return;
            if (state is LogInError) {
              context.showSnack(state.message, isError: true);
            } else if (state is AuthAuthenticated) {
              AppRouter.toLocationPermission(context);
            }
          },
          builder: (context, state) {
            return SingleChildScrollView(
              child: Column(
                children: [
                  // Hero header
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.fromLTRB(0, 80, 0, 32),
                    color: AppColors.tealDim,
                    child: Column(
                      children: [
                        Text(
                          l10n.welcomeBack,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w500,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          l10n.signInToAccount,
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.white.withValues(alpha: 0.65),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Form
                  Padding(
                    padding: const EdgeInsets.all(22),
                    child: Form(
                      key: _formKey,
                      child: AutofillGroup(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const SizedBox(height: 8),
                            AppInputField(
                              label: l10n.email,
                              hint: l10n.emailHint,
                              controller: _emailController,
                              keyboardType: TextInputType.emailAddress,
                              textInputAction: TextInputAction.next,
                              autofillHints: const [AutofillHints.email],
                              validator: Validators.email,
                            ),
                            const SizedBox(height: 16),
                            AppPasswordField(
                              label: l10n.password,
                              controller: _passwordController,
                              textInputAction: TextInputAction.done,
                              autofillHints: const [AutofillHints.password],
                              validator: (v) => v == null || v.isEmpty
                                  ? l10n.enterYourPassword
                                  : null,
                            ),
                            const SizedBox(height: 8),
                            Align(
                              alignment: AlignmentDirectional.centerEnd,
                              child: TextButton(
                                onPressed: () =>
                                    AppRouter.toForgotPassword(context),
                                child: Text(l10n.forgotPassword),
                              ),
                            ),
                            const SizedBox(height: 8),
                            AppButton(
                              label: l10n.signIn,
                              isLoading: state is AuthLoading,
                              onTap: _signIn,
                            ),
                            const SizedBox(height: 24),
                            AppDividerWithLabel(label: l10n.or),
                            const SizedBox(height: 24),
                            AppOutlinedButton(
                              label: l10n.continueWithGoogle,
                              onTap: () {
                                // TODO: Google sign in
                              },
                            ),
                            const SizedBox(height: 24),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  l10n.newHere,
                                  style: TextStyle(color: palette.textHint),
                                ),
                                GestureDetector(
                                  onTap: () => AppRouter.toRegister(context),
                                  child: Text(
                                    l10n.createAccount,
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
              ),
            );
          },
        ),
      ),
    );
  }
}
