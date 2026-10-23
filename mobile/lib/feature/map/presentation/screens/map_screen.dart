import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile/core/config/map_config.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/core/widgets/map/app_tile_layer.dart';
import 'package:mobile/core/widgets/map/map_attribution.dart';
import 'package:mobile/core/widgets/map/parking_pin.dart';
import 'package:mobile/feature/location/domain/entities/geo_point.dart';
import 'package:mobile/feature/location/presentation/cubit/location_cubit.dart';
import 'package:mobile/feature/map/presentation/cubit/map_cubit.dart';
import 'package:mobile/feature/map/presentation/cubit/map_state.dart';
import 'package:mobile/feature/map/presentation/widgets/location_banner.dart';
import 'package:mobile/feature/map/presentation/widgets/lot_callout.dart';
import 'package:mobile/feature/map/presentation/widgets/map_search_bar.dart';
import 'package:mobile/feature/map/presentation/widgets/nearby_sheet.dart';

/// The Map tab: every lot as a pin, the user's position, and the lots as a
/// list underneath. It works without location: it then opens on central
/// Sulaymaniyah and shows no distances.
class MapScreen extends StatelessWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => sl<MapCubit>()..load()),
        // Quietly: only uses the location if it's already allowed.
        BlocProvider(create: (_) => sl<LocationCubit>()..locate()),
      ],
      child: const _MapView(),
    );
  }
}

class _MapView extends StatefulWidget {
  const _MapView();

  @override
  State<_MapView> createState() => _MapViewState();
}

class _MapViewState extends State<_MapView> with WidgetsBindingObserver {
  final MapController _map = MapController();
  bool _isMapReady = false;

