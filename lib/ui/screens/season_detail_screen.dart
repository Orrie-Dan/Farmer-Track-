import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../metrics.dart';
import '../../models.dart';
import '../../state/app_state.dart';
import '../../utils.dart';
import '../widgets/loading_view.dart';

class SeasonDetailScreen extends StatefulWidget {
  const SeasonDetailScreen({super.key, required this.seasonId});

  final String seasonId;

  @override
  State<SeasonDetailScreen> createState() => _SeasonDetailScreenState();
}

class _SeasonDetailScreenState extends State<SeasonDetailScreen> {
  bool _loading = true;
  Season? _season;
  List<CropCycle> _crops = const [];
  List<Expense> _expenses = const [];
  List<Harvest> _harvests = const [];
  List<Sale> _sales = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final user = context.read<AppState>().user;
    if (user == null) return;
    setState(() => _loading = true);
    final svc = context.read<AppState>().firestoreService;
    final results = await Future.wait([
      svc.getSeason(user.uid, widget.seasonId),
      svc.getCropsBySeason(user.uid, widget.seasonId),
      svc.getExpensesBySeason(user.uid, widget.seasonId),
      svc.getHarvestsBySeason(user.uid, widget.seasonId),
      svc.getSalesBySeason(user.uid, widget.seasonId),
    ]);
    if (!mounted) return;
    setState(() {
      _season = results[0] as Season?;
      _crops = results[1] as List<CropCycle>;
      _expenses = results[2] as List<Expense>;
      _harvests = results[3] as List<Harvest>;
      _sales = results[4] as List<Sale>;
      _loading = false;
    });
  }

  Future<void> _addCrop() async {
    final res = await showDialog<_CropFormResult>(
      context: context,
      builder: (context) => const _AddCropDialog(),
    );
    if (res == null) return;
    final user = context.read<AppState>().user;
    if (user == null) return;
    await context.read<AppState>().firestoreService.createCropCycle(
          userId: user.uid,
          seasonId: widget.seasonId,
          cropName: res.cropName,
          fieldName: res.fieldName.isEmpty ? 'Main Field' : res.fieldName,
          plantingDate: res.plantingDate,
          expectedHarvestDate: res.expectedHarvestDate.isEmpty ? res.plantingDate : res.expectedHarvestDate,
          unit: res.unit,
          status: CropStatus.planted,
        );
    await _load();
  }

  Future<void> _deleteCrop(CropCycle crop) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete crop?'),
        content: const Text('Delete this crop and all its records?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete')),
        ],
      ),
    );
    if (ok != true) return;
    final user = context.read<AppState>().user;
    if (user == null) return;
    await context.read<AppState>().firestoreService.deleteCrop(user.uid, crop.id);
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    final currency = _season?.currency ?? 'RWF';
    final totalExp = _expenses.fold<double>(0, (s, e) => s + e.amount);
    final totalRev = _sales.fold<double>(0, (s, e) => s + e.totalPrice);
    final totalProfit = totalRev - totalExp;

    return Scaffold(
      appBar: AppBar(
        title: Text(_season?.name ?? 'Season'),
        actions: [
          IconButton(onPressed: _loading ? null : _addCrop, icon: const Icon(Icons.add), tooltip: 'Add crop'),
        ],
      ),
      body: _loading
          ? const LoadingView(message: 'Loading season…')
          : _season == null
              ? const Center(child: Text('Season not found.'))
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(12),
                    children: [
                      Row(
                        children: [
                          Expanded(child: _MiniStat(label: 'Expenses', value: formatCurrency(totalExp, currency: currency), icon: Icons.attach_money)),
                          const SizedBox(width: 10),
                          Expanded(child: _MiniStat(label: 'Revenue', value: formatCurrency(totalRev, currency: currency), icon: Icons.trending_up)),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _MiniStat(
                              label: 'Profit',
                              value: formatCurrency(totalProfit, currency: currency),
                              icon: totalProfit >= 0 ? Icons.trending_up : Icons.trending_down,
                              accent: totalProfit >= 0 ? Colors.green : Colors.red,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Text('Crops (${_crops.length})', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                      const SizedBox(height: 8),
                      if (_crops.isEmpty)
                        Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.spa, size: 48, color: Colors.black38),
                                const SizedBox(height: 8),
                                const Text('No crops yet', style: TextStyle(fontWeight: FontWeight.w900)),
                                const SizedBox(height: 6),
                                const Text('Add your first crop to this season', style: TextStyle(color: Colors.black54)),
                                const SizedBox(height: 12),
                                FilledButton.icon(onPressed: _addCrop, icon: const Icon(Icons.add), label: const Text('Add Crop')),
                              ],
                            ),
                          ),
                        )
                      else
                        ..._crops.map((crop) {
                          return Card(
                            child: ListTile(
                              leading: const Icon(Icons.spa, color: Colors.green),
                              title: Text(crop.cropName, maxLines: 1, overflow: TextOverflow.ellipsis),
                              subtitle: Text('${crop.fieldName} · Planted ${formatDate(crop.plantingDate)}'),
                              trailing: IconButton(
                                icon: const Icon(Icons.delete_outline),
                                onPressed: () => _deleteCrop(crop),
                              ),
                              onTap: () => context.go('/crops/${crop.id}?seasonId=${widget.seasonId}'),
                            ),
                          );
                        }),
                    ],
                  ),
                ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  const _MiniStat({
    required this.label,
    required this.value,
    required this.icon,
    this.accent,
  });
  final String label;
  final String value;
  final IconData icon;
  final Color? accent;

  @override
  Widget build(BuildContext context) {
    final c = accent ?? Colors.black45;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Icon(icon, color: c),
            const SizedBox(height: 6),
            Text(label, style: const TextStyle(color: Colors.black54, fontWeight: FontWeight.w700, fontSize: 12)),
            const SizedBox(height: 4),
            Text(value, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w900)),
          ],
        ),
      ),
    );
  }
}

