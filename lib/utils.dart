import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';

final _uuid = Uuid();

String generateId() => _uuid.v4();

String nowIso() => DateTime.now().toUtc().toIso8601String();

String todayIso() {
  final d = DateTime.now();
  final local = DateTime(d.year, d.month, d.day);
  return DateFormat('yyyy-MM-dd').format(local);
}

String formatDate(String isoDate) {
  try {
    final dt = DateTime.parse(isoDate);
    return DateFormat.yMMMd().format(dt);
  } catch (_) {
    return isoDate;
  }
}

String formatCurrency(num value, {String currency = 'RWF'}) {
  final fmt = NumberFormat.currency(name: currency, symbol: '');
  return '${fmt.format(value).trim()} $currency';
}

