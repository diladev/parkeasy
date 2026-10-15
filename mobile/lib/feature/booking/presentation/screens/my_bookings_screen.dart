import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/presentation/cubit/my_bookings_cubit.dart';
import 'package:mobile/feature/booking/presentation/cubit/my_bookings_state.dart';
import 'package:mobile/feature/booking/presentation/widgets/booking_list_card.dart';
import 'package:mobile/feature/booking/presentation/widgets/bookings_tab_bar.dart';

/// The Bookings tab: the active booking and past ones.
class MyBookingsScreen extends StatelessWidget {
  const MyBookingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<MyBookingsCubit>()..load(),
      child: const AppScreen(body: _MyBookingsView()),
    );
  }
}

class _MyBookingsView extends StatelessWidget {
  const _MyBookingsView();

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<MyBookingsCubit>();

    return BlocConsumer<MyBookingsCubit, MyBookingsState>(
      // A refresh or next page that failed while a list is on screen.
      listenWhen: (previous, current) =>
          current.current.status == BookingListStatus.loaded &&
          current.current.errorMessage != null &&
          current.current.errorMessage != previous.current.errorMessage,
      listener: (context, state) =>
          context.showSnack(state.current.errorMessage!, isError: true),
      builder: (context, state) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const _Header(),
            BookingsTabBar(selected: state.tab, onSelected: cubit.selectTab),
            Expanded(child: _BookingListView(tab: state.tab, list: state.current)),
          ],
        );
      },
    );
  }
}

class _Header extends StatelessWidget {
  const _Header();

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      height: 52,
      padding: const EdgeInsets.only(left: 22),
      alignment: Alignment.centerLeft,
      decoration: BoxDecoration(
        color: palette.bg,
        border: Border(bottom: BorderSide(color: palette.border, width: 0.5)),
      ),
      child: Text(
        'My bookings',
        style: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w500,
          color: palette.textPrimary,
        ),
      ),
    );
  }
}

class _BookingListView extends StatelessWidget {
  const _BookingListView({required this.tab, required this.list});

  final BookingsTab tab;
  final BookingList list;

  Future<void> _open(BuildContext context, Booking booking) async {
    final cubit = context.read<MyBookingsCubit>();
    await AppRouter.toBookingDetail(context, '${booking.id}');
    // It may have been extended or cancelled meanwhile.
    await cubit.load();
  }

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<MyBookingsCubit>();

    if (list.bookings.isEmpty) {
      switch (list.status) {
        case BookingListStatus.loading:
          return const Center(child: CircularProgressIndicator());
        case BookingListStatus.failure:
          return AppErrorView(
            message: list.errorMessage ?? "Couldn't load your bookings.",
            onRetry: cubit.load,
          );
        case BookingListStatus.loaded:
          break;
      }
    }

    return RefreshIndicator(
      color: AppColors.teal,
      onRefresh: cubit.load,
      child: NotificationListener<ScrollNotification>(
        // Load the next page of history a little before the end.
        onNotification: (notification) {
          if (tab == BookingsTab.history &&
              notification.metrics.extentAfter < 200) {
            cubit.loadMoreHistory();
          }
          return false;
        },
        child: list.bookings.isEmpty
            ? _EmptyList(tab: tab)
            : ListView.separated(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(22, 12, 22, 24),
                itemCount: list.bookings.length + (list.isLoadingMore ? 1 : 0),
                separatorBuilder: (_, _) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  if (index == list.bookings.length) {
                    return const Center(
                      child: SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    );
                  }
                  final booking = list.bookings[index];
                  return BookingListCard(
                    booking: booking,
                    onTap: () => _open(context, booking),
                  );
                },
              ),
      ),
    );
  }
}

/// Scrollable, so pull-to-refresh still works on an empty list.
class _EmptyList extends StatelessWidget {
  const _EmptyList({required this.tab});

  final BookingsTab tab;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final (title, message) = switch (tab) {
      BookingsTab.active => (
        'No active booking',
        'Book a slot and it will show up here.',
      ),
      BookingsTab.history => (
        'No past bookings yet',
        'Bookings you finished or cancelled show up here.',
      ),
    };

    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(22, 80, 22, 24),
      children: [
        Text(
          title,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: palette.textPrimary,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          message,
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 11, color: palette.textHint),
        ),
      ],
    );
  }
}
