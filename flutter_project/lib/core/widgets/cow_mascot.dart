import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

enum CowMood { happy, delivery, celebrating, sleeping }

class CowMascotWidget extends StatelessWidget {
  final double size;
  final bool showMilkPacket;
  final CowMood mood;

  const CowMascotWidget({
    super.key,
    this.size = 72.0,
    this.showMilkPacket = true,
    this.mood = CowMood.happy,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _CowPainter(showMilkPacket: showMilkPacket, mood: mood),
      ),
    );
  }
}

class _CowPainter extends CustomPainter {
  final bool showMilkPacket;
  final CowMood mood;

  _CowPainter({required this.showMilkPacket, required this.mood});

  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.width / 160.0;
    canvas.save();
    canvas.scale(scale, scale);

    // 1. Soft shadow under cow
    final shadowPaint = Paint()..color = const Color(0xFFE2EBE5).withValues(alpha: 0.8);
    canvas.drawOval(
      Rect.fromCenter(center: const Offset(80, 148), width: 92, height: 14),
      shadowPaint,
    );

    // 2. Tail
    final tailPaint = Paint()
      ..color = const Color(0xFF4A524D)
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;
    final tailPath = Path()
      ..moveTo(32, 108)
      ..cubicTo(22, 102, 24, 88, 18, 90);
    canvas.drawPath(tailPath, tailPaint);

    final tailPuff = Paint()..color = const Color(0xFF202820);
    canvas.drawCircle(const Offset(17, 90), 4.5, tailPuff);

    // 3. Round White Body
    final bodyPaint = Paint()..color = Colors.white;
    final bodyStroke = Paint()
      ..color = const Color(0xFFE7ECE8)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;

    final bodyRect = Rect.fromCenter(center: const Offset(80, 98), width: 96, height: 84);
    canvas.drawOval(bodyRect, bodyPaint);
    canvas.drawOval(bodyRect, bodyStroke);

    // 4. Cow Body Black Patches
    final patchPaint = Paint()..color = const Color(0xFF2C3530);
    final patch1 = Path()
      ..moveTo(52, 82)
      ..cubicTo(48, 72, 38, 78, 34, 88)
      ..cubicTo(32, 94, 38, 104, 46, 104)
      ..cubicTo(52, 104, 56, 90, 52, 82)
      ..close();
    canvas.drawPath(patch1, patchPaint);

    final patch2 = Path()
      ..moveTo(112, 110)
      ..cubicTo(118, 102, 126, 106, 127, 114)
      ..cubicTo(128, 122, 120, 126, 114, 126)
      ..cubicTo(108, 126, 108, 116, 112, 110)
      ..close();
    canvas.drawPath(patch2, patchPaint);

    // 5. Cute Little Feet
    final footPaint = Paint()..color = const Color(0xFFF1F8F3);
    final footStroke = Paint()
      ..color = const Color(0xFFD3DFD7)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    final hoofLine = Paint()
      ..color = const Color(0xFF6B756D)
      ..strokeWidth = 1.5;

    final leftFoot = RRect.fromRectAndRadius(
      const Rect.fromLTWH(52, 132, 16, 12),
      const Radius.circular(6),
    );
    canvas.drawRRect(leftFoot, footPaint);
    canvas.drawRRect(leftFoot, footStroke);
    canvas.drawLine(const Offset(52, 138), const Offset(68, 138), hoofLine);

    final rightFoot = RRect.fromRectAndRadius(
      const Rect.fromLTWH(92, 132, 16, 12),
      const Radius.circular(6),
    );
    canvas.drawRRect(rightFoot, footPaint);
    canvas.drawRRect(rightFoot, footStroke);
    canvas.drawLine(const Offset(92, 138), const Offset(108, 138), hoofLine);

    // 6. Head Base
    canvas.drawCircle(const Offset(80, 62), 38, bodyPaint);
    canvas.drawCircle(const Offset(80, 62), 38, bodyStroke);

    // 7. Head Black Patch
    final headPatch = Path()
      ..moveTo(86, 28)
      ..cubicTo(98, 28, 114, 42, 112, 58)
      ..cubicTo(110, 68, 102, 68, 98, 62)
      ..cubicTo(94, 56, 94, 40, 86, 34)
      ..cubicTo(82, 32, 80, 28, 86, 28)
      ..close();
    canvas.drawPath(headPatch, patchPaint);

