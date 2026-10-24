import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// Darkens the camera around a square and draws teal corners on it, so it's
/// clear where to hold the code.
class ScanFrame extends StatelessWidget {
  const ScanFrame({super.key, this.size = 240});

  final double size;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size.infinite,
      painter: _ScanFramePainter(size),
    );
  }
}

class _ScanFramePainter extends CustomPainter {
  _ScanFramePainter(this.side);

  final double side;

  static const double _corner = 28;
  static const double _radius = 18;

  @override
  void paint(Canvas canvas, Size size) {
    final window = Rect.fromCenter(
      center: size.center(Offset.zero),
      width: side,
      height: side,
    );
    final rounded = RRect.fromRectAndRadius(
      window,
      const Radius.circular(_radius),
    );

    // The dim area: everything except the window.
    canvas.drawPath(
      Path.combine(
        PathOperation.difference,
        Path()..addRect(Offset.zero & size),
        Path()..addRRect(rounded),
      ),
      Paint()..color = Colors.black.withValues(alpha: 0.55),
    );

    final stroke = Paint()
      ..color = AppColors.teal
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    final l = window.left, t = window.top, r = window.right, b = window.bottom;
    for (final corner in [
      // (start, bend, end) of each corner's L.
      [Offset(l, t + _corner), Offset(l, t), Offset(l + _corner, t)],
      [Offset(r - _corner, t), Offset(r, t), Offset(r, t + _corner)],
      [Offset(r, b - _corner), Offset(r, b), Offset(r - _corner, b)],
      [Offset(l + _corner, b), Offset(l, b), Offset(l, b - _corner)],
    ]) {
      canvas.drawPath(
        Path()
          ..moveTo(corner[0].dx, corner[0].dy)
          ..lineTo(corner[1].dx, corner[1].dy)
          ..lineTo(corner[2].dx, corner[2].dy),
        stroke,
      );
    }
  }

  @override
  bool shouldRepaint(_ScanFramePainter oldDelegate) => oldDelegate.side != side;
}
