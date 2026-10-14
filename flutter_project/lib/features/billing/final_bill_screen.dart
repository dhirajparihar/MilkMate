import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/models/models.dart';
import '../../shared/repositories/doodh_dost_repository.dart';

class FinalBillScreen extends StatelessWidget {
  final DoodhDostRepository repository;
  final VoidCallback onDataChanged;

  const FinalBillScreen({
    super.key,
    required this.repository,
    required this.onDataChanged,
  });

  @override
  Widget build(BuildContext context) {
    final invoices = repository.getInvoices();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bills & Invoices'),
      ),
      body: invoices.isEmpty
          ? const Center(
              child: Text('No finalized bills yet', style: TextStyle(color: AppColors.textSecondary)),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: invoices.length,
              itemBuilder: (context, index) {
                final inv = invoices[index];
                final isPaid = inv.status == InvoiceStatus.paid;

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  elevation: 0,
                  color: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: const BorderSide(color: AppColors.border),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(inv.shopName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            Text('₹${inv.netAmount.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.primaryGreen)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text('${inv.invoiceNumber} · ${inv.invoiceDate.toString().split(' ')[0]}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                        const Divider(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Paid: ₹${inv.paidAmount.toStringAsFixed(0)}', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                            Text('Due: ₹${inv.remainingAmount.toStringAsFixed(0)}', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: inv.remainingAmount > 0 ? const Color(0xFF8C5D19) : AppColors.primaryGreen)),
                          ],
                        ),
                        if (!isPaid) ...[
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primaryGreen,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              icon: const Icon(Icons.payment, size: 18),
                              label: const Text('Record Payment'),
                              onPressed: () {
                                _showPaymentDialog(context, inv);
                              },
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }

  void _showPaymentDialog(BuildContext context, Invoice invoice) {
    final amountCtrl = TextEditingController(text: invoice.remainingAmount.toStringAsFixed(0));
    PaymentMethod method = PaymentMethod.cash;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: Text('Collect Payment: ${invoice.shopName}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Invoice Total Due: ₹${invoice.remainingAmount.toStringAsFixed(0)}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              TextField(
                controller: amountCtrl,
                decoration: const InputDecoration(labelText: 'Amount Received (₹)'),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: RadioListTile<PaymentMethod>(
                      title: const Text('Cash'),
                      value: PaymentMethod.cash,
                      groupValue: method,
                      onChanged: (v) => setDialogState(() => method = v!),
                    ),
                  ),
                  Expanded(
                    child: RadioListTile<PaymentMethod>(
                      title: const Text('UPI'),
                      value: PaymentMethod.upi,
                      groupValue: method,
                      onChanged: (v) => setDialogState(() => method = v!),
                    ),
                  ),
                ],
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryGreen, foregroundColor: Colors.white),
              onPressed: () {
                final amt = double.tryParse(amountCtrl.text) ?? 0.0;
                if (amt > 0) {
                  repository.recordPayment(invoice.id, amt, method, method == PaymentMethod.upi ? 'UPI-APP' : null);
                  Navigator.pop(ctx);
                  onDataChanged();
                }
              },
              child: const Text('Confirm'),
            ),
          ],
        ),
      ),
    );
  }
}
