import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class CowMascotWidget extends StatelessWidget {
  final double size;
  final bool showMilkPacket;

  const CowMascotWidget({
    super.key,
    this.size = 72.0,
    this.showMilkPacket = true,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _CowPainter(showMilkPacket: showMilkPacket),
      ),
    );
  }
}

class _CowPainter extends CustomPainter {
  final bool showMilkPacket;

  _CowPainter({required this.showMilkPacket});

  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.width / 160.0;
    canvas.save();
    canvas.scale(scale, scale);

    final shadowPaint = Paint()..color = const Color(0xFFE2EBE5);
    canvas.drawOval(const Rect.fromLTWH(34, 141, 92, 14), shadowPaint);

    // Body
    final bodyPaint = Paint()..color = Colors.white;
    final strokePaint = Paint()
      ..color = AppColors.border
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;

    canvas.drawOval(const Rect.fromLTWH(32, 56, 96, 84), bodyPaint);
    canvas.drawOval(const Rect.fromLTWH(32, 56, 96, 84), strokePaint);

    // Dark patches on body
    final patchPaint = Paint()..color = AppColors.mascotDark;
    canvas.drawOval(const Rect.fromLTWH(38, 76, 20, 26), patchPaint);
    canvas.drawOval(const Rect.fromLTWH(108, 106, 18, 18), patchPaint);

    // Feet
    final feetPaint = Paint()..color = AppColors.paleGreenBg;
    canvas.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(52, 132, 16, 12), const Radius.circular(6)), feetPaint);
    canvas.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(92, 132, 16, 12), const Radius.circular(6)), feetPaint);

    // Head
    canvas.drawCircle(const Offset(80, 62), 38, bodyPaint);
    canvas.drawCircle(const Offset(80, 62), 38, strokePaint);

    // Head patch
    canvas.drawCircle(const Offset(100, 48), 16, patchPaint);

    // Horns
    final hornPaint = Paint()
      ..color = AppColors.creamAccent
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;
    canvas.drawLine(const Offset(56, 32), const Offset(62, 22), hornPaint);
    canvas.drawLine(const Offset(104, 32), const Offset(98, 22), hornPaint);

    // Ears
    final earPaint = Paint()..color = Colors.white;
    final earInner = Paint()..color = AppColors.mascotPink;
    canvas.drawOval(const Rect.fromLTWH(30, 40, 22, 12), earPaint);
    canvas.drawOval(const Rect.fromLTWH(34, 42, 14, 8), earInner);
    canvas.drawOval(const Rect.fromLTWH(108, 40, 22, 12), earPaint);
    canvas.drawOval(const Rect.fromLTWH(112, 42, 14, 8), earInner);

    // Eyes
    final eyePaint = Paint()..color = AppColors.textMain;
    canvas.drawOval(const Rect.fromLTWH(62, 52, 8, 11), eyePaint);
    canvas.drawOval(const Rect.fromLTWH(90, 52, 8, 11), eyePaint);

    final eyeHighlight = Paint()..color = Colors.white;
    canvas.drawCircle(const Offset(65, 55), 2.5, eyeHighlight);
    canvas.drawCircle(const Offset(93, 55), 2.5, eyeHighlight);

    // Cheeks
    final cheekPaint = Paint()..color = const Color(0xFFFFAEC0).withOpacity(0.65);
    canvas.drawOval(const Rect.fromLTWH(50, 63, 10, 7), cheekPaint);
    canvas.drawOval(const Rect.fromLTWH(100, 63, 10, 7), cheekPaint);

    // Snout
    final snoutPaint = Paint()..color = AppColors.mascotPink;
    canvas.drawOval(const Rect.fromLTWH(58, 62, 44, 26), snoutPaint);

    // Nostrils
    final nostrilPaint = Paint()..color = const Color(0xFF994D60);
    canvas.drawCircle(const Offset(73, 73), 2.5, nostrilPaint);
    canvas.drawCircle(const Offset(87, 73), 2.5, nostrilPaint);

    // Smile
    final smilePaint = Paint()
      ..color = const Color(0xFF8A384B)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.2
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(const Rect.fromLTWH(74, 73, 12, 8), 0.2, 2.7, false, smilePaint);

    // Milk Packet
    if (showMilkPacket) {
      final packetBg = Paint()..color = AppColors.paleGreenBg;
      final packetBorder = Paint()
        ..color = AppColors.primaryGreen
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2;
      canvas.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(108, 86, 22, 30), const Radius.circular(4)), packetBg);
      canvas.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(108, 86, 22, 30), const Radius.circular(4)), packetBorder);

      final greenBand = Paint()..color = AppColors.primaryGreen;
      canvas.drawRect(const Rect.fromLTWH(108, 96, 22, 10), greenBand);
    }

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
