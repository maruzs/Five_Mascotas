import 'package:flutter/material.dart';

class StackingCardModel {
  final String id;
  final String title;
  final String description;
  final Color bgColor;
  final Color textColor;
  final Color placeholderColor;

  const StackingCardModel({
    required this.id,
    required this.title,
    required this.description,
    required this.bgColor,
    required this.textColor,
    this.placeholderColor = const Color(0x17000000),
  });
}

class StackingCards3D extends StatefulWidget {
  final List<StackingCardModel>? items;

  const StackingCards3D({
    Key? key,
    this.items,
  }) : super(key: key);

  @override
  State<StackingCards3D> createState() => _StackingCards3DState();
}

class _StackingCards3DState extends State<StackingCards3D> {
  late final ScrollController _scrollController;

  static const List<StackingCardModel> _defaultCards = [
    StackingCardModel(
      id: 'card-1',
      title: "Here's a sticky card",
      description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      bgColor: Color(0xFFE8C4B8),
      textColor: Color(0xFF2B1A12),
    ),
    StackingCardModel(
      id: 'card-2',
      title: "Here's a sticky card",
      description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      bgColor: Color(0xFFDDE3C0),
      textColor: Color(0xFF1D2212),
    ),
    StackingCardModel(
      id: 'card-3',
      title: "Here's a sticky card",
      description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      bgColor: Color(0xFFC9D6E8),
      textColor: Color(0xFF121A24),
    ),
    StackingCardModel(
      id: 'card-4',
      title: "Here's a sticky card",
      description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      bgColor: Color(0xFFE6D3A3),
      textColor: Color(0xFF241C0C),
    ),
    StackingCardModel(
      id: 'card-5',
      title: "Here's a sticky card",
      description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      bgColor: Color(0xFFD8C7E8),
      textColor: Color(0xFF1C1224),
    ),
  ];

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(() {
      setState(() {});
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cards = widget.items ?? _defaultCards;
    final screenHeight = MediaQuery.of(context).size.height;
    final cardHeight = screenHeight * 0.75;
    final topPadding = screenHeight * 0.1;

    return Container(
      color: Colors.black,
      child: ListView.builder(
        controller: _scrollController,
        itemCount: cards.length,
        padding: EdgeInsets.symmetric(vertical: topPadding, horizontal: 16),
        itemBuilder: (context, index) {
          final card = cards[index];
          final isLast = index == cards.length - 1;

          // Compute scroll progress relative to this item
          final scrollOffset = _scrollController.hasClients ? _scrollController.offset : 0.0;
          final itemStart = index * (cardHeight + 20);
          final progress = ((scrollOffset - itemStart) / cardHeight).clamp(0.0, 1.0);

          final rotationAngle = isLast ? 0.0 : progress * 0.40; // ~23 degrees
          final scaleVal = isLast ? 1.0 : (1.0 - progress * 0.15); // scales to 0.85
          final opacityVal = isLast ? 1.0 : (1.0 - progress * 0.45);

          return Padding(
            padding: const EdgeInsets.only(bottom: 24.0),
            child: Transform(
              alignment: Alignment.bottomCenter,
              transform: Matrix4.identity()
                ..setEntry(3, 2, 0.0015) // perspective
                ..rotateX(rotationAngle)
                ..scale(scaleVal),
              child: Opacity(
                opacity: opacityVal.clamp(0.3, 1.0),
                child: Container(
                  height: cardHeight,
                  decoration: BoxDecoration(
                    color: card.bgColor,
                    borderRadius: BorderRadius.circular(32),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        card.title,
                        style: TextStyle(
                          color: card.textColor,
                          fontSize: 28,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        card.description,
                        style: TextStyle(
                          color: card.textColor.withOpacity(0.8),
                          fontSize: 14,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 20),
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            color: card.placeholderColor,
                            borderRadius: BorderRadius.circular(20),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
