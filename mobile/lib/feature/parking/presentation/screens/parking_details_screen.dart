import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/constants/default_location.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/utils/geo.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/booking/domain/entities/booking_draft.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_details.dart';
import 'package:mobile/feature/parking/presentation/cubit/parking_details_cubit.dart';
import 'package:mobile/feature/parking/presentation/cubit/parking_details_state.dart';
import 'package:mobile/feature/parking/presentation/widgets/booking_bar.dart';
import 'package:mobile/feature/parking/presentation/widgets/lot_feature_tags.dart';
import 'package:mobile/feature/parking/presentation/widgets/lot_price_info.dart';
import 'package:mobile/feature/parking/presentation/widgets/lot_stat_tile.dart';
import 'package:mobile/feature/parking/presentation/widgets/parking_details_header.dart';
import 'package:mobile/feature/parking/presentation/widgets/slot_picker.dart';

/// One lot: its price, rating, hours and features, and its slots to pick from.
class ParkingDetailsScreen extends StatelessWidget {
  const ParkingDetailsScreen({super.key, required this.lotId});

  final int lotId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<ParkingDetailsCubit>()..load(lotId),
      child: _ParkingDetailsView(lotId: lotId),
    );
  }
}

class _ParkingDetailsView extends StatelessWidget {
  const _ParkingDetailsView({required this.lotId});

  final int lotId;

  @override
  Widget build(BuildContext context) {
    return AppScreen(
      body: BlocConsumer<ParkingDetailsCubit, ParkingDetailsState>(
        // A refresh that failed while the lot is on screen: say so, keep the lot.
        listenWhen: (previous, current) =>
            current.lot != null &&
            current.errorMessage != null &&
            current.errorMessage != previous.errorMessage,
        listener: (context, state) =>
            context.showSnack(state.errorMessage!, isError: true),
        builder: (context, state) {
          final lot = state.lot;
          if (lot != null) return _LotDetails(lot: lot, state: state);

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 10, 14, 0),
                child: BackToMapLink(onTap: () => Navigator.pop(context)),
              ),
              Expanded(
                child: state.status == ParkingDetailsStatus.failure
                    ? AppErrorView(
                        message:
                            state.errorMessage ?? l10n.couldntLoadParkingLot,
                        onRetry: () =>
                            context.read<ParkingDetailsCubit>().load(lotId),
                      )
                    : const Center(child: CircularProgressIndicator()),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _LotDetails extends StatelessWidget {
  const _LotDetails({required this.lot, required this.state});

  final ParkingLotDetails lot;
  final ParkingDetailsState state;

  static const double _sidePadding = 22;

  String get _addressLine {
    final distance = distanceKm(
      DefaultLocation.latitude,
      DefaultLocation.longitude,
      lot.latitude,
      lot.longitude,
    );
    return [
      if (lot.address.isNotEmpty) lot.address,
      Formatters.distance(distance),
    ].join(' · ');
  }

  String get _hours => lot.isOpen24h
      ? l10n.open24hShort
      : '${lot.openingTime}–${lot.closingTime}';

  String get _rating =>
      lot.rating > 0 ? '${lot.rating.toStringAsFixed(1)} ★' : l10n.newLot;

  List<String> get _features => [
    if (lot.hasCctv) l10n.cctv,
    if (lot.hasEvCharging) l10n.evCharge,
    if (lot.isCovered) l10n.covered,
    if (lot.isAccessible) l10n.accessible,
  ];

  void _book(BuildContext context) {
    final slot = state.selectedSlot;
    if (slot == null) return;
    AppRouter.toPayment(
      context,
      BookingDraft(
        lotId: lot.id,
        lotName: lot.name,
        slotId: slot.id,
        slotNumber: slot.slotNumber,
        level: slot.level,
        pricePerHour: lot.pricePerHour,
        priceRules: lot.priceRules,
        freeCancellationMinutes: lot.freeCancellationMinutes,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<ParkingDetailsCubit>();
    final features = _features;
    final now = DateTime.now();
    // A special price today (Eid, Newroz...) replaces the normal one.
    final pricePerHour = lot.priceRules.priceAt(now).pricePerHour;

    return RefreshIndicator(
      color: AppColors.teal,
      onRefresh: () => cubit.load(lot.id),
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.only(bottom: 24),
        children: [
          ParkingDetailsHeader(
            name: lot.name,
            addressLine: _addressLine,
            onBack: () => Navigator.pop(context),
            isFavorite: state.isFavorite,
            onToggleFavorite: cubit.toggleFavorite,
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(
              _sidePadding,
              10,
              _sidePadding,
              14,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: LotStatTile(
                        value: '${lot.availableSlots}',
                        label: l10n.freeSlots,
                        isHighlighted: true,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: LotStatTile(
                        value: Formatters.dinars(pricePerHour),
                        label: l10n.iqdPerHour,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: LotStatTile(value: _rating, label: l10n.rating),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: LotStatTile(value: _hours, label: l10n.open),
                    ),
                  ],
                ),
                LotPriceInfo(rules: lot.priceRules, now: now),
                const SizedBox(height: 14),
                if (features.isNotEmpty) ...[
                  LotFeatureTags(labels: features),
                  const SizedBox(height: 8),
                ],
                SlotPicker(
                  levels: lot.levels,
                  level: state.level,
                  slots: state.levelSlots,
                  selectedSlot: state.selectedSlot,
                  onLevelChanged: cubit.selectLevel,
                  onSlotTap: cubit.selectSlot,
                ),
              ],
            ),
          ),
          Divider(height: 1, thickness: 1, color: context.palette.border),
          BookingBar(
            pricePerHour: pricePerHour,
            selectedSlot: state.selectedSlot,
            onBook: () => _book(context),
          ),
        ],
      ),
    );
  }
}
