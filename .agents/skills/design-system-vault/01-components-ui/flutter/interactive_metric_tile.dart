import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// 📊 Interactive Metric Tile for Flutter
///
/// Analytics KPI tile featuring numeric tween animations, positive/negative delta badge,
/// native touch feedback, and a built-in zero-dependency CustomPainter sparkline.
class InteractiveMetricTile extends StatelessWidget {
  final String label;
  final double value;
  final String prefix;
  final String suffix;
  final double changePercentage;
  final String changePeriod;
  final List<double> sparklineData;
  final VoidCallback? onTap;

  const InteractiveMetricTile({
    Key? key,
    required this.label,
    required this.value,
    this.prefix = '\$',
    this.suffix = '',
    required this.changePercentage,
    this.changePeriod = 'vs. last month',
    this.sparklineData = const [24, 32, 28, 45, 40, 58, 64, 60, 78],
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isPositive = changePercentage >= 0;
    final accentColor = isPositive ? const Color(0xFF10B981) : const Color(0xFFEF4444);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          HapticFeedback.selectionClick();
          onTap?.call();
        },
        borderRadius: BorderRadius.circular(16),
        splashColor: accentColor.withOpacity(0.08),
        highlightColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF0F1115) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? Colors.white.withOpacity(0.08) : const Color(0xFFE2E8F0),
              width: 1.0,
            ),
            boxShadow: [
              BoxShadow(
                color: isDark ? Colors.black.withOpacity(0.35) : const Color(0x080F172A),
                blurRadius: 12,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Metric Label
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                ),
              ),
              const SizedBox(height: 8),

              // Animated Numeric Counter
              TweenAnimationBuilder<double>(
                tween: Tween<double>(begin: 0, end: value),
                duration: const Duration(milliseconds: 900),
                curve: Curves.easeOutCubic,
                builder: (context, animatedVal, _) {
                  final formatted = animatedVal >= 1000
                      ? '${(animatedVal / 1000).toStringAsFixed(1)}k'
                      : animatedVal.toStringAsFixed(2);
                  return Text(
                    '$prefix$formatted$suffix',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.5,
                      color: isDark ? Colors.white : const Color(0xFF0F172A),
                    ),
                  );
                },
              ),
              const SizedBox(height: 6),

              // Delta Badge & Sparkline Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Change Percentage Pill
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: accentColor.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '${isPositive ? '+' : ''}${changePercentage.toStringAsFixed(1)}%',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: accentColor,
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        changePeriod,
                        style: TextStyle(
                          fontSize: 11,
                          color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
                        ),
                      ),
                    ],
                  ),

                  // Mini Trend Sparkline Canvas
                  if (sparklineData.isNotEmpty)
                    SizedBox(
                      width: 64,
                      height: 24,
                      child: CustomPaint(
                        painter: _SparklinePainter(
                          data: sparklineData,
                          lineColor: accentColor,
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Custom Zero-Dependency Sparkline Painter
class _SparklinePainter extends CustomPainter {
  final List<double> data;
  final Color lineColor;

  _SparklinePainter({required this.data, required this.lineColor});

  @override
  void paint(Canvas canvas, Size size) {
    if (data.length < 2) return;

    final minVal = data.reduce((a, b) => a < b ? a : b);
    final maxVal = data.reduce((a, b) => a > b ? a : b);
    final range = (maxVal - minVal) == 0 ? 1.0 : (maxVal - minVal);

    final path = Path();
    final stepX = size.width / (data.length - 1);

    for (int i = 0; i < data.length; i++) {
      final x = i * stepX;
      final y = size.height - ((data[i] - minVal) / range) * size.height;

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    final linePaint = Paint()
      ..color = lineColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.8
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    canvas.drawPath(path, linePaint);
  }

  @override
  bool shouldRepaint(covariant _SparklinePainter oldDelegate) =>
      oldDelegate.data != data || oldDelegate.lineColor != lineColor;
}
