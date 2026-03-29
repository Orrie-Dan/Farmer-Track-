import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../models.dart';
import '../../state/app_state.dart';
import '../../utils.dart';

class SaleAddScreen extends StatefulWidget {
  const SaleAddScreen({super.key, required this.seasonId, required this.cropId});

  final String seasonId;
  final String cropId;

  @override
  State<SaleAddScreen> createState() => _SaleAddScreenState();
}

class _SaleAddScreenState extends State<SaleAddScreen> {
  final _qty = TextEditingController();
  final _unit = TextEditingController(text: 'kg');
  final _ppu = TextEditingController();
  final _buyerName = TextEditingController();
  final _note = TextEditingController();
  BuyerType _buyerType = BuyerType.market;
  PaymentStatus _paymentStatus = PaymentStatus.paid;
  String _date = todayIso();
  bool _saving = false;

  @override
  void dispose() {
    _qty.dispose();
    _unit.dispose();
    _ppu.dispose();
    _buyerName.dispose();
    _note.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final user = context.read<AppState>().user;
    if (user == null) return;
    final qty = double.tryParse(_qty.text.trim());
    final ppu = double.tryParse(_ppu.text.trim());
    if (qty == null || qty <= 0 || ppu == null || ppu <= 0) return;

    setState(() => _saving = true);
    try {
      await context.read<AppState>().firestoreService.createSale(
            userId: user.uid,
            cropCycleId: widget.cropId,
            seasonId: widget.seasonId,
            date: _date,
            quantitySold: qty,
            unit: _unit.text.trim().isEmpty ? 'kg' : _unit.text.trim(),
            pricePerUnit: ppu,
            buyerType: _buyerType,
            paymentStatus: _paymentStatus,
            buyerName: _buyerName.text.trim().isEmpty ? null : _buyerName.text.trim(),
            note: _note.text.trim().isEmpty ? null : _note.text.trim(),
          );
      if (mounted) context.pop();
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Sale')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _qty,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Quantity sold', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _unit,
              decoration: const InputDecoration(labelText: 'Unit', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _ppu,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Price per unit', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<BuyerType>(
              value: _buyerType,
              decoration: const InputDecoration(labelText: 'Buyer type', border: OutlineInputBorder()),
              items: BuyerType.values.map((b) => DropdownMenuItem(value: b, child: Text(b.name))).toList(),
              onChanged: (v) => setState(() => _buyerType = v ?? BuyerType.market),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<PaymentStatus>(
              value: _paymentStatus,
              decoration: const InputDecoration(labelText: 'Payment status', border: OutlineInputBorder()),
              items: PaymentStatus.values.map((p) => DropdownMenuItem(value: p, child: Text(p.name))).toList(),
              onChanged: (v) => setState(() => _paymentStatus = v ?? PaymentStatus.paid),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: TextEditingController(text: _date),
              readOnly: true,
              decoration: const InputDecoration(labelText: 'Date', border: OutlineInputBorder()),
              onTap: () async {
                final init = DateTime.tryParse(_date) ?? DateTime.now();
                final picked = await showDatePicker(
                  context: context,
                  initialDate: init,
                  firstDate: DateTime(2000),
                  lastDate: DateTime(2100),
                );
                if (picked == null) return;
                final iso =
                    '${picked.year.toString().padLeft(4, '0')}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
                setState(() => _date = iso);
              },
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _buyerName,
              decoration: const InputDecoration(labelText: 'Buyer name (optional)', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _note,
              decoration: const InputDecoration(labelText: 'Note (optional)', border: OutlineInputBorder()),
              maxLines: 2,
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: _saving ? null : _save,
                child: _saving
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Save'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

