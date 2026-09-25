import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// 🍱 Custom Bento Card for Flutter (iOS, Android, Desktop)
///
/// Modular, tactile bento card with subtle hairlines, dark OLED elevation,
/// smooth micro-scale physics on tap, and native haptic feedback.
class CustomBentoCard extends StatefulWidget {
  final String title;
  final String? description;
  final Widget? leadingIcon;
  final Widget? trailingBadge;
  final Widget? content;
  final VoidCallback? onTap;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final Color? backgroundColor;
  final Color? borderColor;

  const CustomBentoCard({
    Key? key,
    required this.title,
    this.description,
    this.leadingIcon,
    this.trailingBadge,
    this.content,
    this.onTap,
    this.borderRadius = 20.0,
    this.padding = const EdgeInsets.all(20.0),
    this.backgroundColor,
    this.borderColor,
  }) : super(key: key);

  @override
  State<CustomBentoCard> createState() => _CustomBentoCardState();
}

class _CustomBentoCardState extends State<CustomBentoCard>
    with SingleTickerProviderStateMixin {
  bool _isPressed = false;

  void _handleTapDown(TapDownDetails details) {
    if (widget.onTap == null) return;
    setState(() => _isPressed = true);
    HapticFeedback.lightImpact();
  }

  void _handleTapUp(TapUpDetails details) {
    if (widget.onTap == null) return;
    setState(() => _isPressed = false);
    widget.onTap?.call();
  }

  void _handleTapCancel() {
    if (widget.onTap == null) return;
    setState(() => _isPressed = false);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    final defaultBg = isDark
        ? const Color(0xFF0F1115)
        : Colors.white;

    final defaultBorder = isDark
        ? Colors.white.withOpacity(0.08)
        : const Color(0xFFE2E8F0);

    return GestureDetector(
      onTapDown: _handleTapDown,
      onTapUp: _handleTapUp,
      onTapCancel: _handleTapCancel,
      child: AnimatedScale(
        scale: _isPressed ? 0.98 : 1.0,
        duration: const Duration(milliseconds: 120),
        curve: Curves.easeOutCubic,
        child: Container(
          padding: widget.padding,
          decoration: BoxDecoration(
            color: widget.backgroundColor ?? defaultBg,
            borderRadius: BorderRadius.circular(widget.borderRadius),
            border: Border.all(
              color: widget.borderColor ?? defaultBorder,
              width: 1.0,
            ),
            boxShadow: [
              BoxShadow(
                color: isDark
                    ? Colors.black.withOpacity(0.4)
                    : const Color(0x0A0F172A),
                blurRadius: 16.0,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header Row: Leading Icon, Title, Trailing Badge
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  if (widget.leadingIcon != null) ...[
                    Container(
                      height: 36,
                      width: 36,
                      decoration: BoxDecoration(
                        color: isDark
                            ? Colors.white.withOpacity(0.06)
                            : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: widget.leadingIcon,
                    ),
                    const SizedBox(width: 12),
                  ],
                  Expanded(
                    child: Text(
                      widget.title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        letterSpacing: -0.3,
                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                      ),
                    ),
                  ),
                  if (widget.trailingBadge != null) widget.trailingBadge!,
                ],
              ),

              // Description Text
              if (widget.description != null) ...[
                const SizedBox(height: 8),
                Text(
                  widget.description!,
                  style: TextStyle(
                    fontSize: 13,
                    height: 1.45,
                    color: isDark
                        ? const Color(0xFF94A3B8)
                        : const Color(0xFF64748B),
                  ),
                ),
              ],

              // Custom Embedded Content Slot
              if (widget.content != null) ...[
                const SizedBox(height: 16),
                widget.content!,
              ],
            ],
          ),
        ),
      ),
    );
  }
}
