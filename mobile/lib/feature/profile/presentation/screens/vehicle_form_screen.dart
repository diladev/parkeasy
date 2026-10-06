import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/connection/connectivity_wrapper.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/state/submit_state.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/validators.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';
import 'package:mobile/feature/profile/presentation/cubit/vehicle_form_cubit.dart';

/// Adds a vehicle, or edits [vehicle] when it's given.
///
/// With [isOnboarding] it's step 3 of sign-up ("Add your vehicle"): no back
/// button, a Skip button, and it continues to the location screen.
class VehicleFormScreen extends StatelessWidget {
  const VehicleFormScreen({super.key, this.vehicle, this.isOnboarding = false});

  final Vehicle? vehicle;
  final bool isOnboarding;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<VehicleFormCubit>(),
      child: _VehicleFormView(vehicle: vehicle, isOnboarding: isOnboarding),
    );
  }
}

class _VehicleFormView extends StatefulWidget {
  const _VehicleFormView({required this.vehicle, required this.isOnboarding});

  final Vehicle? vehicle;
  final bool isOnboarding;

  @override
  State<_VehicleFormView> createState() => _VehicleFormViewState();
}

class _VehicleFormViewState extends State<_VehicleFormView> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _brandController;
  late final TextEditingController _modelController;
  late final TextEditingController _yearController;
  late final TextEditingController _colorController;
  late final TextEditingController _plateController;
  late VehicleType _type;

  bool get _isEditing => widget.vehicle != null;

  @override
  void initState() {
    super.initState();
    final vehicle = widget.vehicle;
    _brandController = TextEditingController(text: vehicle?.brand ?? '');
    _modelController = TextEditingController(text: vehicle?.model ?? '');
    _yearController = TextEditingController(text: vehicle?.year.toString() ?? '');
    _colorController = TextEditingController(text: vehicle?.color ?? '');
    _plateController = TextEditingController(text: vehicle?.plateNumber ?? '');
    _type = vehicle?.type ?? VehicleType.sedan;
  }

  @override
  void dispose() {
    _brandController.dispose();
    _modelController.dispose();
    _yearController.dispose();
    _colorController.dispose();
    _plateController.dispose();
    super.dispose();
  }

  void _submit() {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;
    context.read<VehicleFormCubit>().submit(
      vehicleId: widget.vehicle?.id,
      brand: _brandController.text.trim(),
      model: _modelController.text.trim(),
      year: int.parse(_yearController.text.trim()),
      color: _colorController.text.trim(),
      // Same clean-up the API does: single spaces, upper case.
      plateNumber: _plateController.text.trim().replaceAll(RegExp(r'\s+'), ' ').toUpperCase(),
      type: _type,
    );
  }

  void _onSaved(Vehicle vehicle) {
    if (widget.isOnboarding) {
      AppRouter.toLocationPermission(context);
    } else {
      context.showSnack(_isEditing ? 'Vehicle updated.' : 'Vehicle added.');
      Navigator.pop(context, vehicle);
    }
  }

  String get _title {
    if (widget.isOnboarding) return 'Add your vehicle';
    return _isEditing ? 'Edit vehicle' : 'Add vehicle';
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return BaseScreenWrapper(
      child: Scaffold(
        body: SafeArea(
          child: BlocConsumer<VehicleFormCubit, SubmitState<Vehicle>>(
            listener: (context, state) {
              if (state.status == SubmitStatus.success && state.data != null) {
                _onSaved(state.data!);
              } else if (state.status == SubmitStatus.failure) {
                context.showSnack(
                  state.message ?? "Couldn't save the vehicle.",
                  isError: true,
                );
              }
            },
            builder: (context, state) {
              return Column(
                children: [
                  AppTopBar(
                    title: _title,
                    showBack: !widget.isOnboarding,
                    trailing: widget.isOnboarding
                        ? TextButton(
                            onPressed: () => AppRouter.toLocationPermission(context),
                            child: const Text('Skip'),
                          )
                        : null,
                  ),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(22),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            if (widget.isOnboarding) ...[
                              const _StepDots(filled: 3),
                              const SizedBox(height: 16),
                              Text(
                                'Add the car you park most often. You can add more, or change it, later in your profile.',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: palette.textMuted,
                                  height: 1.5,
                                ),
                              ),
                              const SizedBox(height: 24),
                            ],
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: AppInputField(
                                    label: 'Brand',
                                    hint: 'Toyota',
                                    controller: _brandController,
                                    textCapitalization: TextCapitalization.words,
                                    textInputAction: TextInputAction.next,
                                    validator: Validators.text(min: 2, max: 40),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: AppInputField(
                                    label: 'Model',
                                    hint: 'Camry',
                                    controller: _modelController,
                                    textCapitalization: TextCapitalization.words,
                                    textInputAction: TextInputAction.next,
                                    validator: Validators.text(max: 40),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: _YearField(controller: _yearController),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: AppInputField(
                                    label: 'Color',
                                    hint: 'Silver',
                                    controller: _colorController,
                                    textCapitalization: TextCapitalization.words,
                                    textInputAction: TextInputAction.next,
                                    validator: Validators.text(min: 2, max: 30),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            AppInputField(
                              label: 'License plate',
                              hint: '22 SUL 12345',
                              controller: _plateController,
                              textCapitalization: TextCapitalization.characters,
                              validator: Validators.plate,
                            ),
                            const SizedBox(height: 20),
                            Text(
                              'Type',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                                color: palette.textMuted,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8,
                              children: [
                                for (final type in VehicleType.values)
                                  ChoiceChip(
                                    label: Text(type.label),
                                    selected: _type == type,
                                    showCheckmark: false,
                                    selectedColor: AppColors.tealBg,
                                    side: BorderSide(
                                      color: _type == type ? AppColors.teal : palette.border,
                                    ),
                                    labelStyle: TextStyle(
                                      fontSize: 12,
                                      color: _type == type ? AppColors.tealLight : palette.textMuted,
                                    ),
                                    onSelected: (_) => setState(() => _type = type),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 32),
                            AppButton(
                              label: _isEditing ? 'Save changes' : 'Save vehicle',
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
      ),
    );
  }
}

class _YearField extends StatelessWidget {
  const _YearField({required this.controller});

  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Year',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: palette.textMuted,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          keyboardType: TextInputType.number,
          textInputAction: TextInputAction.next,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(4),
          ],
          validator: Validators.vehicleYear,
          style: TextStyle(fontSize: 13, color: palette.textPrimary),
          decoration: const InputDecoration(hintText: '2021'),
        ),
      ],
    );
  }
}

/// The same progress dots as the sign-up screen (step 3 of 3).
class _StepDots extends StatelessWidget {
  const _StepDots({required this.filled});

  final int filled;

  @override
  Widget build(BuildContext context) {
    final empty = context.palette.surface2;
    return Row(
      children: List.generate(
        3,
        (i) => Container(
          width: i < filled ? 28 : 7,
          height: 7,
          margin: const EdgeInsets.only(right: 6),
          decoration: BoxDecoration(
            color: i < filled ? AppColors.teal : empty,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
      ),
    );
  }
}
