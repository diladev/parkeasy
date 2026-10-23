import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/feature/support/presentation/faqs.dart';

/// A question that opens to show its answer.
class FaqTile extends StatelessWidget {
  const FaqTile({
    super.key,
    required this.faq,
    required this.isOpen,
    required this.onTap,
  });

  final Faq faq;
  final bool isOpen;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Semantics(
      button: true,
      expanded: isOpen,
      child: Material(
        color: palette.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: palette.border, width: 0.5),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 11),
            child: AnimatedSize(
              duration: const Duration(milliseconds: 180),
              curve: Curves.easeOut,
              alignment: Alignment.topCenter,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          faq.question,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: palette.textPrimary,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ExcludeSemantics(
                        child: Text(
                          isOpen ? '∧' : '∨',
                          style: TextStyle(
                            fontSize: 14,
                            height: 1,
                            color: palette.textHint,
                          ),
                        ),
                      ),
                      const SizedBox(width: 4),
                    ],
                  ),
                  if (isOpen) ...[
                    const SizedBox(height: 5),
                    Text(
                      faq.answer,
                      style: TextStyle(
                        fontSize: 10,
                        height: 1.4,
                        color: palette.textHint,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
