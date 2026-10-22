import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/parking/presentation/cubit/search_cubit.dart';
import 'package:mobile/feature/parking/presentation/cubit/search_state.dart';
import 'package:mobile/feature/parking/presentation/widgets/filters_sheet.dart';
import 'package:mobile/feature/parking/presentation/widgets/lot_result_card.dart';
import 'package:mobile/feature/parking/presentation/widgets/search_chip.dart';
import 'package:mobile/feature/parking/presentation/widgets/search_field.dart';

/// Finds lots by name or address. With nothing typed, it lists every lot
/// around the user.
class SearchScreen extends StatelessWidget {
  const SearchScreen({
    super.key,
    this.initialQuery = '',
    this.openFilters = false,
  });

  final String initialQuery;

  /// Opens the Filters sheet right away (the filter button on Home).
  final bool openFilters;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<SearchCubit>(param1: initialQuery)..search(),
      child: AppScreen(
        body: _SearchView(openFilters: openFilters),
        // Search belongs to the home tab, so the tab bar stays visible.
        bottomBar: AppBottomNav(
          currentIndex: 0,
          onTap: (tab) => tab == 0
              ? Navigator.pop(context)
              : AppRouter.toHome(context, tab: tab),
        ),
      ),
    );
  }
}

class _SearchView extends StatefulWidget {
  const _SearchView({required this.openFilters});

  final bool openFilters;

  @override
  State<_SearchView> createState() => _SearchViewState();
}

class _SearchViewState extends State<_SearchView> {
  @override
  void initState() {
    super.initState();
    if (widget.openFilters) {
      // After the first frame: a sheet can't open while the screen builds.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _openFilters();
      });
    }
  }

  Future<void> _openFilters() async {
    final cubit = context.read<SearchCubit>();
    final filters = await showFiltersSheet(context, cubit);
    if (filters != null && !cubit.isClosed) cubit.applyFilters(filters);
  }

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<SearchCubit>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(14, 10, 8, 0),
          child: Row(
            children: [
              Expanded(
                child: SearchField(
                  initialText: cubit.state.query,
                  onChanged: cubit.queryChanged,
                  onSubmitted: cubit.search,
                  onClose: () => Navigator.maybePop(context),
                ),
              ),
              const SizedBox(width: 8),
              _FiltersButton(onTap: _openFilters),
            ],
          ),
        ),
        const SizedBox(height: 10),
        const _Chips(),
        const SizedBox(height: 8),
        const Expanded(child: _Results()),
      ],
    );
  }
}

class _FiltersButton extends StatelessWidget {
  const _FiltersButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: 'Filters',
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: 34,
          height: 44,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.purple35,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: context.palette.border, width: 0.5),
          ),
          child: const Icon(
            LucideIcons.settings2,
            size: 24,
            color: AppColors.purple,
          ),
        ),
      ),
    );
  }
}

class _Chips extends StatelessWidget {
  const _Chips();

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<SearchCubit>();

    return BlocBuilder<SearchCubit, SearchState>(
      buildWhen: (previous, current) => previous.filters != current.filters,
      builder: (context, state) {
        final filters = state.filters;
        return SizedBox(
          height: 24,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 14),
            children: [
              SearchChip(
                label: 'Nearest',
                isSelected: filters.sort == SearchSort.nearest,
                onTap: () => cubit.sortBy(SearchSort.nearest),
              ),
              const SizedBox(width: 8),
              SearchChip(
                label: 'Price',
                isSelected: filters.sort == SearchSort.cheapest,
                onTap: () => cubit.sortBy(SearchSort.cheapest),
              ),
              const SizedBox(width: 8),
              SearchChip(
                label: 'EV',
                isSelected: filters.amenities.contains(Amenity.evCharging),
                onTap: () => cubit.toggleAmenity(Amenity.evCharging),
              ),
              const SizedBox(width: 8),
              SearchChip(
                label: 'Covered',
                isSelected: filters.amenities.contains(Amenity.covered),
                onTap: () => cubit.toggleAmenity(Amenity.covered),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _Results extends StatelessWidget {
  const _Results();

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<SearchCubit>();

    return BlocBuilder<SearchCubit, SearchState>(
      builder: (context, state) {
        final results = state.results;

        final Widget body;
        if (state.status == SearchStatus.loading && state.found.isEmpty) {
          body = const Center(child: CircularProgressIndicator());
        } else if (state.status == SearchStatus.failure) {
          body = AppErrorView(
            message: state.errorMessage ?? "Couldn't search parking lots.",
            onRetry: cubit.search,
          );
        } else if (results.isEmpty) {
          body = _NoResults(isFiltered: state.found.isNotEmpty);
        } else {
          body = ListView.separated(
            padding: const EdgeInsets.fromLTRB(22, 10, 22, 24),
            itemCount: results.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final result = results[index];
              return LotResultCard(
                result: result,
                onTap: () => AppRouter.toParkingDetails(context, result.lot.id),
              );
            },
          );
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _ResultBar(
              count: state.status == SearchStatus.loaded ? results.length : null,
              isSearching: state.status == SearchStatus.loading,
            ),
            Expanded(child: body),
          ],
        );
      },
    );
  }
}

/// "24 spots found" and the list / map switch.
class _ResultBar extends StatelessWidget {
  const _ResultBar({required this.count, required this.isSearching});

  /// Null while there's no answer yet.
  final int? count;
  final bool isSearching;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final found = count;
    final label = switch (found) {
      null => isSearching ? 'Searching...' : '',
      1 => '1 spot found',
      _ => '$found spots found',
    };

    return Container(
      height: 40,
      padding: const EdgeInsets.only(left: 22, right: 14),
      decoration: BoxDecoration(
        border: Border.symmetric(
          horizontal: BorderSide(color: palette.border, width: 0.5),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: TextStyle(fontSize: 11, color: palette.textMuted),
            ),
          ),
          const _ViewToggle(symbol: '≡', isSelected: true, onTap: null),
          const SizedBox(width: 6),
          _ViewToggle(
            symbol: '◫',
            isSelected: false,
            onTap: () => AppRouter.toHome(context, tab: AppRouter.mapTab),
          ),
        ],
      ),
    );
  }
}

/// List view (this screen) or map view (the Map tab).
class _ViewToggle extends StatelessWidget {
  const _ViewToggle({
    required this.symbol,
    required this.isSelected,
    required this.onTap,
  });

  final String symbol;
  final bool isSelected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Semantics(
      button: true,
      selected: isSelected,
      label: isSelected ? 'List view' : 'Map view',
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: 28,
          height: 28,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isSelected ? AppColors.tealBg : palette.surface,
            borderRadius: BorderRadius.circular(7),
            border: Border.all(
              color: isSelected ? AppColors.teal : palette.border,
              width: 0.5,
            ),
          ),
          child: Text(
            symbol,
            style: TextStyle(
              fontSize: isSelected ? 16 : 14,
              color: isSelected ? AppColors.tealLight : palette.textHint,
            ),
          ),
        ),
      ),
    );
  }
}

class _NoResults extends StatelessWidget {
  const _NoResults({required this.isFiltered});

  /// Lots were found, but the filters hide them all.
  final bool isFiltered;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final (title, message) = isFiltered
        ? ('No spots match these filters', 'Change or reset the filters.')
        : ('No parking found', 'Try another name or street.');

    return ListView(
      padding: const EdgeInsets.fromLTRB(22, 60, 22, 24),
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
