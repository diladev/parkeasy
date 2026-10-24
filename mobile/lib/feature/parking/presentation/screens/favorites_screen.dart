import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/constants/default_location.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/geo.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_summary.dart';
import 'package:mobile/feature/parking/presentation/cubit/favorites_cubit.dart';
import 'package:mobile/feature/parking/presentation/cubit/search_state.dart';
import 'package:mobile/feature/parking/presentation/widgets/lot_result_card.dart';

/// The lots the user saved with the heart on a lot's page.
class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<FavoritesCubit>()..load(),
      child: AppScreen(
        topBar: const AppTopBar(title: 'Favorites'),
        body: BlocConsumer<FavoritesCubit, FavoritesState>(
          listenWhen: (previous, current) =>
              current.errorSerial != previous.errorSerial &&
              current.status == FavoritesStatus.loaded,
          listener: (context, state) =>
              context.showSnack(state.errorMessage!, isError: true),
          builder: (context, state) => switch (state.status) {
            FavoritesStatus.loading => const Center(
              child: CircularProgressIndicator(),
            ),
            FavoritesStatus.failure => AppErrorView(
              message: state.errorMessage ?? "Couldn't load your favorites.",
              onRetry: context.read<FavoritesCubit>().load,
            ),
            FavoritesStatus.loaded => _FavoriteList(lots: state.lots),
          },
        ),
      ),
    );
  }
}

class _FavoriteList extends StatelessWidget {
  const _FavoriteList({required this.lots});

  final List<ParkingLotSummary> lots;

  /// Opens the lot, then reloads: its heart may have been tapped there.
  Future<void> _open(BuildContext context, ParkingLotSummary lot) async {
    final cubit = context.read<FavoritesCubit>();
    await AppRouter.toParkingDetails(context, lot.id);
    await cubit.load();
  }

  void _remove(BuildContext context, ParkingLotSummary lot) {
    final cubit = context.read<FavoritesCubit>();
    cubit.remove(lot);
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text('${lot.name} removed from favorites.'),
          action: SnackBarAction(
            label: 'Undo',
            textColor: AppColors.tealLight,
            onPressed: () => cubit.restore(lot),
          ),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<FavoritesCubit>();

    return RefreshIndicator(
      color: AppColors.teal,
      onRefresh: cubit.load,
      child: lots.isEmpty
          ? ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: const [_NoFavorites()],
            )
          : ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(22, 14, 22, 24),
              itemCount: lots.length,
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final lot = lots[index];
                return Dismissible(
                  key: ValueKey(lot.id),
                  direction: DismissDirection.endToStart,
                  onDismissed: (_) => _remove(context, lot),
                  background: const _RemoveBackground(),
                  child: LotResultCard(
                    result: SearchResult(
                      lot: lot,
                      // Like Search: from the city centre until Home and
                      // Search use the phone's location.
                      distanceKm: distanceKm(
                        DefaultLocation.latitude,
                        DefaultLocation.longitude,
                        lot.latitude,
                        lot.longitude,
                      ),
                    ),
                    onTap: () => _open(context, lot),
                  ),
                );
              },
            ),
    );
  }
}

/// What shows behind a card being swiped away.
class _RemoveBackground extends StatelessWidget {
  const _RemoveBackground();

  @override
  Widget build(BuildContext context) {
    return Container(
      alignment: AlignmentDirectional.centerEnd,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: AppColors.red12,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(LucideIcons.heartOff, size: 18, color: AppColors.red),
          SizedBox(width: 6),
          Text(
            'Remove',
            style: TextStyle(fontSize: 11, color: AppColors.red),
          ),
        ],
      ),
    );
  }
}

class _NoFavorites extends StatelessWidget {
  const _NoFavorites();

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Padding(
      padding: const EdgeInsets.fromLTRB(40, 100, 40, 24),
      child: Column(
        children: [
          Icon(LucideIcons.heart, size: 40, color: palette.textHint),
          const SizedBox(height: 14),
          Text(
            'No favorites yet',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: palette.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Tap the heart on a parking lot to keep it here.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 11, color: palette.textHint),
          ),
        ],
      ),
    );
  }
}
