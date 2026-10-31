import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/connection/connectivity_wrapper.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/state/submit_state.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/validators.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/auth/presentation/bloc/auth_bloc.dart';
import 'package:mobile/feature/auth/presentation/bloc/auth_event.dart';
import 'package:mobile/feature/profile/presentation/cubit/delete_account_cubit.dart';

class DeleteAccountScreen extends StatelessWidget {
  const DeleteAccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<DeleteAccountCubit>(),
      child: const _DeleteAccountView(),
    );
  }
}

class _DeleteAccountView extends StatefulWidget {
  const _DeleteAccountView();

  @override
  State<_DeleteAccountView> createState() => _DeleteAccountViewState();
}

class _DeleteAccountViewState extends State<_DeleteAccountView> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _delete() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    final confirmed = await showAppConfirmDialog(
      context,
      title: l10n.deleteAccountQuestion,
      message: l10n.cantBeUndone,
      confirmLabel: l10n.delete,
      isDestructive: true,
    );
    if (confirmed && mounted) {
      context.read<DeleteAccountCubit>().submit(
        password: _passwordController.text,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return BaseScreenWrapper(
      child: AppScreen(
        body: BlocConsumer<DeleteAccountCubit, SubmitState<void>>(
          listener: (context, state) {
            if (state.status == SubmitStatus.success) {
              // AuthBloc clears the session; main.dart then shows the login
              // screen with this message.
              context.read<AuthBloc>().add(
                ResetToUnauthorized(message: l10n.accountDeleted),
              );
            } else if (state.status == SubmitStatus.failure) {
              context.showSnack(
                state.message ?? l10n.couldntDeleteAccount,
                isError: true,
              );
            }
          },
          builder: (context, state) {
            return Column(
              children: [
                AppTopBar(title: l10n.deleteAccount),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(22),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          AppCard(
                            color: AppColors.red15,
                            borderColor: AppColors.red35,
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(
                                  LucideIcons.triangleAlert,
                                  color: AppColors.red,
                                  size: 22,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    l10n.deleteAccountWarning,
                                    style: TextStyle(
                                      fontSize: 13,
                                      height: 1.5,
                                      color: palette.textPrimary,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),
                          AppPasswordField(
                            label: l10n.enterPasswordToConfirm,
                            controller: _passwordController,
                            validator: Validators.required,
                            autofillHints: const [AutofillHints.password],
                          ),
                          const SizedBox(height: 32),
                          AppDestructiveButton(
                            label: l10n.deleteMyAccount,
                            icon: LucideIcons.trash2,
                            isLoading: state.isSubmitting,
                            onTap: _delete,
                          ),
                          const SizedBox(height: 12),
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: Text(
                              l10n.keepMyAccount,
                              style: TextStyle(color: palette.textMuted),
                            ),
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
