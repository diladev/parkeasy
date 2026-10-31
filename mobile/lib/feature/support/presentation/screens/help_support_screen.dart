import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/constants/support.dart';
import 'package:mobile/core/l10n/l10n.dart';
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
        query: 'subject=${Uri.encodeComponent(l10n.supportEmailSubject)}',
      ),
    );
    if (opened || !mounted) return;

    // No mail app (the iOS simulator has none): hand over the address.
    await Clipboard.setData(const ClipboardData(text: kSupportEmail));
    if (mounted) {
      context.showSnack(l10n.noEmailAppCopied(kSupportEmail));
    }
  }

  Future<void> _openDocumentation() async {
    final opened = await _open(Uri.parse(kDocumentationUrl));
    if (!opened && mounted) {
      context.showSnack(l10n.couldntOpenDocs, isError: true);
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
      topBar: AppTopBar(title: l10n.helpAndSupport),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(22, 16, 22, 24),
        children: [
          _SectionLabel(l10n.contactUs),
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
                    label: l10n.liveChat,
                    status: l10n.comingSoon,
                    tint: AppColors.tealBg,
                    statusColor: palette.textHint,
                    onTap: () => context.showSnack(l10n.liveChatUnavailable),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ContactCard(
                    icon: LucideIcons.mail,
                    label: l10n.emailUs,
                    status: l10n.replyIn24h,
                    tint: _emailTint,
                    statusColor: palette.textHint,
                    onTap: _emailUs,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 6),
          _SectionLabel(l10n.faqsLabel),
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
              child: Text(
                l10n.viewDocumentation,
                style: const TextStyle(fontSize: 11, color: AppColors.teal),
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
