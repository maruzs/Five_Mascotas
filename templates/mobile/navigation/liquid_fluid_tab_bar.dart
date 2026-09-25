import 'package:flutter/material.dart';

/// Modelo neutral para los elementos de la barra
class LiquidTabItem {
  final String id;
  final String label;
  final String? sublabel;
  final IconData iconOutline;
  final IconData iconFilled;

  const LiquidTabItem({
    required this.id,
    required this.label,
    this.sublabel,
    required this.iconOutline,
    required this.iconFilled,
  });
}

/// Barra de navegación líquida animada (Inspirada en el concepto CREST)
/// 
/// Características:
/// - 100% dependiente de [Theme.of(context).colorScheme], cero colores quemados en código.
/// - Indicador inferior tipo "gota / cresta fluida" con animación suave y resorte.
/// - Cambio reactivo de icono Outline a Filled con micro-animación de escala.
class LiquidFluidTabBar extends StatefulWidget {
  final List<LiquidTabItem> items;
  final int initialIndex;
  final ValueChanged<int>? onTabSelected;

  const LiquidFluidTabBar({
    super.key,
    required this.items,
    this.initialIndex = 0,
    this.onTabSelected,
  }) : assert(items.length > 0);

  @override
  State<LiquidFluidTabBar> createState() => _LiquidFluidTabBarState();
}

class _LiquidFluidTabBarState extends State<LiquidFluidTabBar>
    with SingleTickerProviderStateMixin {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  void _handleTap(int index) {
    if (_currentIndex == index) return;
    setState(() {
      _currentIndex = index;
    });
    widget.onTabSelected?.call(index);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final activeItem = widget.items[_currentIndex];

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Título y Subtítulo dinámico
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 250),
          child: Column(
            key: ValueKey<int>(_currentIndex),
            children: [
              Text(
                activeItem.label,
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.onSurface,
                ),
              ),
              if (activeItem.sublabel != null) ...[
                const SizedBox(height: 4),
                Text(
                  activeItem.sublabel!,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurface.withOpacity(0.6),
                  ),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Barra Flotante Píldora
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 24),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          decoration: BoxDecoration(
            color: colorScheme.surfaceVariant.withOpacity(0.4),
            borderRadius: BorderRadius.circular(40),
            border: Border.all(
              color: colorScheme.outline.withOpacity(0.15),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.12),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Stack(
            alignment: Alignment.bottomCenter,
            children: [
              // Fila de botones
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: List.generate(widget.items.length, (index) {
                  final item = widget.items[index];
                  final isSelected = _currentIndex == index;

                  return GestureDetector(
                    onTap: () => _handleTap(index),
                    behavior: HitTestBehavior.opaque,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      child: AnimatedScale(
                        duration: const Duration(milliseconds: 200),
                        scale: isSelected ? 1.15 : 1.0,
                        child: Icon(
                          isSelected ? item.iconFilled : item.iconOutline,
                          color: isSelected
                              ? colorScheme.primary
                              : colorScheme.onSurface.withOpacity(0.45),
                          size: 24,
                        ),
                      ),
                    ),
                  );
                }),
              ),

              // Indicador Inferior Dinámico ("Cresta Líquida")
              AnimatedAlign(
                duration: const Duration(milliseconds: 350),
                curve: Curves.easeOutBack,
                alignment: Alignment(
                  -1.0 + (_currentIndex / (widget.items.length - 1)) * 2.0,
                  1.0,
                ),
                child: Container(
                  width: 32,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 2),
                  decoration: BoxDecoration(
                    color: colorScheme.primary,
                    borderRadius: BorderRadius.circular(4),
                    boxShadow: [
                      BoxShadow(
                        color: colorScheme.primary.withOpacity(0.6),
                        blurRadius: 8,
                        spreadRadius: 1,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
