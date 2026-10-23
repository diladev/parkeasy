import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// The round "P" on the map. Its colour shows how many slots are free.
class ParkingPin extends StatelessWidget {
  const ParkingPin({
    super.key,
    required this.color,
    this.size = 28,
    this.isSelected = false,
  });

  final Color color;
  final double size;
  final bool isSelected;

  /// Teal with room, amber with a few left, red when full.
  static Color colorFor(int freeSlots) => switch (freeSlots) {
    0 => AppColors.red,
    <= 3 => AppColors.amber,
    _ => AppColors.teal,
  };

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 150),
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: isSelected ? Border.all(color: Colors.white, width: 2) : null,
        boxShadow: const [
          BoxShadow(
            color: Color(0x66000000),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Text(
        'P',
        style: TextStyle(
          fontSize: size / 2,
          fontWeight: FontWeight.w700,
          color: Colors.white,
          height: 1,
        ),
      ),
    );
  }
}

/// The user's position: a purple dot with a white ring.
class UserLocationDot extends StatelessWidget {
  const UserLocationDot({super.key});

  static const Color purple = Color(0xFF7F77DD);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 20,
      height: 20,
      decoration: BoxDecoration(
        color: purple,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 3),
        boxShadow: const [
          BoxShadow(color: Color(0x557F77DD), blurRadius: 10, spreadRadius: 4),
        ],
      ),
    );
  }
}
