import 'package:flutter/material.dart';

class FeatureItemData {
  final String id;
  final String title;
  final String description;
  final String mediaUrl;

  const FeatureItemData({
    required this.id,
    required this.title,
    required this.description,
    required this.mediaUrl,
  });
}

/// ExpandingFeaturePills para Flutter
class ExpandingFeaturePills extends StatefulWidget {
  final String baseProductImage;
  final List<FeatureItemData> features;

  const ExpandingFeaturePills({
    super.key,
    required this.baseProductImage,
    required this.features,
  });

  @override
  State<ExpandingFeaturePills> createState() => _ExpandingFeaturePillsState();
}

class _ExpandingFeaturePillsState extends State<ExpandingFeaturePills> {
  String? _activeId;

  @override
  Widget build(BuildContext context) {
    final activeFeature = widget.features.firstWhere(
      (f) => f.id === _activeId,
      orElse: () => widget.features.first,
    );

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF141519),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        children: [
          // Escenario Visual Superior
          Container(
            height: 240,
            width: double.infinity,
            decoration: BoxDecoration(
              color: const Color(0xFF090A0D),
              borderRadius: BorderRadius.circular(20),
            ),
            clipBehavior: Clip.antiAlias,
            child: Stack(
              fit: StackFit.expand,
              children: [
                // Imagen base o activa con fade
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 400),
                  child: Image.network(
                    _activeId != null
                        ? activeFeature.mediaUrl
                        : widget.baseProductImage,
                    key: ValueKey<String>(_activeId ?? 'base'),
                    fit: _activeId != null ? BoxFit.cover : BoxFit.contain,
                  ),
                ),
                if (_activeId != null)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: IconButton(
                      onPressed: () => setState(() => _activeId = null),
                      icon: const Icon(Icons.close, color: Colors.white),
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.black54,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Lista de Píldoras
          ...widget.features.map((feature) {
            final isExpanded = feature.id == _activeId;

            return GestureDetector(
              onTap: () {
                setState(() {
                  _activeId = isExpanded ? null : feature.id;
                });
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isExpanded ? const Color(0xFF23262E) : const Color(0xFF1D1F25),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isExpanded ? Colors.white24 : Colors.white10,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          feature.title,
                          style: TextStyle(
                            color: isExpanded ? Colors.white : Colors.grey[300],
                            fontWeight: isExpanded ? FontWeight.bold : FontWeight.w600,
                            fontSize: 13,
                          ),
                        ),
                        AnimatedRotation(
                          turns: isExpanded ? 0.125 : 0.0,
                          duration: const Duration(milliseconds: 250),
                          child: Container(
                            width: 22,
                            height: 22,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.add, size: 14, color: Colors.white70),
                          ),
                        ),
                      ],
                    ),
                    if (isExpanded) ...[
                      const SizedBox(height: 8),
                      Text(
                        feature.description,
                        style: TextStyle(color: Colors.grey[400], fontSize: 11),
                      ),
                    ],
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
