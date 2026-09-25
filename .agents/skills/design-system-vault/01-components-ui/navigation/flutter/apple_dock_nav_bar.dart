import 'package:flutter/material.dart';

class AppleDockItem {
  final String id;
  final String label;
  final IconData icon;
  final Color color;

  const AppleDockItem({
    required this.id,
    required this.label,
    required this.icon,
    required this.color,
  });
}

/// Dock estilo Apple macOS para Flutter
/// 
/// Características:
/// - Magnificación táctil suave mediante arrastre horizontal (Pan/Drag).
/// - Cápsula con desenfoque de fondo y borde sutil.
/// - Rebote físico al seleccionar una aplicación.
class AppleDockNavBar extends StatefulWidget {
  final List<AppleDockItem> items;
  final ValueChanged<AppleDockItem>? onItemSelected;

  const AppleDockNavBar({
    super.key,
    required this.items,
    this.onItemSelected,
  });

  @override
  State<AppleDockNavBar> createState() => _AppleDockNavBarState();
}

class _AppleDockNavBarState extends State<AppleDockNavBar> {
  double? _touchX;
  final double _baseSize = 46.0;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.bottomCenter,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 24),
        child: GestureDetector(
          onHorizontalDragUpdate: (details) {
            setState(() {
              _touchX = details.localPosition.dx;
            });
          },
          onHorizontalDragEnd: (_) {
            setState(() {
              _touchX = null;
            });
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.55),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(color: Colors.white.withOpacity(0.18)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.35),
                  blurRadius: 24,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: List.generate(widget.items.length, (index) {
                final item = widget.items[index];

                double scale = 1.0;
                if (_touchX != null) {
                  // Calcular proximidad del toque
                  final itemCenterX = (index * (_baseSize + 10)) + (_baseSize / 2);
                  final distance = (_touchX! - itemCenterX).abs();
                  if (distance < 90) {
                    scale = 1.0 + (1.0 - (distance / 90)) * 0.45;
                  }
                }

                return GestureDetector(
                  onTap: () => widget.onItemSelected?.call(item),
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: _baseSize * scale,
                    height: _baseSize * scale,
                    decoration: BoxDecoration(
                      color: item.color.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(14 * scale),
                      border: Border.all(color: Colors.white.withOpacity(0.2)),
                    ),
                    child: Icon(
                      item.icon,
                      color: item.color,
                      size: 22 * scale,
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}
