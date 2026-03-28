import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../metrics.dart';
import '../../models.dart';
import '../../state/app_state.dart';
import '../../utils.dart';
import '../widgets/loading_view.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _loading = true;
  List<Season> _seasons = const [];
  String? _selectedSeasonId;
  SeasonMetrics? _metrics;

  @override
  void initState() {
    super.initState();
    _loadSeasons();
  }

  Future<void> _loadSeasons() async {
    final user = context.read<AppState>().user;
    if (user == null) return;
    setState(() => _loading = true);
    final seasons = await context.read<AppState>().firestoreService.getSeasons(user.uid);
    if (!mounted) return;
    setState(() {
      _seasons = seasons;
      _selectedSeasonId ??= seasons.isNotEmpty ? seasons.first.id : null;
    });
    if (_selectedSeasonId != null) {
      await _loadMetrics();
    } else {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _loadMetrics() async {
    final user = context.read<AppState>().user;
    final seasonId = _selectedSeasonId;
    if (user == null || seasonId == null) return;

    setState(() => _loading = true);
    final svc = context.read<AppState>().firestoreService;
    final results = await Future.wait([
      svc.getCropsBySeason(user.uid, seasonId),
      svc.getExpensesBySeason(user.uid, seasonId),
      svc.getHarvestsBySeason(user.uid, seasonId),
      svc.getSalesBySeason(user.uid, seasonId),
    ]);
    final crops = results[0] as List<CropCycle>;
    final expenses = results[1] as List<Expense>;
    final harvests = results[2] as List<Harvest>;
    final sales = results[3] as List<Sale>;

    final metrics = computeSeasonMetrics(
      crops: crops,
      allExpenses: expenses,
      allHarvests: harvests,
      allSales: sales,
    );

    if (!mounted) return;
    setState(() {
      _metrics = metrics;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final currentSeason = _seasons.where((s) => s.id == _selectedSeasonId).cast<Season?>().firstOrNull;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          if (_seasons.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedSeasonId,
                  onChanged: (v) async {
                    if (v == null) return;
                    setState(() => _selectedSeasonId = v);
                    await _loadMetrics();
                  },
                  items: _seasons
                      .map((s) => DropdownMenuItem(value: s.id, child: Text(s.name)))
                      .toList(),
                ),
              ),
            ),
        ],
      ),
      body: _loading
          ? const LoadingView(message: 'Loading dashboard…')
          : _seasons.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.bar_chart, size: 64, color: Colors.black38),
                        const SizedBox(height: 10),
                        const Text('Welcome to FarmTrack!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                        const SizedBox(height: 6),
                        const Text(
                          'Create your first season to start tracking crops, expenses, and profits.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.black54),
                        ),
                      ],
                    ),
                  ),
                )
              : _metrics == null
                  ? const Center(child: Text('No metrics yet.'))
                  : RefreshIndicator(
                      onRefresh: () async {
                        await _loadSeasons();
                      },
                      child: ListView(
                        padding: const EdgeInsets.all(12),
                        children: [
                          _ProfitCard(
                            currency: currentSeason?.currency ?? 'RWF',
                            profit: _metrics!.totalProfit,
                            expenses: _metrics!.totalExpenses,
                            revenue: _metrics!.totalRevenue,
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: _StatCard(
                                  label: 'Crops',
                                  value: _metrics!.cropCount.toString(),
                                  icon: Icons.spa,
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: _StatCard(
                                  label: 'Top Crop',
                                  value: _metrics!.topCrop ?? '—',
                                  icon: Icons.emoji_events,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          _StatCard(
                            label: 'Top Cost',
                            value: _metrics!.biggestCostCategory?.name ?? '—',
                            icon: Icons.receipt_long,
                          ),
                          const SizedBox(height: 14),
                          if (_metrics!.categoryBreakdown.isNotEmpty)
                            _BreakdownCard(
                              currency: currentSeason?.currency ?? 'RWF',
                              breakdown: _metrics!.categoryBreakdown,
                            ),
                        ],
                      ),
                    ),
    );
  }
}

class _ProfitCard extends StatelessWidget {
  const _ProfitCard({
    required this.currency,
    required this.profit,
    required this.expenses,
    required this.revenue,
  });

  final String currency;
  final double profit;
  final double expenses;
  final double revenue;

  @override
  Widget build(BuildContext context) {
    final isProfit = profit >= 0;
    final bg = isProfit ? const Color(0xFF16A34A) : const Color(0xFFDC2626);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(isProfit ? Icons.trending_up : Icons.trending_down, color: Colors.white.withValues(alpha: 0.85)),
              const SizedBox(width: 8),
              Text(
                isProfit ? 'Season Profit' : 'Season Loss',
                style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontWeight: FontWeight.w700),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            '${isProfit ? '+' : ''}${formatCurrency(profit, currency: currency)}',
            style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _Pill(label: 'Expenses', value: formatCurrency(expenses, currency: currency)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _Pill(label: 'Revenue', value: formatCurrency(revenue, currency: currency)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontWeight: FontWeight.w700, fontSize: 12)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.label, required this.value, required this.icon});
  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Icon(icon, color: Colors.black45),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(color: Colors.black54, fontWeight: FontWeight.w700, fontSize: 12)),
                  const SizedBox(height: 2),
                  Text(value, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w900)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BreakdownCard extends StatelessWidget {
  const _BreakdownCard({required this.currency, required this.breakdown});
  final String currency;
  final Map<String, double> breakdown;

  @override
  Widget build(BuildContext context) {
    final entries = breakdown.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
    final total = entries.fold<double>(0, (s, e) => s + e.value);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Expense Breakdown', style: TextStyle(fontWeight: FontWeight.w900)),
            const SizedBox(height: 10),
            for (final e in entries) ...[
              Row(
                children: [
                  Expanded(child: Text(e.key)),
                  Text(formatCurrency(e.value, currency: currency), style: const TextStyle(fontWeight: FontWeight.w800)),
                ],
              ),
              const SizedBox(height: 6),
              LinearProgressIndicator(
                value: total <= 0 ? 0 : (e.value / total).clamp(0, 1),
              ),
              const SizedBox(height: 10),
            ],
          ],
        ),
      ),
    );
  }
}

extension<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}

