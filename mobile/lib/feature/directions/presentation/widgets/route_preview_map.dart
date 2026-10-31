import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile/core/config/map_config.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/map/app_tile_layer.dart';
import 'package:mobile/core/widgets/map/map_attribution.dart';
import 'package:mobile/core/widgets/map/parking_pin.dart';
import 'package:mobile/feature/location/domain/entities/geo_point.dart';

/// The small map at the top of Get directions: the lot, the user (if known)
/// and the straight-line distance between them. It isn't a route: the map
/// app draws that.
class RoutePreviewMap extends StatelessWidget {
  const RoutePreviewMap({super.key, required this.destination, this.user});

  final GeoPoint destination;
  final GeoPoint? user;

  static const double height = 200;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final lot = LatLng(destination.latitude, destination.longitude);
    final me = user;
    final here = me == null ? null : LatLng(me.latitude, me.longitude);

    return SizedBox(
      height: height,
      child: Stack(
        children: [
          // Keyed by the points: when the location arrives the map is
          // built again, framing both.
          FlutterMap(
            key: ValueKey(here),
            options: MapOptions(
              initialCenter: lot,
              initialZoom: MapConfig.userZoom,
              initialCameraFit: here == null
                  ? null
                  : CameraFit.coordinates(
                      coordinates: [lot, here],
                      padding: const EdgeInsets.fromLTRB(40, 30, 40, 50),
                      maxZoom: 17,
                    ),
              backgroundColor: palette.bg,
              interactionOptions: const InteractionOptions(
                flags: InteractiveFlag.none,
              ),
            ),
            children: [
              const AppTileLayer(),
              MarkerLayer(
                markers: [
                  if (here != null)
                    Marker(
                      point: here,
                      width: 28,
                      height: 28,
                      child: const UserLocationDot(),
                    ),
                  Marker(
                    point: lot,
                    width: 28,
                    height: 28,
                    child: const ParkingPin(color: AppColors.teal, size: 24),
                  ),
                ],
              ),
            ],
          ),
          if (me != null)
            Positioned(
              left: 0,
              right: 0,
              bottom: 8,
              child: Center(
                child: _DistanceBadge(km: me.distanceKmTo(destination)),
              ),
            ),
          const Positioned(top: 6, right: 6, child: MapAttribution()),
        ],
      ),
    );
  }
}

class _DistanceBadge extends StatelessWidget {
  const _DistanceBadge({required this.km});

  final double km;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: palette.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: palette.border, width: 0.5),
      ),
      // Straight line, so no "min walk" or drive time: the map app has those.
      child: Text(
        l10n.straightLine(Formatters.approxDistance(km)),
        style: TextStyle(fontSize: 10, color: palette.textPrimary),
      ),
    );
  }
}
