import 'dart:async';
import 'package:flutter/material.dart';
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

  int _secondsLeft = 60;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
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
    setState(() => _secondsLeft = 60);
    _startTimer();
  }

  String get _otp => _controllers.map((c) => c.text).join();

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
    return BaseScreenWrapper(
      child: Scaffold(
        body: BlocConsumer<AuthBloc, AuthState>(
          listener: (context, state) {
            if (state is OtpVerificationError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(state.message),
                  backgroundColor: Theme.of(context).colorScheme.error,
                ),
              );
            } else if (state is OtpVerifiedSuccess) {
              AppRouter.toResetPassword(context, state.token);
            }
          },
          builder: (context, state) {
            return SafeArea(
              child: Column(
                children: [
                  AppTopBar(title: 'Enter code'),
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
                          const Text(
                            'Check your email',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w500,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text.rich(
                            TextSpan(
                              text: 'We sent a 6-digit code to\n',
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppColors.textHint,
                              ),
                              children: [
                                TextSpan(
                                  text: widget.email,
                                  style: const TextStyle(
                                    color: AppColors.textPrimary,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 36),

                          // OTP boxes
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: List.generate(6, (i) {
                              return SizedBox(
                                width: 46,
                                height: 56,
                                child: TextFormField(
                                  controller: _controllers[i],
                                  focusNode: _focusNodes[i],
                                  textAlign: TextAlign.center,
                                  keyboardType: TextInputType.number,
                                  maxLength: 1,
                                  style: const TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w500,
                                    color: AppColors.textPrimary,
                                  ),
                                  decoration: InputDecoration(
                                    counterText: '',
                                    filled: true,
                                    fillColor: _controllers[i].text.isNotEmpty
                                        ? AppColors.tealBg
                                        : AppColors.surface,
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(
                                        color: _controllers[i].text.isNotEmpty
                                            ? AppColors.teal
                                            : AppColors.border,
                                        width: _controllers[i].text.isNotEmpty
                                            ? 1
                                            : 0.5,
                                      ),
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(
                                        color: _controllers[i].text.isNotEmpty
                                            ? AppColors.teal
                                            : AppColors.border,
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
                          const SizedBox(height: 32),

                          AppButton(
                            label: 'Verify code',
                            isLoading: state is AuthLoading,
                            onTap: _otp.length == 6
                                ? () {
                                    context.read<AuthBloc>().add(
                                      OtpVerified(
                                        email: widget.email,
                                        otp: _otp,
                                      ),
                                    );
                                  }
                                : null,
                          ),
                          const SizedBox(height: 24),
                          const Text(
                            "Didn't receive the code?",
                            style: TextStyle(
                              fontSize: 13,
                              color: AppColors.textHint,
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
