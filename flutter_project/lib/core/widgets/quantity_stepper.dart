import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class QuantityStepperWidget extends StatelessWidget {
  final int value;
  final ValueChanged<int> onChanged;
  final int min;
  final int max;
  final int step;
  final String? unit;

  const QuantityStepperWidget({
    super.key,
    required this.value,
    required this.onChanged,
    this.min = 0,
    this.max = 9999,
    this.step = 1,
    this.unit,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.paleGreenBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.softGreen.withValues(alpha: 0.6)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Decrement button
          InkWell(
            onTap: value > min ? () => onChanged((value - step).clamp(min, max)) : null,
            borderRadius: BorderRadius.circular(8),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.remove,
                size: 18,
                color: value > min ? AppColors.primaryGreen : Colors.grey.shade400,
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Value
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '$value',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textMain,
                ),
              ),
              if (unit != null)
                Text(
                  unit!,
                  style: const TextStyle(
                    fontSize: 10,
                    color: AppColors.textSecondary,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 8),
          // Increment button
          InkWell(
            onTap: value < max ? () => onChanged((value + step).clamp(min, max)) : null,
            borderRadius: BorderRadius.circular(8),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: AppColors.primaryGreen,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.add,
                size: 18,
                color: value < max ? Colors.white : Colors.white54,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
