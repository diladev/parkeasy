import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/connection/connectivity_wrapper.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';
import 'package:mobile/feature/profile/presentation/cubit/vehicles_cubit.dart';
import 'package:mobile/feature/profile/presentation/cubit/vehicles_state.dart';
import 'package:mobile/feature/profile/presentation/widgets/vehicle_tile.dart';

class MyVehiclesScreen extends StatelessWidget {
  const MyVehiclesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<VehiclesCubit>()..load(),
      child: const _MyVehiclesView(),
    );
  }
}

class _MyVehiclesView extends StatelessWidget {
  const _MyVehiclesView();

  /// Opens the form; when it comes back with a saved vehicle, reloads the list.
  Future<void> _openForm(BuildContext context, {Vehicle? vehicle}) async {
    final cubit = context.read<VehiclesCubit>();
    final saved = await AppRouter.toVehicleForm(context, vehicle: vehicle);
    if (saved != null) {
      await cubit.vehicleSaved(saved);
    }
  }

  Future<void> _delete(BuildContext context, Vehicle vehicle) async {
    final cubit = context.read<VehiclesCubit>();
    final confirmed = await showAppConfirmDialog(
      context,
      title: 'Delete ${vehicle.displayName}?',
      message: 'Plate ${vehicle.plateNumber} will be removed from your account.',
      confirmLabel: 'Delete',
      isDestructive: true,
    );
    if (confirmed) {
      await cubit.delete(vehicle);
    }
  }

  @override
  Widget build(BuildContext context) {
    return BaseScreenWrapper(
      child: Scaffold(
        body: SafeArea(
          child: BlocConsumer<VehiclesCubit, VehiclesState>(
            listenWhen: (previous, current) =>
                current.lastAction != null &&
                previous.lastAction != current.lastAction,
            listener: (context, state) {
              final action = state.lastAction!;
              context.showSnack(action.message, isError: action.isError);
            },
            builder: (context, state) {
              return Column(
                children: [
                  AppTopBar(
                    title: 'My vehicles',
                    trailing: IconButton(
                      tooltip: 'Add vehicle',
                      icon: const Icon(Icons.add_rounded, color: AppColors.teal),
                      onPressed: () => _openForm(context),
                    ),
                  ),
                  if (state.status == VehiclesStatus.loading &&
                      state.vehicles.isNotEmpty)
                    const LinearProgressIndicator(minHeight: 2),
                  Expanded(child: _buildBody(context, state)),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildBody(BuildContext context, VehiclesState state) {
    final cubit = context.read<VehiclesCubit>();

    if (state.vehicles.isEmpty) {
      return switch (state.status) {
        VehiclesStatus.loading => const Center(child: CircularProgressIndicator()),
        VehiclesStatus.failure => AppErrorView(
          message: state.errorMessage ?? "Couldn't load your vehicles.",
          onRetry: cubit.load,
        ),
        VehiclesStatus.loaded => _EmptyVehicles(onAdd: () => _openForm(context)),
      };
    }

    return RefreshIndicator(
      color: AppColors.teal,
      onRefresh: cubit.load,
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(22),
        itemCount: state.vehicles.length + 1,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          if (index == state.vehicles.length) {
            return Padding(
              padding: const EdgeInsets.only(top: 8),
              child: AppOutlinedButton(
                label: 'Add another vehicle',
                icon: Icons.add_rounded,
                onTap: () => _openForm(context),
              ),
            );
          }
          final vehicle = state.vehicles[index];
          return VehicleTile(
            vehicle: vehicle,
            isBusy: state.busyVehicleId == vehicle.id,
            onEdit: () => _openForm(context, vehicle: vehicle),
            onMakeDefault: () => cubit.setDefault(vehicle),
            onDelete: () => _delete(context, vehicle),
          );
        },
      ),
    );
  }
}

class _EmptyVehicles extends StatelessWidget {
  const _EmptyVehicles({required this.onAdd});

  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 76,
              height: 76,
              decoration: BoxDecoration(
                color: AppColors.tealBg,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: AppColors.teal, width: 1.5),
              ),
              child: const Icon(
                Icons.directions_car_rounded,
                size: 36,
                color: AppColors.tealLight,
              ),
            ),
            const SizedBox(height: 20),
            Text('No vehicles yet', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            Text(
              'Add your car so you can book a parking spot in one tap.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: palette.textMuted, height: 1.5),
            ),
            const SizedBox(height: 24),
            AppButton(label: 'Add a vehicle', icon: Icons.add_rounded, onTap: onAdd),
          ],
        ),
      ),
    );
  }
}