    // 8. Horns
    final hornFill = Paint()..color = const Color(0xFFFFF0D9);
    final hornStroke = Paint()
      ..color = const Color(0xFFE0CDAF)
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final leftHorn = Path()
      ..moveTo(56, 32)
      ..cubicTo(52, 22, 58, 18, 64, 25);
    canvas.drawPath(leftHorn, hornFill);
    canvas.drawPath(leftHorn, hornStroke);

    final rightHorn = Path()
      ..moveTo(104, 32)
      ..cubicTo(108, 22, 102, 18, 96, 25);
    canvas.drawPath(rightHorn, hornFill);
    canvas.drawPath(rightHorn, hornStroke);

    // 9. Ears
    final earOuter = Paint()..color = Colors.white;
    final earStroke = Paint()
      ..color = const Color(0xFFE7ECE8)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    final earInner = Paint()..color = const Color(0xFFFFCCD8);

    // Left Ear (rotated -28 deg)
    canvas.save();
    canvas.translate(45, 46);
    canvas.rotate(-28 * math.pi / 180);
    canvas.drawOval(Rect.fromCenter(center: Offset.zero, width: 28, height: 16), earOuter);
    canvas.drawOval(Rect.fromCenter(center: Offset.zero, width: 28, height: 16), earStroke);
    canvas.drawOval(Rect.fromCenter(center: Offset.zero, width: 18, height: 10), earInner);
    canvas.restore();

    // Right Ear (rotated +28 deg)
    canvas.save();
    canvas.translate(115, 46);
    canvas.rotate(28 * math.pi / 180);
    canvas.drawOval(Rect.fromCenter(center: Offset.zero, width: 28, height: 16), earOuter);
    canvas.drawOval(Rect.fromCenter(center: Offset.zero, width: 28, height: 16), earStroke);
    canvas.drawOval(Rect.fromCenter(center: Offset.zero, width: 18, height: 10), earInner);
    canvas.restore();

    // 10. Eyes
    if (mood == CowMood.celebrating) {
      // Star sparkles
      final starPaint = Paint()..color = AppColors.primaryGreen;
      _drawStar(canvas, const Offset(66, 56), 6, starPaint);
      _drawStar(canvas, const Offset(96, 56), 6, starPaint);
    } else if (mood == CowMood.sleeping) {
      final sleepPaint = Paint()
        ..color = const Color(0xFF202820)
        ..strokeWidth = 2.5
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;
      canvas.drawArc(Rect.fromCenter(center: const Offset(66, 56), width: 12, height: 8), 0, math.pi, false, sleepPaint);
      canvas.drawArc(Rect.fromCenter(center: const Offset(94, 56), width: 12, height: 8), 0, math.pi, false, sleepPaint);
    } else {
      // Expressive cute friendly eyes with highlights
      final eyePaint = Paint()..color = const Color(0xFF202820);
      final highlight = Paint()..color = Colors.white;

      // Left eye
      canvas.drawOval(Rect.fromCenter(center: const Offset(66, 56), width: 9, height: 12), eyePaint);
      canvas.drawCircle(const Offset(68, 53.5), 2.0, highlight);
      canvas.drawCircle(const Offset(65, 58), 0.8, highlight);

      // Right eye
      canvas.drawOval(Rect.fromCenter(center: const Offset(94, 56), width: 9, height: 12), eyePaint);
      canvas.drawCircle(const Offset(96, 53.5), 2.0, highlight);
      canvas.drawCircle(const Offset(93, 58), 0.8, highlight);
    }

    // 11. Rosy Cheeks
    final cheekPaint = Paint()..color = const Color(0xFFFFAEC0).withValues(alpha: 0.65);
    canvas.drawOval(Rect.fromCenter(center: const Offset(54, 65), width: 10, height: 7), cheekPaint);
    canvas.drawOval(Rect.fromCenter(center: const Offset(106, 65), width: 10, height: 7), cheekPaint);

    // 12. Soft Pink Muzzle / Snout
    final snoutPaint = Paint()..color = const Color(0xFFFFCCD8);
    final snoutStroke = Paint()
      ..color = const Color(0xFFF5A8BA)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    final snoutRect = Rect.fromCenter(center: const Offset(80, 74), width: 44, height: 28);
    canvas.drawOval(snoutRect, snoutPaint);
    canvas.drawOval(snoutRect, snoutStroke);

