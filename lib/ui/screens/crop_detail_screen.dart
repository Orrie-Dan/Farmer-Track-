import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../metrics.dart';
import '../../models.dart';
import '../../state/app_state.dart';
import '../../utils.dart';
import '../widgets/loading_view.dart';

class CropDetailScreen extends StatefulWidget {
  const CropDetailScreen({super.key, required this.cropId, required this.seasonId});

  final String cropId;
  final String seasonId;

  @override
  State<CropDetailScreen> createState() => _CropDetailScreenState();
}

class _CropDetailScreenState extends State<CropDetailScreen> {
  bool _loading = true;
  CropCycle? _crop;
  List<Expense> _expenses = const [];
  List<Harvest> _harvests = const [];
  List<Sale> _sales = const [];
  CropMetrics? _metrics;
  String _tab = 'overview';

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
      svc.getCrop(user.uid, widget.cropId),
      svc.getExpensesByCrop(user.uid, widget.cropId),
      svc.getHarvestsByCrop(user.uid, widget.cropId),
      svc.getSalesByCrop(user.uid, widget.cropId),
    ]);
    final crop = results[0] as CropCycle?;
    final expenses = results[1] as List<Expense>;
    final harvests = results[2] as List<Harvest>;
    final sales = results[3] as List<Sale>;
    final metrics = computeCropMetrics(expenses: expenses, harvests: harvests, sales: sales);
    if (!mounted) return;
    setState(() {
      _crop = crop;
      _expenses = expenses;
      _harvests = harvests;
      _sales = sales;
      _metrics = metrics;
      _loading = false;
    });
  }

  Future<void> _setStatus(CropStatus status) async {
    final user = context.read<AppState>().user;
    if (user == null) return;
    await context.read<AppState>().firestoreService.updateCropStatus(
          userId: user.uid,
          cropId: widget.cropId,
          status: status,
        );
    await _load();
  }

  Future<void> _deleteExpense(String id) async {
    final user = context.read<AppState>().user;
    if (user == null) return;
    await context.read<AppState>().firestoreService.deleteExpense(user.uid, id);
    await _load();
  }

  Future<void> _deleteHarvest(String id) async {
    final user = context.read<AppState>().user;
    if (user == null) return;
    await context.read<AppState>().firestoreService.deleteHarvest(user.uid, id);
    await _load();
  }

  Future<void> _deleteSale(String id) async {
    final user = context.read<AppState>().user;
    if (user == null) return;
    await context.read<AppState>().firestoreService.deleteSale(user.uid, id);
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_crop?.cropName ?? 'Crop'),
        actions: [
          PopupMenuButton<CropStatus>(
            tooltip: 'Update status',
            onSelected: _setStatus,
            itemBuilder: (_) => const [
              PopupMenuItem(value: CropStatus.planted, child: Text('planted')),
              PopupMenuItem(value: CropStatus.harvested, child: Text('harvested')),
              PopupMenuItem(value: CropStatus.closed, child: Text('closed')),
            ],
            icon: const Icon(Icons.flag_outlined),
          ),
        ],
      ),
      body: _loading
          ? const LoadingView(message: 'Loading crop…')
          : _crop == null
              ? const Center(child: Text('Crop not found.'))
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(12),
                    children: [
                      _Tabs(
                        tab: _tab,
                        onChanged: (t) => setState(() => _tab = t),
                      ),
                      const SizedBox(height: 10),
                      if (_tab == 'overview') _OverviewCard(crop: _crop!, metrics: _metrics!),
                      if (_tab == 'expenses') ...[
                        _AddBar(
                          label: 'Expenses',
                          onAdd: () => context.go('/expenses/add?seasonId=${widget.seasonId}&cropId=${widget.cropId}'),
                        ),
                        ..._expenses.map((e) => Card(
                              child: ListTile(
                                leading: const Icon(Icons.receipt_long),
                                title: Text('${e.category.name} · ${formatCurrency(e.amount)}'),
                                subtitle: Text('${formatDate(e.date)}  ${e.note.isEmpty ? '' : '· ${e.note}'}'),
                                trailing: IconButton(
                                  icon: const Icon(Icons.delete_outline),
                                  onPressed: () => _deleteExpense(e.id),
                                ),
                              ),
                            )),
                      ],
                      if (_tab == 'harvests') ...[
                        _AddBar(
                          label: 'Harvests',
                          onAdd: () => context.go('/harvests/add?seasonId=${widget.seasonId}&cropId=${widget.cropId}'),
                        ),
                        ..._harvests.map((h) => Card(
                              child: ListTile(
                                leading: const Icon(Icons.grass),
                                title: Text('${h.quantity} ${h.unit}'),
                                subtitle: Text('${formatDate(h.harvestDate)}  ${h.note.isEmpty ? '' : '· ${h.note}'}'),
                                trailing: IconButton(
                                  icon: const Icon(Icons.delete_outline),
                                  onPressed: () => _deleteHarvest(h.id),
                                ),
                              ),
                            )),
                      ],
                      if (_tab == 'sales') ...[
                        _AddBar(
                          label: 'Sales',
                          onAdd: () => context.go('/sales/add?seasonId=${widget.seasonId}&cropId=${widget.cropId}'),
                        ),
                        ..._sales.map((s) => Card(
                              child: ListTile(
                                leading: const Icon(Icons.shopping_cart_outlined),
                                title: Text('${s.quantitySold} ${s.unit} · ${formatCurrency(s.totalPrice)}'),
                                subtitle: Text('${formatDate(s.date)} · ${s.buyerType.name} · ${s.paymentStatus.name}'),
                                trailing: IconButton(
                                  icon: const Icon(Icons.delete_outline),
                                  onPressed: () => _deleteSale(s.id),
                                ),
                              ),
                            )),
                      ],
                    ],
                  ),
                ),
    );
  }
}

