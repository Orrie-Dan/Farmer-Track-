import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../models.dart';
import '../../state/app_state.dart';
import '../../utils.dart';
import '../widgets/loading_view.dart';

class SeasonsScreen extends StatefulWidget {
  const SeasonsScreen({super.key});

  @override
  State<SeasonsScreen> createState() => _SeasonsScreenState();
}

class _SeasonsScreenState extends State<SeasonsScreen> {
  bool _loading = true;
  List<Season> _seasons = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final user = context.read<AppState>().user;
    if (user == null) return;
    setState(() => _loading = true);
    final seasons = await context.read<AppState>().firestoreService.getSeasons(user.uid);
    if (!mounted) return;
    setState(() {
      _seasons = seasons;
      _loading = false;
    });
  }

  Future<void> _createSeason() async {
    final created = await showDialog<_SeasonFormResult>(
      context: context,
      builder: (context) => const _CreateSeasonDialog(),
    );
    if (created == null) return;
    final user = context.read<AppState>().user;
    if (user == null) return;

    await context.read<AppState>().firestoreService.createSeason(
          userId: user.uid,
          name: created.name,
          startDate: created.startDate,
          endDate: created.endDate,
          currency: 'RWF',
        );
    await _load();
  }

  Future<void> _deleteSeason(Season season) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete season?'),
        content: const Text('Delete this season and all its data?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete')),
        ],
      ),
    );
    if (ok != true) return;
    final user = context.read<AppState>().user;
    if (user == null) return;
    await context.read<AppState>().firestoreService.deleteSeason(user.uid, season.id);
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Seasons'),
        actions: [
          IconButton(
            onPressed: _loading ? null : _createSeason,
            icon: const Icon(Icons.add),
            tooltip: 'New season',
          ),
        ],
      ),
      body: _loading
          ? const LoadingView(message: 'Loading seasons…')
          : _seasons.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.calendar_month, size: 56, color: Colors.black38),
                        const SizedBox(height: 10),
                        const Text('No seasons yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 6),
                        const Text('Create your first growing season to start tracking crops and profits.',
                            textAlign: TextAlign.center, style: TextStyle(color: Colors.black54)),
                        const SizedBox(height: 14),
                        FilledButton.icon(
                          onPressed: _createSeason,
                          icon: const Icon(Icons.add),
                          label: const Text('Create First Season'),
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(12),
                    itemCount: _seasons.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, i) {
                      final s = _seasons[i];
                      return Card(
                        child: ListTile(
                          leading: const Icon(Icons.eco, color: Colors.green),
                          title: Text(s.name, maxLines: 1, overflow: TextOverflow.ellipsis),
                          subtitle: Text('${formatDate(s.startDate)} — ${formatDate(s.endDate)}'),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete_outline),
                            onPressed: () => _deleteSeason(s),
                          ),
                          onTap: () => context.go('/seasons/${s.id}'),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}

class _SeasonFormResult {
  const _SeasonFormResult({required this.name, required this.startDate, required this.endDate});
  final String name;
  final String startDate;
  final String endDate;
}

class _CreateSeasonDialog extends StatefulWidget {
  const _CreateSeasonDialog();

  @override
  State<_CreateSeasonDialog> createState() => _CreateSeasonDialogState();
}

class _CreateSeasonDialogState extends State<_CreateSeasonDialog> {
  final _name = TextEditingController();
  String _start = todayIso();
  String _end = '';

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('New Season'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _name,
            decoration: const InputDecoration(labelText: 'Season name', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 10),
          _DateRow(
            label: 'Start date',
            value: _start,
            onChanged: (v) => setState(() => _start = v),
          ),
          const SizedBox(height: 10),
          _DateRow(
            label: 'End date',
            value: _end.isEmpty ? _start : _end,
            onChanged: (v) => setState(() => _end = v),
          ),
        ],
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        FilledButton(
          onPressed: () {
            final name = _name.text.trim();
            if (name.isEmpty) return;
            Navigator.pop(
              context,
              _SeasonFormResult(name: name, startDate: _start, endDate: _end.isEmpty ? _start : _end),
            );
          },
          child: const Text('Create'),
        ),
      ],
    );
  }
}

class _DateRow extends StatelessWidget {
  const _DateRow({required this.label, required this.value, required this.onChanged});
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
              final iso = '${picked.year.toString().padLeft(4, '0')}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
              onChanged(iso);
            },
          ),
        ),
      ],
    );
  }
}

