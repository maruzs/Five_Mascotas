import 'package:flutter/material.dart';

class DroppingCardModel {
  final String id;
  final String title;
  final List<String> tags;
  final String imageUrl;
  final Color bgColor;
  final Color textColor;
  final Color tagColor;

  const DroppingCardModel({
    required this.id,
    required this.title,
    required this.tags,
    required this.imageUrl,
    required this.bgColor,
    this.textColor = const Color(0xFF111827),
    this.tagColor = const Color(0xFF374151),
  });
}

class DroppingCardsStack extends StatefulWidget {
  final List<DroppingCardModel>? items;
  final double cardWidth;
  final double cardHeight;

  const DroppingCardsStack({
    Key? key,
    this.items,
    this.cardWidth = 320,
    this.cardHeight = 220,
  }) : super(key: key);

  @override
  State<DroppingCardsStack> createState() => _DroppingCardsStackState();
}

class _DroppingCardsStackState extends State<DroppingCardsStack>
    with SingleTickerProviderStateMixin {
  late List<int> _deck;
  late AnimationController _animController;
  late Animation<double> _dropTranslation;
  late Animation<double> _dropRotation;
  late Animation<double> _dropOpacity;

  bool _isDropping = false;
  bool _isReversing = false;

  static const List<DroppingCardModel> _defaultCards = [
    DroppingCardModel(
      id: 'branding',
      title: 'Branding & Identity.',
      tags: ['Brand Strategy', 'Logo Design', 'Visual Identity'],
      imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80',
      bgColor: Color(0xFFF3B755),
      textColor: Color(0xFF111827),
    ),
    DroppingCardModel(
      id: 'marketing',
      title: 'Marketing.',
      tags: ['Ads Creation', 'SEO Setup', 'Email Marketing', 'Funnel Strategy'],
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=80',
      bgColor: Color(0xFFF4F4F4),
      textColor: Color(0xFF111827),
    ),
    DroppingCardModel(
      id: 'ux',
      title: 'UX Strategy.',
      tags: ['UX audits', 'Wireframes & Prototypes', 'User Testing'],
      imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80',
      bgColor: Color(0xFF7A52E0),
      textColor: Colors.white,
      tagColor: Color(0xFFE9D5FF),
    ),
    DroppingCardModel(
      id: 'dev',
      title: 'Web & App Dev.',
      tags: ['Fullstack Architecture', 'Mobile Apps', 'High-velocity APIs'],
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80',
      bgColor: Color(0xFFCAAEFC),
      textColor: Color(0xFF1E1B4B),
      tagColor: Color(0xFF4338CA),
    ),
  ];

  @override
  void initState() {
    super.initState();
    final list = widget.items ?? _defaultCards;
    _deck = List.generate(list.length, (i) => i);

    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 450),
    );

    _dropTranslation = Tween<double>(begin: 0.0, end: 180.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInCubic),
    );

    _dropRotation = Tween<double>(begin: 0.0, end: 0.12).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInCubic),
    );

    _dropOpacity = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(
        parent: _animController,
        curve: const Interval(0.6, 1.0, curve: Curves.easeOut),
      ),
    );

    _animController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        setState(() {
          if (_isDropping) {
            _deck.add(_deck.removeAt(0));
            _isDropping = false;
          } else if (_isReversing) {
            _isReversing = false;
          }
          _animController.reset();
        });
      }
    });
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _next() {
    if (_animController.isAnimating || _deck.length <= 1) return;
    setState(() {
      _isDropping = true;
      _isReversing = false;
    });
    _animController.forward(from: 0.0);
  }

  void _prev() {
    if (_animController.isAnimating || _deck.length <= 1) return;
    setState(() {
      _deck.insert(0, _deck.removeLast());
      _isDropping = false;
      _isReversing = true;
    });
    _animController.forward(from: 0.0);
  }

  @override
  Widget build(BuildContext context) {
    final list = widget.items ?? _defaultCards;
    final maxVisible = 4;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: widget.cardWidth + 60,
          height: widget.cardHeight + 60,
          child: Stack(
            clipBehavior: Clip.none,
            children: List.generate(
              _deck.length < maxVisible ? _deck.length : maxVisible,
              (revIndex) {
                // Render from back to front
                final position = (maxVisible - 1) - revIndex;
                if (position >= _deck.length) return const SizedBox.shrink();
                final cardIndex = _deck[position];
                final card = list[cardIndex];

                final offsetX = position * 18.0;
                final offsetY = position * 16.0;

                return AnimatedBuilder(
                  animation: _animController,
                  builder: (context, child) {
                    double animY = offsetY;
                    double animX = offsetX;
                    double animRot = 0.0;
                    double animOp = 1.0;

                    if (position == 0 && _isDropping) {
                      animY += _dropTranslation.value;
                      animX += _dropTranslation.value * 0.1;
                      animRot = _dropRotation.value;
                      animOp = _dropOpacity.value;
                    } else if (position == 0 && _isReversing) {
                      animY = (1.0 - _animController.value) * -120.0;
                      animRot = (1.0 - _animController.value) * -0.08;
                      animOp = _animController.value;
                    }

                    return Positioned(
                      left: animX,
                      top: animY,
                      child: Transform.rotate(
                        angle: animRot,
                        alignment: Alignment.bottomLeft,
                        child: Opacity(
                          opacity: animOp.clamp(0.0, 1.0),
                          child: GestureDetector(
                            onTap: _next,
                            child: _buildCard(card),
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ),
        const SizedBox(height: 24),
        // Controls
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton.filled(
              onPressed: _prev,
              style: IconButton.styleFrom(
                backgroundColor: const Color(0xFF1E293B),
                foregroundColor: Colors.white,
              ),
              icon: const Icon(Icons.chevron_left),
            ),
            const SizedBox(width: 12),
            IconButton.filled(
              onPressed: _next,
              style: IconButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: const Color(0xFF0F172A),
              ),
              icon: const Icon(Icons.chevron_right),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCard(DroppingCardModel card) {
    return Container(
      width: widget.cardWidth,
      height: widget.cardHeight,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: card.bgColor,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.25),
            blurRadius: 16,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Top Row: Inset image + tags
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Image.network(
                  card.imageUrl,
                  width: 90,
                  height: 60,
                  fit: BoxFit.cover,
                  errorBuilder: (ctx, err, stack) => Container(
                    width: 90,
                    height: 60,
                    color: Colors.black12,
                    child: const Icon(Icons.image, color: Colors.black26),
                  ),
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: card.tags
                    .map(
                      (t) => Padding(
                        padding: const EdgeInsets.only(bottom: 2),
                        child: Text(
                          t,
                          style: TextStyle(
                            color: card.tagColor,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    )
                    .toList(),
              ),
            ],
          ),
          // Bottom Headline
          Text(
            card.title,
            style: TextStyle(
              color: card.textColor,
              fontSize: 26,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.8,
              height: 1.1,
            ),
          ),
        ],
      ),
    );
  }
}