    // Nostrils
    final nostrilPaint = Paint()..color = const Color(0xFF994D60);
    canvas.drawOval(Rect.fromCenter(center: const Offset(73, 73), width: 4.4, height: 6.4), nostrilPaint);
    canvas.drawOval(Rect.fromCenter(center: const Offset(87, 73), width: 4.4, height: 6.4), nostrilPaint);

    // Sweet Smile
    final smilePaint = Paint()
      ..color = const Color(0xFF8A384B)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.2
      ..strokeCap = StrokeCap.round;
    final smilePath = Path()
      ..moveTo(74, 78)
      ..cubicTo(77, 82, 83, 82, 86, 78);
    canvas.drawPath(smilePath, smilePaint);

    // 13. Delivery Cap (if mood is delivery)
    if (mood == CowMood.delivery) {
      final capPaint = Paint()..color = AppColors.primaryGreen;
      final capDark = Paint()..color = const Color(0xFF1C533A);
      final capBadge = Paint()..color = const Color(0xFFB9E6C8);

      final capPath = Path()
        ..moveTo(60, 30)
        ..cubicTo(66, 22, 94, 22, 100, 30)
        ..lineTo(108, 34)
        ..cubicTo(80, 26, 52, 34, 52, 34)
        ..close();
      canvas.drawPath(capPath, capPaint);
      canvas.drawOval(Rect.fromCenter(center: const Offset(80, 27), width: 36, height: 14), capPaint);

      final visorPath = Path()
        ..moveTo(52, 34)
        ..cubicTo(68, 31, 92, 31, 108, 34)
        ..cubicTo(114, 36, 102, 40, 80, 40)
        ..cubicTo(58, 40, 46, 36, 52, 34)
        ..close();
      canvas.drawPath(visorPath, capDark);
      canvas.drawCircle(const Offset(80, 24), 2.5, capBadge);
    }

    // 14. Milk Packet Accessory
    if (showMilkPacket) {
      canvas.save();
      canvas.translate(104, 82);

      final pouchBg = Paint()..color = const Color(0xFFF1F8F3);
      final pouchBorder = Paint()
        ..color = AppColors.primaryGreen
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2;

      final pouchPath = Path()
        ..moveTo(4, 6)
        ..cubicTo(4, 2, 24, 2, 24, 6)
        ..lineTo(26, 34)
        ..cubicTo(26, 38, 4, 38, 4, 34)
        ..close();
      canvas.drawPath(pouchPath, pouchBg);
      canvas.drawPath(pouchPath, pouchBorder);

      // Pinch seals
      final sealPaint = Paint()
        ..color = AppColors.primaryGreen
        ..strokeWidth = 2.5
        ..strokeCap = StrokeCap.round;
      canvas.drawLine(const Offset(2, 5), const Offset(26, 5), sealPaint);
      canvas.drawLine(const Offset(2, 35), const Offset(26, 35), sealPaint);

      // Green brand band
      final bandPaint = Paint()..color = AppColors.primaryGreen;
      canvas.drawRect(const Rect.fromLTWH(4, 14, 22, 12), bandPaint);

      // White droplet
      final dropletPaint = Paint()..color = Colors.white;
      canvas.drawCircle(const Offset(15, 20), 3, dropletPaint);
      final tipPath = Path()
        ..moveTo(15, 16)
        ..lineTo(17.5, 19)
        ..lineTo(12.5, 19)
        ..close();
      canvas.drawPath(tipPath, dropletPaint);

      // Label "DOODH"
      final textPainter = TextPainter(
        text: const TextSpan(
          text: 'DOODH',
          style: TextStyle(
            color: AppColors.primaryGreen,
            fontSize: 4.5,
            fontWeight: FontWeight.bold,
            fontFamily: 'sans-serif',
          ),
        ),
        textDirection: TextDirection.ltr,
      );
      textPainter.layout();
      textPainter.paint(canvas, Offset(15 - textPainter.width / 2, 29));

      canvas.restore();
    }

    canvas.restore();
  }

  void _drawStar(Canvas canvas, Offset center, double radius, Paint paint) {
    final path = Path();
    for (int i = 0; i < 8; i++) {
      final r = i.isEven ? radius : radius * 0.45;
      final angle = i * math.pi / 4;
      final x = center.dx + r * math.cos(angle);
      final y = center.dy + r * math.sin(angle);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _CowPainter oldDelegate) =>
      oldDelegate.showMilkPacket != showMilkPacket || oldDelegate.mood != mood;
}
