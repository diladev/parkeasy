import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/auth/presentation/bloc/auth_bloc.dart';
import 'package:mobile/feature/auth/presentation/bloc/auth_event.dart';
import 'package:mobile/feature/auth/presentation/bloc/auth_state.dart';
import 'package:mobile/core/connection/connectivity_wrapper.dart';

class OtpScreen extends StatefulWidget {
  final String email;

  const OtpScreen({super.key, required this.email});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final List<TextEditingController> _controllers = List.generate(
    6,
    (_) => TextEditingController(),
  );
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());

  // The API only sends a new code once a minute, so the button waits as long.
  static const int _resendSeconds = 60;
  int _secondsLeft = _resendSeconds;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_secondsLeft == 0) {
        t.cancel();
      } else {
        setState(() => _secondsLeft--);
      }
    });
  }

  void _resend() {
    context.read<AuthBloc>().add(ForgotPasswordRequested(email: widget.email));
    for (final controller in _controllers) {
      controller.clear();
    }
    _focusNodes.first.requestFocus();
    setState(() => _secondsLeft = _resendSeconds);
    _startTimer();
  }

  String get _otp => _controllers.map((c) => c.text).join();

  void _verify() {
    context.read<AuthBloc>().add(OtpVerified(email: widget.email, otp: _otp));
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return BaseScreenWrapper(
      child: Scaffold(
        body: BlocConsumer<AuthBloc, AuthState>(
          listener: (context, state) {
            if (!context.isCurrentRoute) return;
            if (state is OtpVerificationError) {
              context.showSnack(state.message, isError: true);
            } else if (state is ForgotPasswordError) {
              context.showSnack(state.message, isError: true);
            } else if (state is ForgotPasswordSent) {
              context.showSnack('We sent a new code to ${widget.email}.');
            } else if (state is OtpVerifiedSuccess) {
              AppRouter.toResetPassword(context, state.token);
            }
          },
          builder: (context, state) {
            return SafeArea(
              child: Column(
                children: [
                  const AppTopBar(title: 'Enter code'),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(22),
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
                              Icons.mail_outline_rounded,
                              size: 36,
                              color: AppColors.tealLight,
                            ),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            'Check your email',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w500,
                              color: palette.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text.rich(
                            TextSpan(
                              text: 'We sent a 6-digit code to\n',
                              style: TextStyle(
                                fontSize: 13,
                                color: palette.textHint,
                              ),
                              children: [
                                TextSpan(
                                  text: widget.email,
                                  style: TextStyle(
                                    color: palette.textPrimary,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 36),

                          // OTP boxes. Always left-to-right, even in Kurdish.
                          Directionality(
                            textDirection: TextDirection.ltr,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: List.generate(6, (i) {
                                final filled = _controllers[i].text.isNotEmpty;
                                return SizedBox(
                                  width: 46,
                                  height: 56,
                                  child: TextFormField(
                                    controller: _controllers[i],
                                    focusNode: _focusNodes[i],
                                    textAlign: TextAlign.center,
                                    keyboardType: TextInputType.number,
                                    inputFormatters: [
                                      FilteringTextInputFormatter.digitsOnly,
                                    ],
                                    maxLength: 1,
                                    style: TextStyle(
                                      fontSize: 22,
                                      fontWeight: FontWeight.w500,
                                      color: palette.textPrimary,
                                    ),
                                    decoration: InputDecoration(
                                      counterText: '',
                                      filled: true,
                                      fillColor: filled
                                          ? AppColors.tealBg
                                          : palette.surface,
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: BorderSide(
                                          color: filled
                                              ? AppColors.teal
                                              : palette.border,
                                          width: filled ? 1 : 0.5,
                                        ),
                                      ),
                                      enabledBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: BorderSide(
                                          color: filled
                                              ? AppColors.teal
                                              : palette.border,
                                          width: 0.5,
                                        ),
                                      ),
                                      focusedBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: const BorderSide(
                                          color: AppColors.teal,
                                          width: 1,
                                        ),
                                      ),
                                    ),
                                    onChanged: (v) {
                                      setState(() {});
                                      if (v.isNotEmpty && i < 5) {
                                        _focusNodes[i + 1].requestFocus();
                                      }
                                      if (v.isEmpty && i > 0) {
                                        _focusNodes[i - 1].requestFocus();
                                      }
                                    },
                                  ),
                                );
                              }),
                            ),
                          ),
                          const SizedBox(height: 32),

                          AppButton(
                            label: 'Verify code',
                            isLoading: state is AuthLoading,
                            onTap: _otp.length == 6 ? _verify : null,
                          ),
                          const SizedBox(height: 24),
                          Text(
                            "Didn't receive the code?",
                            style: TextStyle(
                              fontSize: 13,
                              color: palette.textHint,
                            ),
                          ),
                          const SizedBox(height: 6),
                          _secondsLeft > 0
                              ? Text(
                                  'Resend in 0:${_secondsLeft.toString().padLeft(2, '0')}',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.teal,
                                    fontWeight: FontWeight.w500,
                                  ),
                                )
                              : GestureDetector(
                                  onTap: _resend,
                                  child: const Text(
                                    'Resend code',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: AppColors.teal,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                        ],
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
