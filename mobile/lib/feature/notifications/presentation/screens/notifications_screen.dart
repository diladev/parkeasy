import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/notifications/domain/entities/app_notification.dart';
import 'package:mobile/feature/notifications/presentation/cubit/notifications_cubit.dart';
import 'package:mobile/feature/notifications/presentation/cubit/notifications_state.dart';
import 'package:mobile/feature/notifications/presentation/widgets/notification_card.dart';
import 'package:mobile/feature/notifications/presentation/widgets/notifications_tab_bar.dart';

/// The inbox behind the bell on Home: booking and wallet updates, grouped
/// by day.
class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<NotificationsCubit>()..load(),
      child: AppScreen(
        topBar: AppTopBar(
          title: l10n.notifications,
          trailing: const _MarkAllReadButton(),
        ),
        body: const _NotificationsView(),
      ),
    );
  }
}

class _MarkAllReadButton extends StatelessWidget {
  const _MarkAllReadButton();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<NotificationsCubit, NotificationsState>(
      buildWhen: (previous, current) => previous.hasUnread != current.hasUnread,
      builder: (context, state) {
        if (!state.hasUnread) return const SizedBox.shrink();
        return GestureDetector(
          onTap: context.read<NotificationsCubit>().markAllRead,
          behavior: HitTestBehavior.opaque,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
            child: Text(
              l10n.markAllRead,
              style: const TextStyle(fontSize: 11, color: AppColors.teal),
            ),
          ),
        );
      },
    );
  }
}

class _NotificationsView extends StatelessWidget {
  const _NotificationsView();

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<NotificationsCubit>();

    return BlocConsumer<NotificationsCubit, NotificationsState>(
      // Errors while the list is on screen (refresh, next page, mark read).
      listenWhen: (previous, current) =>
          current.errorSerial != previous.errorSerial &&
          current.status == NotificationsStatus.loaded,
      listener: (context, state) =>
          context.showSnack(state.errorMessage!, isError: true),
      builder: (context, state) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            NotificationsTabBar(
              selected: state.tab,
              onSelected: cubit.selectTab,
            ),
            Expanded(child: _Body(state: state)),
          ],
        );
      },
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.state});

  final NotificationsState state;

  /// Day headings and cards, in one flat list.
  List<Widget> _items(BuildContext context) {
    final cubit = context.read<NotificationsCubit>();
    final items = <Widget>[];
    String? currentDay;

    for (final notification in state.notifications) {
      final day = Formatters.day(notification.createdAt);
      if (day != currentDay) {
        if (currentDay != null) items.add(const SizedBox(height: 10));
        items
          ..add(_DayHeading(day))
          ..add(const SizedBox(height: 10));
        currentDay = day;
      } else {
        items.add(const SizedBox(height: 10));
      }
      items.add(
        NotificationCard(
          notification: notification,
          onTap: () => cubit.markRead(notification),
        ),
      );
    }

    if (state.isLoadingMore) {
      items
        ..add(const SizedBox(height: 16))
        ..add(
          const Center(
            child: SizedBox(
              width: 22,
              height: 22,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          ),
        );
    }
    return items;
  }

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<NotificationsCubit>();

    if (state.notifications.isEmpty) {
      switch (state.status) {
        case NotificationsStatus.loading:
          return const Center(child: CircularProgressIndicator());
        case NotificationsStatus.failure:
          return AppErrorView(
            message: state.errorMessage ?? l10n.couldntLoadNotifications,
            onRetry: cubit.load,
          );
        case NotificationsStatus.loaded:
          break;
      }
    }

    return RefreshIndicator(
      color: AppColors.teal,
      onRefresh: cubit.load,
      child: NotificationListener<ScrollNotification>(
        // Load the next page a little before the end.
        onNotification: (notification) {
          if (notification.metrics.extentAfter < 200) cubit.loadMore();
          return false;
        },
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(22, 12, 22, 24),
          children: state.notifications.isEmpty
              ? [_EmptyInbox(tab: state.tab)]
              : _items(context),
        ),
      ),
    );
  }
}

class _DayHeading extends StatelessWidget {
  const _DayHeading(this.day);

  final String day;

  @override
  Widget build(BuildContext context) {
    return Text(
      day,
      style: TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.w500,
        color: context.palette.textHint,
      ),
    );
  }
}

class _EmptyInbox extends StatelessWidget {
  const _EmptyInbox({required this.tab});

  final NotificationsTab tab;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final message = switch (tab.category) {
      NotificationCategory.booking => l10n.bookingUpdatesHere,
      NotificationCategory.wallet => l10n.walletUpdatesHere,
      null => l10n.allUpdatesHere,
    };

    return Padding(
      padding: const EdgeInsets.only(top: 80),
      child: Column(
        children: [
          Text(
            l10n.noNotificationsYet,
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
      ),
    );
  }
}
