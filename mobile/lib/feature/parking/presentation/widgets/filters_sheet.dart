import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/parking/presentation/cubit/search_cubit.dart';
import 'package:mobile/feature/parking/presentation/cubit/search_state.dart';

/// Opens the Filters sheet over the search results, starting from the
/// filters in use.
///
/// Completes with the filters to apply, or null if the sheet was dismissed.
/// The sheet follows [cubit], so its button can say how many lots the
/// choices would show, even if the search is still loading when it opens.
Future<SearchFilters?> showFiltersSheet(
  BuildContext context,
  SearchCubit cubit,
) {
  return showModalBottomSheet<SearchFilters>(
    context: context,
    isScrollControlled: true,
    backgroundColor: context.palette.surface,
    barrierColor: Colors.black.withValues(alpha: 0.55),
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: (_) => BlocProvider.value(
      value: cubit,
      child: _FiltersSheet(initial: cubit.state.filters),
    ),
  );
}

class _FiltersSheet extends StatefulWidget {
  const _FiltersSheet({required this.initial});

  final SearchFilters initial;

  @override
  State<_FiltersSheet> createState() => _FiltersSheetState();
}

class _FiltersSheetState extends State<_FiltersSheet> {
  /// The choices so far; only applied when "Show results" is tapped.
  late SearchFilters _filters = widget.initial;

  void _change(SearchFilters filters) => setState(() => _filters = filters);

