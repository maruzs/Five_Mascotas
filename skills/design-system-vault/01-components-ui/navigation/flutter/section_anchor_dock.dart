import 'package:flutter/material.dart';

class SectionAnchorItem {
  final String id;
  final String num;
  final String label;

  const SectionAnchorItem({
    required this.id,
    required this.num,
    required this.label,
  });
}

/// Dock Flotante de Navegación por Secciones para Flutter
/// 
/// Características:
/// - Píldora inferior flotante con número y título de sección activa.
/// - Menú emergente hacia arriba con la lista de secciones para salto directo.
class SectionAnchorDock extends StatefulWidget {
  final List<SectionAnchorItem> sections;
  final int activeIndex;
  final ValueChanged<int>? onSectionSelected;

  const SectionAnchorDock({
    super.key,
    required this.sections,
    this.activeIndex = 0,
    this.onSectionSelected,
  });

  @override
  State<SectionAnchorDock> createState() => _SectionAnchorDockState();
}

class _SectionAnchorDockState extends State<SectionAnchorDock> {
  bool _isOpen = false;

  @override
  Widget build(BuildContext context) {
    final activeSection = widget.sections[widget.activeIndex];

    return Align(
      alignment: Alignment.bottomCenter,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Menú Desplegable Superior
            AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeOutBack,
              height: _isOpen ? (widget.sections.length * 44.0 + 16.0) : 0,
              width: 220,
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF1B1E2E).withOpacity(0.95),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withOpacity(0.15)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.4),
                    blurRadius: 25,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              clipBehavior: Clip.antiAlias,
              child: _isOpen
                  ? SingleChildScrollView(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: List.generate(widget.sections.length, (idx) {
                          final item = widget.sections[idx];
                          final isSelected = idx == widget.activeIndex;

                          return InkWell(
                            onTap: () {
                              setState(() => _isOpen = false);
                              widget.onSectionSelected?.call(idx);
                            },
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? Colors.white.withOpacity(0.15)
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  Text(
                                    item.num,
                                    style: TextStyle(
                                      fontFamily: 'monospace',
                                      fontSize: 11,
                                      color: isSelected
                                          ? Colors.white
                                          : Colors.grey[500],
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Text(
                                    item.label,
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: isSelected
                                          ? FontWeight.bold
                                          : FontWeight.normal,
                                      color: isSelected
                                          ? Colors.white
                                          : Colors.grey[300],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }),
                      ),
                    )
                  : null,
            ),

            // Píldora Flotante Principal
            GestureDetector(
              onTap: () => setState(() => _isOpen = !_isOpen),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(30),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.35),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      activeSection.num,
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      activeSection.label,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(width: 6),
                    AnimatedRotation(
                      turns: _isOpen ? 0.5 : 0.0,
                      duration: const Duration(milliseconds: 250),
                      child: const Icon(
                        Icons.keyboard_arrow_up,
                        size: 16,
                        color: Colors.black54,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
