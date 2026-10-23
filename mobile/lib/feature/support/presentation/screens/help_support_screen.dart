import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/constants/support.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/support/presentation/faqs.dart';
import 'package:mobile/feature/support/presentation/widgets/contact_card.dart';
import 'package:mobile/feature/support/presentation/widgets/faq_tile.dart';
import 'package:url_launcher/url_launcher.dart';

/// Ways to reach support, common questions and the documentation.
class HelpSupportScreen extends StatefulWidget {
  const HelpSupportScreen({super.key});

  @override
  State<HelpSupportScreen> createState() => _HelpSupportScreenState();
}

class _HelpSupportScreenState extends State<HelpSupportScreen> {
  /// The question that's open; one at a time, the first to start with.
  int? _openFaq = 0;

  /// The blue behind the email icon and its pill.
  static const Color _emailTint = Color(0x260064B0);

  Future<void> _emailUs() async {
    final opened = await _open(
      Uri(
        scheme: 'mailto',
        path: kSupportEmail,
        query: 'subject=${Uri.encodeComponent('ParkEasy support')}',
      ),
    );
    if (opened || !mounted) return;

    // No mail app (the iOS simulator has none): hand over the address.
    await Clipboard.setData(const ClipboardData(text: kSupportEmail));
    if (mounted) {
      context.showSnack('No email app found. Copied $kSupportEmail.');
    }
  }

  Future<void> _openDocumentation() async {
    final opened = await _open(Uri.parse(kDocumentationUrl));
    if (!opened && mounted) {
      context.showSnack("Couldn't open the documentation.", isError: true);
    }
  }

  /// Opens [uri] in another app; false if nothing could.
  Future<bool> _open(Uri uri) async {
    try {
      return await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return AppScreen(
      topBar: const AppTopBar(title: 'Help & support'),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(22, 16, 22, 24),
        children: [
          const _SectionLabel('CONTACT US'),
          const SizedBox(height: 7),
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  // There's no chat service yet, so it doesn't claim to be
                  // online; it points to email instead.
                  child: ContactCard(
                    icon: LucideIcons.messageCircleMore,
                    label: 'Live chat',
                    status: 'Coming soon',
                    tint: AppColors.tealBg,
                    statusColor: palette.textHint,
                    onTap: () => context.showSnack(
                      "Live chat isn't available yet. Email us instead.",
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ContactCard(
                    icon: LucideIcons.mail,
                    label: 'Email us',
                    status: 'Reply in 24h',
                    tint: _emailTint,
                    statusColor: palette.textHint,
                    onTap: _emailUs,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 6),
          const _SectionLabel('FAQS'),
          const SizedBox(height: 7),
          for (final (index, faq) in kFaqs.indexed) ...[
            if (index > 0) const SizedBox(height: 8),
            FaqTile(
              faq: faq,
              isOpen: _openFaq == index,
              onTap: () =>
                  setState(() => _openFaq = _openFaq == index ? null : index),
            ),
          ],
          const SizedBox(height: 8),
          Center(
            child: TextButton(
              onPressed: _openDocumentation,
              child: const Text(
                'View full documentation',
                style: TextStyle(fontSize: 11, color: AppColors.teal),
              ),
            ),
          ),
        ],
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