  /// Once the user pans the map, a new location fix doesn't move it.
  bool _userMovedMap = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _map.dispose();
    super.dispose();
  }

  /// Back from Settings: the user may have turned location on.
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state != AppLifecycleState.resumed) return;
    final location = context.read<LocationCubit>();
    if (location.state.status != LocationStatus.ready) location.locate();
  }

  void _moveTo(GeoPoint point, {double? zoom}) {
    if (!_isMapReady) return;
    _map.move(
      LatLng(point.latitude, point.longitude),
      zoom ?? _map.camera.zoom,
    );
  }

  /// The locate button: asks for permission if needed, then centres.
  Future<void> _locate() async {
    final location = context.read<LocationCubit>();
    await location.locate(askPermission: true);
    final point = location.state.point;
    if (!mounted || point == null) return;
    _userMovedMap = false;
    _moveTo(point, zoom: MapConfig.userZoom);
  }

  void _showLot(MapLot lot) {
    context.read<MapCubit>().select(lot.lot.id);
    _moveTo(
      lot.point,
      zoom: _isMapReady && _map.camera.zoom > MapConfig.userZoom
          ? null
          : MapConfig.userZoom,
    );
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final topInset = MediaQuery.paddingOf(context).top;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
        statusBarBrightness: isDark ? Brightness.dark : Brightness.light,
      ),
      child: BlocListener<LocationCubit, LocationState>(
        listenWhen: (previous, current) => previous.point != current.point,
        listener: (context, location) {
          final point = location.point;
          context.read<MapCubit>().userLocationChanged(point);
          if (point != null && !_userMovedMap) {
            _moveTo(point, zoom: MapConfig.userZoom);
          }
        },
        child: ColoredBox(
          color: palette.bg,
          child: Stack(
            children: [
              Positioned.fill(child: _buildMap()),
              Positioned(
                top: topInset + 10,
                left: 10,
                right: 10,
                child: _TopControls(onLocate: _locate),
              ),
              BlocBuilder<MapCubit, MapState>(
                buildWhen: (previous, current) =>
                    previous.lots != current.lots ||
                    previous.userLocation != current.userLocation,
                builder: (context, state) => NearbySheet(
                  lots: state.lots,
                  hasLocation: state.userLocation != null,
                  onSelect: _showLot,
                ),
              ),
              BlocBuilder<MapCubit, MapState>(
                buildWhen: (previous, current) =>
                    previous.status != current.status,
                builder: (context, state) {
                  if (state.status != MapStatus.failure) {
                    return const SizedBox.shrink();
                  }
                  return Center(
                    child: Container(
                      margin: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: palette.surface,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: AppErrorView(
                        message:
                            state.errorMessage ??
                            "Couldn't load the parking lots.",
                        onRetry: context.read<MapCubit>().load,
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMap() {
    final palette = context.palette;
    final cubit = context.read<MapCubit>();

    return BlocBuilder<MapCubit, MapState>(
      builder: (context, state) {
        final user = state.userLocation;
        final selected = state.selected;

        return FlutterMap(
          mapController: _map,
          options: MapOptions(
            initialCenter: const LatLng(
              MapConfig.defaultLatitude,
              MapConfig.defaultLongitude,
            ),
            initialZoom: MapConfig.defaultZoom,
            minZoom: MapConfig.minZoom,
            maxZoom: MapConfig.maxZoom,
            backgroundColor: palette.bg,
            interactionOptions: const InteractionOptions(
              flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
            ),
            onMapReady: () {
              _isMapReady = true;
              final point = context.read<LocationCubit>().state.point;
              if (point != null) _moveTo(point, zoom: MapConfig.userZoom);
            },
            onPositionChanged: (_, hasGesture) {
              if (hasGesture) _userMovedMap = true;
            },
            onTap: (_, _) => cubit.select(null),
          ),
          children: [
            const AppTileLayer(),
            MarkerLayer(
              markers: [
                if (user != null)
                  Marker(
                    point: LatLng(user.latitude, user.longitude),
                    width: 28,
                    height: 28,
                    child: const UserLocationDot(),
                  ),
                for (final lot in state.lots)
                  Marker(
                    point: LatLng(lot.lot.latitude, lot.lot.longitude),
                    width: 32,
                    height: 32,
                    child: Semantics(
                      button: true,
                      label: lot.lot.name,
                      child: GestureDetector(
                        onTap: () => cubit.select(lot.lot.id),
                        child: Center(
                          child: ParkingPin(
                            color: ParkingPin.colorFor(lot.lot.availableSlots),
                            isSelected: lot.lot.id == state.selectedLotId,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            if (selected != null)
              MarkerLayer(
                markers: [
                  Marker(
                    point: LatLng(
                      selected.lot.latitude,
                      selected.lot.longitude,
                    ),
                    width: 200,
                    height: 80,
                    // Above the pin, its bottom on the lot's position.
                    alignment: Alignment.topCenter,
                    child: Align(
                      alignment: Alignment.bottomCenter,
                      child: LotCallout(
                        lot: selected.lot,
                        onTap: () => AppRouter.toParkingDetails(
                          context,
                          selected.lot.id,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
          ],
        );
      },
    );
  }
}

/// The search bar, the location note when needed, and the attribution,
/// which stays in this corner so the sheet never covers it.
class _TopControls extends StatelessWidget {
  const _TopControls({required this.onLocate});

  final VoidCallback onLocate;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LocationCubit, LocationState>(
      builder: (context, location) {
        final problem = location.problem;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            MapSearchBar(
              onSearch: () => AppRouter.toSearchResults(context, ''),
              onLocate: onLocate,
              isLocating: location.status == LocationStatus.locating,
            ),
            if (location.status == LocationStatus.unavailable &&
                problem != null) ...[
              const SizedBox(height: 8),
              LocationBanner(
                problem: problem,
                onFix: context.read<LocationCubit>().fix,
              ),
            ],
            const SizedBox(height: 6),
            const Align(
              alignment: AlignmentDirectional.centerEnd,
              child: MapAttribution(),
            ),
          ],
        );
      },
    );
  }
}
