import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/location/domain/repositories/location_repository.dart';
import 'package:mobile/feature/scan/domain/lot_qr_code.dart';
import 'package:mobile/feature/scan/presentation/widgets/scan_frame.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

/// Scans the QR sign at a lot's entrance and opens that lot, ready to book.
/// The number under the code can be typed in instead.
class ScanQrScreen extends StatefulWidget {
  const ScanQrScreen({super.key});

  @override
  State<ScanQrScreen> createState() => _ScanQrScreenState();
}

class _ScanQrScreenState extends State<ScanQrScreen> {
  final MobileScannerController _scanner = MobileScannerController(
    formats: const [BarcodeFormat.qrCode],
    detectionSpeed: DetectionSpeed.noDuplicates,
  );

  /// Set once a lot is opened, so a second frame can't open it twice.
  bool _isDone = false;
  DateTime _lastWarning = DateTime(0);

  @override
  void dispose() {
    _scanner.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    if (_isDone) return;
    for (final barcode in capture.barcodes) {
      final lotId = LotQrCode.parse(barcode.rawValue);
      if (lotId != null) {
        _openLot(lotId);
        return;
      }
    }
    // Some other QR code. Say so, but not on every camera frame.
    final now = DateTime.now();
    if (now.difference(_lastWarning) > const Duration(seconds: 3)) {
      _lastWarning = now;
      context.showSnack("That isn't a ParkEasy parking code.", isError: true);
    }
  }

  /// Replaces the scanner, so Back from the lot goes to where scanning
  /// started.
  void _openLot(int lotId) {
    _isDone = true;
    HapticFeedback.mediumImpact();
    Navigator.pushReplacementNamed(
      context,
      AppRouter.parkingDetails,
      arguments: lotId,
    );
  }

  Future<void> _typeCode() async {
    final lotId = await showDialog<int>(
      context: context,
      builder: (_) => const _LotCodeDialog(),
    );
    if (lotId != null && mounted) _openLot(lotId);
  }

  @override
  Widget build(BuildContext context) {
    return AppScreen(
      topBar: AppTopBar(
        title: 'Scan QR',
        trailing: ValueListenableBuilder<MobileScannerState>(
          valueListenable: _scanner,
          builder: (context, state, _) {
            if (state.torchState == TorchState.unavailable) {
              return const SizedBox.shrink();
            }
            final isOn = state.torchState == TorchState.on;
            return IconButton(
              tooltip: isOn ? 'Turn off the light' : 'Turn on the light',
              onPressed: _scanner.toggleTorch,
              icon: Icon(
                isOn ? LucideIcons.flashlightOff : LucideIcons.flashlight,
                size: 20,
                color: isOn ? AppColors.amber : context.palette.textMuted,
              ),
            );
          },
        ),
      ),
      body: Stack(
        fit: StackFit.expand,
        children: [
          MobileScanner(
            controller: _scanner,
            onDetect: _onDetect,
            errorBuilder: (context, error) => _CameraProblem(
              error: error,
              onTypeCode: _typeCode,
            ),
          ),
          const IgnorePointer(child: ScanFrame()),
          Positioned(
            left: 22,
            right: 22,
            bottom: 28,
            child: Column(
              children: [
                const Text(
                  'Point at the QR code at the parking entrance',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: Colors.white),
                ),
                const SizedBox(height: 12),
                TextButton.icon(
                  onPressed: _typeCode,
                  style: TextButton.styleFrom(
                    backgroundColor: Colors.black.withValues(alpha: 0.45),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 10,
                    ),
                  ),
                  icon: const Icon(
                    LucideIcons.keyboard,
                    size: 16,
                    color: AppColors.tealLight,
                  ),
                  label: const Text(
                    'Enter lot code',
                    style: TextStyle(fontSize: 12, color: AppColors.tealLight),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// No camera (simulator), or camera access refused.
class _CameraProblem extends StatelessWidget {
  const _CameraProblem({required this.error, required this.onTypeCode});

  final MobileScannerException error;
  final VoidCallback onTypeCode;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final isDenied =
        error.errorCode == MobileScannerErrorCode.permissionDenied;

    return ColoredBox(
      color: palette.bg,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(LucideIcons.cameraOff, size: 40, color: palette.textHint),
              const SizedBox(height: 12),
              Text(
                isDenied
                    ? 'Camera access is off for ParkEasy.'
                    : "The camera isn't available on this device.",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: palette.textMuted),
              ),
              const SizedBox(height: 16),
              if (isDenied)
                TextButton(
                  // The app's page in Settings (the same for any permission).
                  onPressed: sl<LocationRepository>().openAppSettings,
                  child: const Text('Open Settings'),
                ),
              TextButton(
                onPressed: onTypeCode,
                child: const Text('Enter lot code instead'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Types the number printed under the QR code.
class _LotCodeDialog extends StatefulWidget {
  const _LotCodeDialog();

  @override
  State<_LotCodeDialog> createState() => _LotCodeDialogState();
}

class _LotCodeDialogState extends State<_LotCodeDialog> {
  final _controller = TextEditingController();
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit() {
    final lotId = LotQrCode.parseTyped(_controller.text);
    if (lotId == null) {
      setState(() => _error = 'Enter the number under the QR code.');
      return;
    }
    Navigator.pop(context, lotId);
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return AlertDialog(
      backgroundColor: palette.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text(
        'Enter lot code',
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: palette.textPrimary,
        ),
      ),
      content: TextField(
        controller: _controller,
        autofocus: true,
        keyboardType: TextInputType.number,
        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        onSubmitted: (_) => _submit(),
        decoration: InputDecoration(
          hintText: 'e.g. 1',
          errorText: _error,
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text('Cancel', style: TextStyle(color: palette.textMuted)),
        ),
        TextButton(
          onPressed: _submit,
          child: const Text(
            'Open',
            style: TextStyle(
              color: AppColors.teal,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }
}
