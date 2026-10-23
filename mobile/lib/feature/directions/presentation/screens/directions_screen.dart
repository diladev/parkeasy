import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/directions/domain/entities/map_app.dart';
import 'package:mobile/feature/directions/presentation/cubit/directions_cubit.dart';
import 'package:mobile/feature/directions/presentation/widgets/map_app_tile.dart';
import 'package:mobile/feature/directions/presentation/widgets/route_preview_map.dart';
import 'package:mobile/feature/location/presentation/cubit/location_cubit.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_details.dart';

/// "Get directions" to a lot: a preview, and the map apps to navigate with.
class DirectionsScreen extends StatelessWidget {
  const DirectionsScreen({super.key, required this.lotId, this.slotLabel});

  final int lotId;

  /// "Slot A04", when coming from a booking.
  final String? slotLabel;

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => sl<DirectionsCubit>()..load(lotId)),
        // Only for the preview and distance: the map app finds the user
        // itself, so directions work without location too.
        BlocProvider(create: (_) => sl<LocationCubit>()..locate()),
      ],
      child: AppScreen(
        topBar: const AppTopBar(title: 'Get directions'),
        body: BlocBuilder<DirectionsCubit, DirectionsState>(
          builder: (context, state) {
            final lot = state.lot;
            if (lot != null) {
              return _Directions(lot: lot, state: state, slotLabel: slotLabel);
            }
            if (state.status == DirectionsStatus.failure) {
              return AppErrorView(
                message: state.errorMessage ?? "Couldn't load this lot.",
                onRetry: () => context.read<DirectionsCubit>().load(lotId),
              );
            }
            return const Center(child: CircularProgressIndicator());
          },
        ),
      ),
    );
  }
}

class _Directions extends StatelessWidget {
  const _Directions({required this.lot, required this.state, this.slotLabel});

  final ParkingLotDetails lot;
  final DirectionsState state;
  final String? slotLabel;

  /// When no app opens (e.g. an emulator without Maps or a browser), the
  /// coordinates can still be pasted somewhere.
  Future<void> _open(BuildContext context, MapApp app) async {
    final opened = await context.read<DirectionsCubit>().open(app);
    if (opened || !context.mounted) return;
    await Clipboard.setData(
      ClipboardData(text: '${lot.latitude},${lot.longitude}'),
    );
    if (context.mounted) {
      context.showSnack(
        "Couldn't open ${app.label}. The lot's coordinates were copied.",
        isError: true,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final destination = state.destination!;
    final subtitle = [
      if (lot.address.isNotEmpty) lot.address,
      ?slotLabel,
    ].join(' · ');

    return ListView(
      padding: const EdgeInsets.only(bottom: 24),
      children: [
        BlocBuilder<LocationCubit, LocationState>(
          buildWhen: (previous, current) => previous.point != current.point,
          builder: (context, location) =>
              RoutePreviewMap(destination: destination, user: location.point),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(22, 14, 22, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: palette.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: palette.border, width: 0.5),
                ),
                child: Row(
                  children: [
                    const AppIconBox(
                      glyph: 'P',
                      color: AppColors.textPrimary,
                      background: AppColors.blue35,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            lot.name,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: palette.textPrimary,
                            ),
                          ),
                          if (subtitle.isNotEmpty) ...[
                            const SizedBox(height: 3),
                            Text(
                              subtitle,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 10,
                                color: palette.textHint,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              Text(
                'OPEN WITH',
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w500,
                  color: palette.textHint,
                ),
              ),
              const SizedBox(height: 7),
              for (final (index, app) in state.apps.indexed) ...[
                if (index > 0) const SizedBox(height: 8),
                MapAppTile(
                  name: app.label,
                  isRecommended: index == 0,
                  onTap: () => _open(context, app),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}