  /// "Show 24 results", for the choices so far.
  String _showLabel(SearchState search) {
    if (search.status == SearchStatus.loading && search.found.isEmpty) {
      return l10n.showResults;
    }
    return switch (_filters.apply(search.found).length) {
      0 => l10n.noSpotsMatch,
      final count => l10n.showCountResults(count),
    };
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(22, 12, 22, 22),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const _Handle(),
            const SizedBox(height: 14),
            _Header(onReset: () => _change(const SearchFilters())),
            const SizedBox(height: 12),
            _SectionLabel(l10n.priceRangeLabel),
            _PriceRange(filters: _filters, onChanged: _change),
            const SizedBox(height: 13),
            _SectionLabel(l10n.distanceLabel),
            const SizedBox(height: 5),
            _ChoiceRow<DistanceLimit>(
              options: DistanceLimit.values,
              selected: _filters.distance,
              label: (limit) => limit.label,
              onSelected: (limit) =>
                  _change(_filters.copyWith(distance: limit)),
            ),
            const SizedBox(height: 16),
            _SectionLabel(l10n.amenitiesLabel),
            const SizedBox(height: 5),
            Wrap(
              spacing: 8,
              runSpacing: 10,
              children: [
                for (final amenity in Amenity.values)
                  _AmenityChip(
                    label: amenity.label,
                    isSelected: _filters.amenities.contains(amenity),
                    onTap: () => _change(_filters.toggle(amenity)),
                  ),
              ],
            ),
            const SizedBox(height: 10),
            _SectionLabel(l10n.sortByLabel),
            const SizedBox(height: 5),
            _ChoiceRow<SearchSort>(
              options: SearchSort.values,
              selected: _filters.sort,
              label: (sort) => sort.label,
              spacing: 10,
              onSelected: (sort) => _change(_filters.copyWith(sort: sort)),
            ),
            const SizedBox(height: 18),
            BlocBuilder<SearchCubit, SearchState>(
              buildWhen: (previous, current) =>
                  previous.found != current.found ||
                  previous.status != current.status,
              builder: (context, search) => AppButton(
                label: _showLabel(search),
                height: 48,
                onTap: () => Navigator.pop(context, _filters),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Handle extends StatelessWidget {
  const _Handle();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 30,
        height: 4,
        decoration: BoxDecoration(
          color: context.palette.border,
          borderRadius: BorderRadius.circular(2),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.onReset});

  final VoidCallback onReset;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            l10n.filters,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: context.palette.textPrimary,
            ),
          ),
        ),
        Semantics(
          button: true,
          child: GestureDetector(
            onTap: onReset,
            behavior: HitTestBehavior.opaque,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 4),
              child: Text(
                l10n.resetAll,
                style: const TextStyle(fontSize: 11, color: AppColors.teal),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Two handles on one track. The far right means "and more".
class _PriceRange extends StatelessWidget {
  const _PriceRange({required this.filters, required this.onChanged});

  final SearchFilters filters;
  final ValueChanged<SearchFilters> onChanged;

  static const double _top = SearchFilters.priceSliderMax + 0.0;

  /// "1,000 – 2,000 IQD / hr", "Any price".
  String get _label {
    final max = filters.maxPrice;
    if (filters.minPrice == 0 && max == null) return l10n.anyPrice;
    final upper = max == null
        ? '${Formatters.dinars(SearchFilters.priceSliderMax)}+'
        : Formatters.dinars(max);
    return l10n.priceRangePerHour(Formatters.dinars(filters.minPrice), upper);
  }

  void _onChanged(RangeValues values) {
    final min = values.start.round();
    final max = values.end.round();
    onChanged(
      filters.copyWith(
        minPrice: min,
        maxPrice: () => max >= SearchFilters.priceSliderMax ? null : max,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final hintStyle = TextStyle(fontSize: 9, color: palette.textHint);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SizedBox(
          height: 30,
          child: SliderTheme(
            data: SliderTheme.of(context).copyWith(
              trackHeight: 4,
              activeTrackColor: AppColors.teal,
              inactiveTrackColor: palette.surface2,
              thumbColor: Colors.white,
              overlayColor: AppColors.tealBg,
              activeTickMarkColor: Colors.transparent,
              inactiveTickMarkColor: Colors.transparent,
              showValueIndicator: ShowValueIndicator.never,
              rangeThumbShape: const RoundRangeSliderThumbShape(
                enabledThumbRadius: 7,
                elevation: 0,
                pressedElevation: 0,
              ),
              rangeTrackShape: const _FullWidthRangeTrack(),
              overlayShape: const RoundSliderOverlayShape(overlayRadius: 14),
            ),
            child: RangeSlider(
              min: 0,
              max: _top,
              divisions:
                  SearchFilters.priceSliderMax ~/ SearchFilters.priceStep,
              values: RangeValues(
                filters.minPrice.toDouble(),
                (filters.maxPrice ?? SearchFilters.priceSliderMax).toDouble(),
              ),
              semanticFormatterCallback: (value) =>
                  Formatters.money(value.round()),
              onChanged: _onChanged,
            ),
          ),
        ),
        const SizedBox(height: 2),
        Row(
          children: [
            Text('0', style: hintStyle),
            Expanded(
              child: Text(
                _label,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                  color: palette.textPrimary,
                ),
              ),
            ),
            Text(
              '${Formatters.dinars(SearchFilters.priceSliderMax)}+',
              style: hintStyle,
            ),
          ],
        ),
      ],
    );
  }
}

/// The track runs edge to edge, like the design, instead of leaving room
/// for the handles at both ends.
class _FullWidthRangeTrack extends RoundedRectRangeSliderTrackShape {
  const _FullWidthRangeTrack();

  @override
  Rect getPreferredRect({
    required RenderBox parentBox,
    Offset offset = Offset.zero,
    required SliderThemeData sliderTheme,
    bool isEnabled = false,
    bool isDiscrete = false,
  }) {
    final height = sliderTheme.trackHeight ?? 4;
    return Rect.fromLTWH(
      offset.dx,
      offset.dy + (parentBox.size.height - height) / 2,
      parentBox.size.width,
      height,
    );
  }
}

/// A row of equal boxes, one of them chosen: distance and sort.
class _ChoiceRow<T> extends StatelessWidget {
  const _ChoiceRow({
    required this.options,
    required this.selected,
    required this.label,
    required this.onSelected,
    this.spacing = 8,
  });

  final List<T> options;
  final T selected;
  final String Function(T option) label;
  final ValueChanged<T> onSelected;
  final double spacing;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (var i = 0; i < options.length; i++) ...[
          if (i > 0) SizedBox(width: spacing),
          Expanded(
            child: _Choice(
              label: label(options[i]),
              isSelected: options[i] == selected,
              onTap: () => onSelected(options[i]),
            ),
          ),
        ],
      ],
    );
  }
}

class _Choice extends StatelessWidget {
  const _Choice({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Semantics(
      button: true,
      selected: isSelected,
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Container(
          height: 32,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isSelected ? AppColors.tealBg : palette.surface2,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? AppColors.teal : palette.border,
              width: 0.5,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: isSelected ? AppColors.tealLight : palette.textHint,
            ),
          ),
        ),
      ),
    );
  }
}

class _AmenityChip extends StatelessWidget {
  const _AmenityChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Semantics(
      button: true,
      selected: isSelected,
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Container(
          height: 26,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isSelected ? AppColors.tealBg : palette.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected ? AppColors.teal : palette.border,
              width: 0.5,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 9,
              color: isSelected ? AppColors.tealLight : palette.textMuted,
            ),
          ),
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 9,
        fontWeight: FontWeight.w500,
        color: context.palette.textHint,
      ),
    );
  }
}
