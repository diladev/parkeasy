import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/connection/connectivity_wrapper.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/state/submit_state.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/utils/validators.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/profile/domain/entities/user_entity.dart';
import 'package:mobile/feature/profile/presentation/bloc/profile_bloc.dart';
import 'package:mobile/feature/profile/presentation/bloc/profile_event.dart';
import 'package:mobile/feature/profile/presentation/cubit/edit_profile_cubit.dart';

class EditProfileScreen extends StatelessWidget {
  const EditProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // A new cubit for each visit; it's closed when the screen closes.
    return BlocProvider(
      create: (_) => sl<EditProfileCubit>(),
      child: const _EditProfileView(),
    );
  }
}

class _EditProfileView extends StatefulWidget {
  const _EditProfileView();

  @override
  State<_EditProfileView> createState() => _EditProfileViewState();
}

class _EditProfileViewState extends State<_EditProfileView> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _emailController;
  late final TextEditingController _phoneController;
  final _birthdayController = TextEditingController();
  DateTime? _dateOfBirth;

  @override
  void initState() {
    super.initState();
    final user = context.read<ProfileBloc>().state.user;
    _nameController = TextEditingController(text: user?.name ?? '');
    _emailController = TextEditingController(text: user?.email ?? '');
    _phoneController = TextEditingController(text: user?.phone ?? '');
    _setDateOfBirth(user?.dateOfBirth);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _birthdayController.dispose();
    super.dispose();
  }

  void _setDateOfBirth(DateTime? date) {
    _dateOfBirth = date;
    _birthdayController.text = date == null ? '' : Formatters.readableDate(date);
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _dateOfBirth ?? DateTime(now.year - 25),
      firstDate: DateTime(1900),
      lastDate: now,
      helpText: 'Date of birth',
    );
    if (picked != null) {
      setState(() => _setDateOfBirth(picked));
    }
  }

  void _save() {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;
    context.read<EditProfileCubit>().submit(
      name: _nameController.text.trim(),
      email: _emailController.text.trim(),
      phone: _phoneController.text.trim(),
      dateOfBirth: _dateOfBirth,
    );
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return BaseScreenWrapper(
      child: Scaffold(
        body: SafeArea(
          child: BlocConsumer<EditProfileCubit, SubmitState<User>>(
            listener: (context, state) {
              if (state.status == SubmitStatus.success && state.data != null) {
                // Every screen showing the user updates at once.
                context.read<ProfileBloc>().add(ProfileUserChanged(state.data!));
                context.showSnack('Your profile has been updated.');
                Navigator.pop(context);
              } else if (state.status == SubmitStatus.failure) {
                context.showSnack(
                  state.message ?? "Couldn't save your changes.",
                  isError: true,
                );
              }
            },
            builder: (context, state) {
              return Column(
                children: [
                  const AppTopBar(title: 'Personal details'),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(22),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            AppInputField(
                              label: 'Full name',
                              hint: 'Dilan Karimi',
                              controller: _nameController,
                              validator: Validators.name,
                              textCapitalization: TextCapitalization.words,
                              textInputAction: TextInputAction.next,
                              autofillHints: const [AutofillHints.name],
                            ),
                            const SizedBox(height: 16),
                            AppInputField(
                              label: 'Email address',
                              hint: 'you@example.com',
                              controller: _emailController,
                              keyboardType: TextInputType.emailAddress,
                              validator: Validators.email,
                              textInputAction: TextInputAction.next,
                              autofillHints: const [AutofillHints.email],
                            ),
                            const SizedBox(height: 16),
                            AppInputField(
                              label: 'Phone number',
                              hint: '+964 750 123 4567',
                              controller: _phoneController,
                              keyboardType: TextInputType.phone,
                              validator: Validators.phone,
                              autofillHints: const [AutofillHints.telephoneNumber],
                            ),
                            const SizedBox(height: 16),
                            AppInputField(
                              label: 'Date of birth (optional)',
                              hint: 'Not set',
                              controller: _birthdayController,
                              readOnly: true,
                              onTap: _pickDateOfBirth,
                              suffixIcon: _dateOfBirth == null
                                  ? Icon(
                                      Icons.calendar_today_rounded,
                                      size: 18,
                                      color: palette.textHint,
                                    )
                                  : IconButton(
                                      tooltip: 'Clear',
                                      icon: Icon(
                                        Icons.close_rounded,
                                        size: 18,
                                        color: palette.textHint,
                                      ),
                                      onPressed: () =>
                                          setState(() => _setDateOfBirth(null)),
                                    ),
                            ),
                            const SizedBox(height: 32),
                            AppButton(
                              label: 'Save changes',
                              isLoading: state.isSubmitting,
                              onTap: _save,
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
      ),
    );
  }
}
