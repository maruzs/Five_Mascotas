import 'dart:math' as math;
import 'package:flutter/material.dart';

class SpatialCardData {
  final String id;
  final String title;
  final String imageUrl;

  const SpatialCardData({
    required this.id,
    required this.title,
    required this.imageUrl,
  });
}

/// Slider Espacial 3D Curvado estilo OSMO para Flutter
/// 
/// Características:
/// - Perspectiva tridimensional mediante [Matrix4.identity()..setEntry(3, 2, 0.0012)].
/// - Rotación tangencial en el eje Y y traslación en Z para simular curvatura cilíndrica.
/// - Scroll interactivo con gestos de arrastre o botones Prev/Next con indicadores animados.
class SpatialCardsSlider extends StatefulWidget {
  final List<SpatialCardData> items;
  final int initialIndex;
  final ValueChanged<int>? onIndexChanged;

  const SpatialCardsSlider({
    super.key,
    required this.items,
    this.initialIndex = 2,
    this.onIndexChanged,
  });

  @override
  State<SpatialCardsSlider> createState() => _SpatialCardsSliderState();
}

class _SpatialCardsSliderState extends State<SpatialCardsSlider> {
  late PageController _pageController;
  double _currentPage = 2.0;

  @override
  void initState() {
    super.initState();
    _currentPage = widget.initialIndex.toDouble();
    _pageController = PageController(
      initialPage: widget.initialIndex,
      viewportFraction: 0.55,
    );
    _pageController.addListener(() {
      setState(() {
        _currentPage = _pageController.page ?? 0.0;
      });
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Escenario de Carrusel 3D
        SizedBox(
          height: 320,
          child: PageView.builder(
            controller: _pageController,
            itemCount: widget.items.length,
            onPageChanged: widget.onIndexChanged,
            itemBuilder: (context, index) {
              final item = widget.items[index];
              final double diff = index - _currentPage;
              final double absDiff = diff.abs();

              // Matriz de transformación 3D espacial
              final matrix = Matrix4.identity()
                ..setEntry(3, 2, 0.0015) // Perspectiva Z
                ..rotateY(diff * -0.22)   // Rotación tangencial cilíndrica
                ..scale(math.max(0.85, 1.0 - absDiff * 0.12));

              final double opacity = math.max(0.2, 1.0 - absDiff * 0.35);

              return Transform(
                transform: matrix,
                alignment: Alignment.center,
                child: Opacity(
                  opacity: opacity,
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.4),
                          blurRadius: 18,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.network(
                          item.imageUrl,
                          fit: BoxFit.cover,
                        ),
                        Container(
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Colors.transparent, Colors.black87],
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: 16,
                          left: 0,
                          right: 0,
                          child: Text(
                            item.title,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              letterSpacing: 2,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),

        const SizedBox(height: 16),

        // Controles de Navegación
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, size: 16),
              onPressed: () {
                _pageController.previousPage(
                  duration: const Duration(milliseconds: 400),
                  curve: Curves.easeOutCubic,
                );
              },
            ),
            Row(
              children: List.generate(widget.items.length, (idx) {
                final bool isSelected = (_currentPage.round() == idx);
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  width: isSelected ? 16 : 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: isSelected ? Colors.amber[200] : Colors.grey[600],
                    borderRadius: BorderRadius.circular(3),
                  ),
                );
              }),
            ),
            IconButton(
              icon: const Icon(Icons.arrow_forward_ios, size: 16),
              onPressed: () {
                _pageController.nextPage(
                  duration: const Duration(milliseconds: 400),
                  curve: Curves.easeOutCubic,
                );
              },
            ),
          ],
        ),
      ],
    );
  }
}