class _CropFormResult {
  const _CropFormResult({
    required this.cropName,
    required this.fieldName,
    required this.plantingDate,
    required this.expectedHarvestDate,
    required this.unit,
  });
  final String cropName;
  final String fieldName;
  final String plantingDate;
  final String expectedHarvestDate;
  final String unit;
}

class _AddCropDialog extends StatefulWidget {
  const _AddCropDialog();

  @override
  State<_AddCropDialog> createState() => _AddCropDialogState();
}

class _AddCropDialogState extends State<_AddCropDialog> {
  final _cropName = TextEditingController();
  final _fieldName = TextEditingController();
  String _planting = todayIso();
  String _expected = '';
  String _unit = 'kg';

  @override
  void dispose() {
    _cropName.dispose();
    _fieldName.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Crop'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _cropName,
              decoration: const InputDecoration(labelText: 'Crop name', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _fieldName,
              decoration: const InputDecoration(labelText: 'Field / location', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 10),
            _DatePick(label: 'Planting date', value: _planting, onChanged: (v) => setState(() => _planting = v)),
            const SizedBox(height: 10),
            _DatePick(label: 'Expected harvest', value: _expected.isEmpty ? _planting : _expected, onChanged: (v) => setState(() => _expected = v)),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              value: _unit,
              decoration: const InputDecoration(labelText: 'Unit', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(value: 'kg', child: Text('kg')),
                DropdownMenuItem(value: 'bags', child: Text('bags')),
                DropdownMenuItem(value: 'tons', child: Text('tons')),
                DropdownMenuItem(value: 'bundles', child: Text('bundles')),
              ],
              onChanged: (v) => setState(() => _unit = v ?? 'kg'),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        FilledButton(
          onPressed: () {
            final name = _cropName.text.trim();
            if (name.isEmpty) return;
            Navigator.pop(
              context,
              _CropFormResult(
                cropName: name,
                fieldName: _fieldName.text.trim(),
                plantingDate: _planting,
                expectedHarvestDate: _expected,
                unit: _unit,
              ),
            );
          },
          child: const Text('Add'),
        ),
      ],
    );
  }
}

class _DatePick extends StatelessWidget {
  const _DatePick({required this.label, required this.value, required this.onChanged});
  final String label;
  final String value;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Text(label)),
        const SizedBox(width: 10),
        Expanded(
          child: TextField(
            controller: TextEditingController(text: value),
            readOnly: true,
            decoration: const InputDecoration(border: OutlineInputBorder()),
            onTap: () async {
              final init = DateTime.tryParse(value) ?? DateTime.now();
              final picked = await showDatePicker(
                context: context,
                initialDate: init,
                firstDate: DateTime(2000),
                lastDate: DateTime(2100),
              );
              if (picked == null) return;
              final iso =
                  '${picked.year.toString().padLeft(4, '0')}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
              onChanged(iso);
            },
          ),
        ),
      ],
    );
  }
}

