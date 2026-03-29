import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../state/app_state.dart';
import '../../utils.dart';

class HarvestAddScreen extends StatefulWidget {
  const HarvestAddScreen({super.key, required this.seasonId, required this.cropId});

  final String seasonId;
  final String cropId;

  @override
  State<HarvestAddScreen> createState() => _HarvestAddScreenState();
}

class _HarvestAddScreenState extends State<HarvestAddScreen> {
  final _qty = TextEditingController();
  final _unit = TextEditingController(text: 'kg');
  final _note = TextEditingController();
  String _date = todayIso();
  bool _saving = false;

  @override
  void dispose() {
    _qty.dispose();
    _unit.dispose();
    _note.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final user = context.read<AppState>().user;
    if (user == null) return;
    final qty = double.tryParse(_qty.text.trim());
    if (qty == null || qty <= 0) return;
    setState(() => _saving = true);
    try {
      await context.read<AppState>().firestoreService.createHarvest(
            userId: user.uid,
            cropCycleId: widget.cropId,
            seasonId: widget.seasonId,
            harvestDate: _date,
            quantity: qty,
            unit: _unit.text.trim().isEmpty ? 'kg' : _unit.text.trim(),
            note: _note.text.trim(),
          );
      if (mounted) context.pop();
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Harvest')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _qty,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Quantity', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _unit,
              decoration: const InputDecoration(labelText: 'Unit', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: TextEditingController(text: _date),
              readOnly: true,
              decoration: const InputDecoration(labelText: 'Harvest date', border: OutlineInputBorder()),
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
              controller: _note,
              decoration: const InputDecoration(labelText: 'Note', border: OutlineInputBorder()),
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

