/// An app that can navigate to a lot. ParkEasy hands the route off to it:
/// no routing service of its own, and no API keys.
enum MapApp {
  google('Google Maps'),
  apple('Apple Maps'),
  waze('Waze');

  const MapApp(this.label);

  final String label;
}
