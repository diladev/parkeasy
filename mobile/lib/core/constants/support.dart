/// Where users get help. Set with --dart-define for a real deployment, e.g.
/// `flutter run --dart-define=SUPPORT_EMAIL=help@example.com`.
const String kSupportEmail = String.fromEnvironment(
  'SUPPORT_EMAIL',
  defaultValue: 'support@parkeasy.app',
);

/// "View full documentation": the project's README on GitHub.
const String kDocumentationUrl = String.fromEnvironment(
  'DOCUMENTATION_URL',
  defaultValue: 'https://github.com/diladev/parkeasy#readme',
);
