import 'dart:async';
import 'package:flutter/material.dart';

/// RotatingTextFlipper para Flutter
/// 
/// Características:
/// - Rota en 3D en el eje X una lista de palabras alternantes.
/// - Ideal para el título principal (Hero) de una Landing Page móvil o app de bienvenida.
class RotatingTextFlipper extends StatefulWidget {
  final String prefix;
  final List<String> words;
  final String suffix;
  final Duration interval;
  final TextStyle? baseStyle;
  final TextStyle? highlightStyle;

  const RotatingTextFlipper({
    super.key,
    this.prefix = 'Simple ',
    this.words = const ['tools', 'systems', 'help', 'routines'],
    this.suffix = ' that give growing and ambitious teams more clarity.',
    this.interval = const Duration(milliseconds: 2500),
    this.baseStyle,
    this.highlightStyle,
  });

  @override
  State<RotatingTextFlipper> createState() => _RotatingTextFlipperState();
}

class _RotatingTextFlipperState extends State<RotatingTextFlipper>
    with SingleTickerProviderStateMixin {
  late Timer _timer;
  late AnimationController _controller;
  late Animation<double> _animation;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 450),
    );
    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOutCubic,
    );

    _timer = Timer.periodic(widget.interval, (_) {
      _controller.forward().then((_) {
        setState(() {
          _currentIndex = (_currentIndex + 1) % widget.words.length;
        });
        _controller.reset();
      });
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final defaultBase = Theme.of(context).textTheme.headlineMedium?.copyWith(
          fontWeight: FontWeight.bold,
          color: Colors.white,
        );
    final defaultHighlight = defaultBase?.copyWith(
      color: const Color(0xFF38D689),
      fontWeight: FontWeight.w900,
    );

    final base = widget.baseStyle ?? defaultBase;
    final highlight = widget.highlightStyle ?? defaultHighlight;

    return Center(
      child: RichText(
        textAlign: TextAlign.center,
        text: TextSpan(
          style: base,
          children: [
            TextSpan(text: widget.prefix),
            WidgetSpan(
              alignment: PlaceholderAlignment.middle,
              child: AnimatedBuilder(
                animation: _animation,
                builder: (context, child) {
                  // Giro 3D en eje X
                  final double angle = _animation.value * 3.14159 / 2;
                  return Transform(
                    transform: Matrix4.identity()
                      ..setEntry(3, 2, 0.002)
                      ..rotateX(angle),
                    alignment: Alignment.center,
                    child: Opacity(
                      opacity: 1.0 - _animation.value,
                      child: Text(
                        widget.words[_currentIndex],
                        style: highlight,
                      ),
                    ),
                  );
                },
              ),
            ),
            TextSpan(text: widget.suffix),
          ],
        ),
      ),
    );
  }
}
