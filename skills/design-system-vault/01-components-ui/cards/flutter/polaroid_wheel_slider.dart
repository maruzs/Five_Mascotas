import 'dart:math' as math;
import 'package:flutter/material.dart';

class PolaroidCardData {
  final String id;
  final String title;
  final String imageUrl;

  const PolaroidCardData({
    required this.id,
    required this.title,
    required this.imageUrl,
  });
}

/// Carrusel en rueda / arco estilo Polaroid para Flutter
class PolaroidWheelSlider extends StatefulWidget {
  final List<PolaroidCardData> items;
  final int initialIndex;
  final ValueChanged<int>? onIndexChanged;

  const PolaroidWheelSlider({
    super.key,
    required this.items,
    this.initialIndex = 2,
    this.onIndexChanged,
  });

  @override
  State<PolaroidWheelSlider> createState() => _PolaroidWheelSliderState();
}

class _PolaroidWheelSliderState extends State<PolaroidWheelSlider> {
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
        SizedBox(
          height: 380,
          child: PageView.builder(
            controller: _pageController,
            itemCount: widget.items.length,
            onPageChanged: widget.onIndexChanged,
            itemBuilder: (context, index) {
              final item = widget.items[index];
              final double diff = index - _currentPage;
              final double absDiff = diff.abs();

              // Transformación en arco con rotación en Z y descenso parabólico
              final double rotateZ = diff * 0.14; // rad
              final double translateY = math.pow(absDiff, 1.8) * 26.0;

              final matrix = Matrix4.identity()
                ..setEntry(3, 2, 0.001)
                ..translate(0.0, translateY, -absDiff * 25.0)
                ..rotateZ(rotateZ)
                ..scale(math.max(0.85, 1.0 - absDiff * 0.06));

              return Transform(
                transform: matrix,
                alignment: Alignment.bottomCenter,
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                  padding: const EdgeInsets.fromLTRB(10, 10, 10, 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0EDE6),
                    borderRadius: BorderRadius.circular(22),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.35),
                        blurRadius: 18,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(15),
                          child: Image.network(
                            item.imageUrl,
                            fit: BoxFit.cover,
                            width: double.infinity,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        item.title,
                        style: const TextStyle(
                          color: Colors.black87,
                          fontWeight: FontWeight.w900,
                          fontSize: 14,
                          letterSpacing: 2,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),

        const SizedBox(height: 14),

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
                    color: isSelected ? Colors.white : Colors.grey[600],
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
