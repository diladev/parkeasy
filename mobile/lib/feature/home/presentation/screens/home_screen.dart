import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/feature/home/presentation/cubit/home_cubit.dart';
import 'package:mobile/feature/home/presentation/cubit/home_state.dart';
import 'package:mobile/feature/home/presentation/widgets/find_nearby_banner.dart';
import 'package:mobile/feature/home/presentation/widgets/home_header.dart';
import 'package:mobile/feature/home/presentation/widgets/home_search_bar.dart';
import 'package:mobile/feature/home/presentation/widgets/quick_action_button.dart';
import 'package:mobile/feature/home/presentation/widgets/recent_booking_card.dart';
import 'package:mobile/feature/home/presentation/widgets/regular_lot_card.dart';

/// The home tab.
///
/// [onOpenMap] and [onOpenBookings] switch to the other tabs of the shell
/// instead of pushing a new screen on top of it.
class HomeScreen extends StatelessWidget {
  const HomeScreen({
    super.key,
    required this.onOpenMap,
    required this.onOpenBookings,
  });

  final VoidCallback onOpenMap;
  final VoidCallback onOpenBookings;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<HomeCubit>()..load(),
      child: _HomeView(onOpenMap: onOpenMap, onOpenBookings: onOpenBookings),
    );
  }
}

class _HomeView extends StatelessWidget {
  const _HomeView({required this.onOpenMap, required this.onOpenBookings});

  final VoidCallback onOpenMap;
  final VoidCallback onOpenBookings;

  static const double _sidePadding = 22;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: false,
      child: BlocBuilder<HomeCubit, HomeState>(
        builder: (context, state) {
          return RefreshIndicator(
            color: AppColors.teal,
            onRefresh: context.read<HomeCubit>().load,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.only(bottom: 24),
              children: [
                HomeHeader(
                  hasUnread: state.unreadNotifications > 0,
                  onNotifications: () =>
                      AppRouter.toNotificationsInbox(context),
                ),
                const SizedBox(height: 8),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: _sidePadding),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      HomeSearchBar(
                        onSearch: () => AppRouter.toSearchResults(context, ''),
                        onFilters: () => AppRouter.toSearchResults(context, ''),
                      ),
                      const SizedBox(height: 18),
                      _QuickActions(
                        onFindSpot: onOpenMap,
                        onScanQr: () => AppRouter.toScanQr(context),
                        onFavorites: () => AppRouter.toFavorites(context),
                        onHistory: onOpenBookings,
                      ),
                      const SizedBox(height: 18),
                      FindNearbyBanner(
                        isLoading: state.status == HomeStatus.loading,
                        spotsNearby: state.spotsNearby,
                        onFind: onOpenMap,
                      ),
                      if (state.regulars.isNotEmpty) ...[
                        const SizedBox(height: 18),
                        _SectionHeader(
                          title: 'Your regulars',
                          action: 'View all',
                          onAction: onOpenBookings,
                        ),
                        const SizedBox(height: 8),
                        _RegularsCarousel(lots: state.regulars),
                      ],
                      if (state.recentBookings.isNotEmpty) ...[
                        const SizedBox(height: 18),
                        _SectionHeader(
                          title: 'Recent bookings',
                          action: 'See all',
                          onAction: onOpenBookings,
                        ),
                        const SizedBox(height: 8),
                        for (final booking in state.recentBookings) ...[
                          RecentBookingCard(
                            booking: booking,
                            onTap: () => AppRouter.toBookingDetail(
                              context,
                              '${booking.id}',
                            ),
                          ),
                          const SizedBox(height: 8),
                        ],
                      ],
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  const _QuickActions({
    required this.onFindSpot,
    required this.onScanQr,
    required this.onFavorites,
    required this.onHistory,
  });

  final VoidCallback onFindSpot;
  final VoidCallback onScanQr;
  final VoidCallback onFavorites;
  final VoidCallback onHistory;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        QuickActionButton(
          icon: LucideIcons.search300,
          label: 'Find spot',
          onTap: onFindSpot,
          isPrimary: true,
        ),
        const SizedBox(width: 16),
        QuickActionButton(
          icon: LucideIcons.scanQrCode300,
          label: 'Scan QR',
          onTap: onScanQr,
        ),
        const SizedBox(width: 16),
        QuickActionButton(
          icon: LucideIcons.heart300,
          label: 'Favorites',
          onTap: onFavorites,
        ),
        const SizedBox(width: 16),
        QuickActionButton(
          icon: LucideIcons.history300,
          label: 'History',
          onTap: onHistory,
        ),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.title,
    required this.action,
    required this.onAction,
  });

  final String title;
  final String action;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: context.palette.textPrimary,
            ),
          ),
        ),
        GestureDetector(
          onTap: onAction,
          behavior: HitTestBehavior.opaque,
          child: Text(
            action,
            style: const TextStyle(fontSize: 11, color: AppColors.teal),
          ),
        ),
      ],
    );
  }
}

/// One full-width card per lot; swipe sideways for the next one.
class _RegularsCarousel extends StatelessWidget {
  const _RegularsCarousel({required this.lots});

  final List<RegularLot> lots;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 100,
      child: PageView.builder(
        itemCount: lots.length,
        itemBuilder: (context, index) {
          final lot = lots[index];
          return RegularLotCard(
            lot: lot,
            onTap: () => AppRouter.toParkingDetails(context, lot.lotId),
          );
        },
      ),
    );
  }
}