class _Tabs extends StatelessWidget {
  const _Tabs({required this.tab, required this.onChanged});
  final String tab;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return SegmentedButton<String>(
      segments: const [
        ButtonSegment(value: 'overview', label: Text('Overview'), icon: Icon(Icons.bar_chart)),
        ButtonSegment(value: 'expenses', label: Text('Expenses'), icon: Icon(Icons.receipt_long)),
        ButtonSegment(value: 'harvests', label: Text('Harvests'), icon: Icon(Icons.grass)),
        ButtonSegment(value: 'sales', label: Text('Sales'), icon: Icon(Icons.shopping_cart)),
      ],
      selected: {tab},
      onSelectionChanged: (s) => onChanged(s.first),
    );
  }
}

class _OverviewCard extends StatelessWidget {
  const _OverviewCard({required this.crop, required this.metrics});
  final CropCycle crop;
  final CropMetrics metrics;

  @override
  Widget build(BuildContext context) {
    final profitOk = metrics.profit >= 0;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.spa, color: Colors.green),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '${crop.cropName} · ${crop.status.name}',
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text('Cost: ${formatCurrency(metrics.totalExpenses)}'),
            Text('Revenue: ${formatCurrency(metrics.totalRevenue)}'),
            Text('Profit: ${profitOk ? '+' : ''}${formatCurrency(metrics.profit)}',
                style: TextStyle(fontWeight: FontWeight.w900, color: profitOk ? Colors.green : Colors.red)),
            const SizedBox(height: 10),
            Text('Harvested: ${metrics.harvestedQty} ${crop.unit}'),
            Text('Sold: ${metrics.soldQty} ${crop.unit}'),
            Text('Remaining: ${metrics.remainingQty} ${crop.unit}'),
          ],
        ),
      ),
    );
  }
}

class _AddBar extends StatelessWidget {
  const _AddBar({required this.label, required this.onAdd});
  final String label;
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16))),
          FilledButton.icon(onPressed: onAdd, icon: const Icon(Icons.add), label: const Text('Add')),
        ],
      ),
    );
  }
}

