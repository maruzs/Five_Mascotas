import 'package:flutter/material.dart';

class ReceiptPrintItem {
  final String name;
  final int qty;
  final double price;

  const ReceiptPrintItem({
    required this.name,
    required this.qty,
    required this.price,
  });
}

class ReceiptPrintData {
  final String shopName;
  final String address;
  final String orderNo;
  final String date;
  final List<ReceiptPrintItem> items;
  final double taxRate;
  final String currency;
  final String footerMessage;

  const ReceiptPrintData({
    required this.shopName,
    required this.address,
    required this.orderNo,
    required this.date,
    required this.items,
    this.taxRate = 0.13,
    this.currency = '\$',
    this.footerMessage = 'Thank you!',
  });
}

/// Widget móvil Flutter con la animación completa de 2 etapas:
/// 1. Impresión saliendo de la ranura inferior.
/// 2. Corte de cuchilla (tear-off), elevación al frente y zoom ampliado sobre la máquina.
class ReceiptPrinterModal extends StatefulWidget {
  final ReceiptPrintData receipt;
  final VoidCallback? onPrintComplete;

  const ReceiptPrinterModal({
    super.key,
    required this.receipt,
    this.onPrintComplete,
  });

  @override
  State<ReceiptPrinterModal> createState() => _ReceiptPrinterModalState();
}

class _ReceiptPrinterModalState extends State<ReceiptPrinterModal>
    with TickerProviderStateMixin {
  late AnimationController _printController;
  late AnimationController _zoomController;
  late Animation<double> _heightAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<Offset> _slideAnimation;

  bool _isPrinting = false;
  bool _isCutAndFocused = false;

  @override
  void initState() {
    super.initState();
    // Etapa 1: Salida del papel
    _printController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    );
    _heightAnimation = CurvedAnimation(
      parent: _printController,
      curve: Curves.easeOutCubic,
    );

    // Etapa 2: Corte y Zoom
    _zoomController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.25).animate(
      CurvedAnimation(parent: _zoomController, curve: Curves.easeOutBack),
    );
    _slideAnimation = Tween<Offset>(
      begin: Offset.zero,
      end: const Offset(0, -0.42),
    ).animate(
      CurvedAnimation(parent: _zoomController, curve: Curves.easeOutCubic),
    );
  }

  @override
  void dispose() {
    _printController.dispose();
    _zoomController.dispose();
    super.dispose();
  }

  void _handleAction() {
    if (_isPrinting) return;

    if (_isCutAndFocused) {
      // Reset
      _zoomController.reverse();
      _printController.reverse();
      setState(() {
        _isCutAndFocused = false;
      });
      return;
    }

    setState(() {
      _isPrinting = true;
    });

    _printController.forward().then((_) {
      // Ejecutar corte y zoom frontal
      _zoomController.forward().then((_) {
        if (mounted) {
          setState(() {
            _isPrinting = false;
            _isCutAndFocused = true;
          });
          widget.onPrintComplete?.call();
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final subtotal = widget.receipt.items.fold<double>(
      0.0,
      (sum, it) => sum + (it.qty * it.price),
    );
    final tax = subtotal * widget.receipt.taxRate;
    final total = subtotal + tax;

    return Center(
      child: SizedBox(
        width: 330,
        height: 520,
        child: Stack(
          alignment: Alignment.topCenter,
          clipBehavior: Clip.none,
          children: [
            // 1. Carcasa de la Impresora
            Positioned(
              top: 40,
              child: AnimatedOpacity(
                duration: const Duration(milliseconds: 400),
                opacity: _isCutAndFocused ? 0.75 : 1.0,
                child: Container(
                  width: 320,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDFDACF),
                    borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.25),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Container(
                          height: 38,
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          alignment: Alignment.centerLeft,
                          decoration: BoxDecoration(
                            color: const Color(0xFF1A1C18),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            _isPrinting
                                ? 'Printing...'
                                : _isCutAndFocused
                                    ? 'Done! Tap reset'
                                    : 'Click to print',
                            style: TextStyle(
                              fontFamily: 'monospace',
                              fontSize: 12,
                              color: _isPrinting ? Colors.greenAccent : Colors.grey[400],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      IconButton(
                        onPressed: _handleAction,
                        icon: Icon(
                          _isCutAndFocused ? Icons.refresh : Icons.print,
                          color: Colors.black87,
                        ),
                        style: IconButton.styleFrom(
                          backgroundColor: const Color(0xFFCFC9BA),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // 2. El Recibo (En Stack con Slide y Scale)
            Positioned(
              top: 110,
              child: SlideTransition(
                position: _slideAnimation,
                child: ScaleTransition(
                  scale: _scaleAnimation,
                  child: SizeTransition(
                    sizeFactor: _heightAnimation,
                    axisAlignment: -1.0,
                    child: Container(
                      width: 250,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFBF9F5),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(_isCutAndFocused ? 0.35 : 0.15),
                            blurRadius: _isCutAndFocused ? 30 : 16,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Center(
                            child: Text(
                              widget.receipt.shopName,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                          ),
                          Center(
                            child: Text(
                              widget.receipt.address,
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 10, color: Colors.grey[600]),
                            ),
                          ),
                          const Divider(height: 16, thickness: 0.5),
                          ...widget.receipt.items.map((it) => Padding(
                                padding: const EdgeInsets.symmetric(vertical: 2),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(it.name, style: const TextStyle(fontSize: 11)),
                                    Text('${it.qty}x', style: TextStyle(fontSize: 10, color: Colors.grey[500])),
                                    Text('${(it.qty * it.price).toStringAsFixed(2)} ${widget.receipt.currency}',
                                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                                  ],
                                ),
                              )),
                          const Divider(height: 16, thickness: 0.5),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              Text('${total.toStringAsFixed(2)} ${widget.receipt.currency}',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Center(
                            child: Text(
                              widget.receipt.footerMessage,
                              style: TextStyle(fontSize: 10, color: Colors.grey[500], letterSpacing: 1.5),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
