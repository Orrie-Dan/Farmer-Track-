import 'models.dart';

class CropMetrics {
  const CropMetrics({
    required this.totalExpenses,
    required this.totalRevenue,
    required this.profit,
    required this.harvestedQty,
    required this.soldQty,
    required this.remainingQty,
  });

  final double totalExpenses;
  final double totalRevenue;
  final double profit;
  final double harvestedQty;
  final double soldQty;
  final double remainingQty;
}

class SeasonMetrics {
  const SeasonMetrics({
    required this.totalExpenses,
    required this.totalRevenue,
    required this.totalProfit,
    required this.cropCount,
    required this.topCrop,
    required this.biggestCostCategory,
    required this.cropMetrics,
    required this.categoryBreakdown,
  });

  final double totalExpenses;
  final double totalRevenue;
  final double totalProfit;
  final int cropCount;
  final String? topCrop;
  final ExpenseCategory? biggestCostCategory;
  final Map<String, CropMetricsWithName> cropMetrics;
  final Map<String, double> categoryBreakdown;
}

class CropMetricsWithName extends CropMetrics {
  const CropMetricsWithName({
    required super.totalExpenses,
    required super.totalRevenue,
    required super.profit,
    required super.harvestedQty,
    required super.soldQty,
    required super.remainingQty,
    required this.cropName,
  });

  final String cropName;
}

CropMetrics computeCropMetrics({
  required List<Expense> expenses,
  required List<Harvest> harvests,
  required List<Sale> sales,
}) {
  final totalExpenses = expenses.fold<double>(0, (s, e) => s + e.amount);
  final totalRevenue = sales.fold<double>(0, (s, e) => s + e.totalPrice);
  final harvestedQty = harvests.fold<double>(0, (s, e) => s + e.quantity);
  final soldQty = sales.fold<double>(0, (s, e) => s + e.quantitySold);

  return CropMetrics(
    totalExpenses: totalExpenses,
    totalRevenue: totalRevenue,
    profit: totalRevenue - totalExpenses,
    harvestedQty: harvestedQty,
    soldQty: soldQty,
    remainingQty: (harvestedQty - soldQty).clamp(0, double.infinity),
  );
}

SeasonMetrics computeSeasonMetrics({
  required List<CropCycle> crops,
  required List<Expense> allExpenses,
  required List<Harvest> allHarvests,
  required List<Sale> allSales,
}) {
  final cropMetrics = <String, CropMetricsWithName>{};
  final categoryBreakdown = <String, double>{};

  var totalExpenses = 0.0;
  var totalRevenue = 0.0;
  var topCropProfit = double.negativeInfinity;
  String? topCrop;
  var biggestCostAmount = 0.0;
  ExpenseCategory? biggestCostCategory;

  for (final crop in crops) {
    final cropExpenses = allExpenses.where((e) => e.cropCycleId == crop.id).toList();
    final cropHarvests = allHarvests.where((h) => h.cropCycleId == crop.id).toList();
    final cropSales = allSales.where((s) => s.cropCycleId == crop.id).toList();
    final metrics = computeCropMetrics(
      expenses: cropExpenses,
      harvests: cropHarvests,
      sales: cropSales,
    );

    cropMetrics[crop.id] = CropMetricsWithName(
      totalExpenses: metrics.totalExpenses,
      totalRevenue: metrics.totalRevenue,
      profit: metrics.profit,
      harvestedQty: metrics.harvestedQty,
      soldQty: metrics.soldQty,
      remainingQty: metrics.remainingQty,
      cropName: crop.cropName,
    );

    totalExpenses += metrics.totalExpenses;
    totalRevenue += metrics.totalRevenue;

    if (metrics.profit > topCropProfit) {
      topCropProfit = metrics.profit;
      topCrop = crop.cropName;
    }

    for (final exp in cropExpenses) {
      categoryBreakdown[exp.category.name] =
          (categoryBreakdown[exp.category.name] ?? 0) + exp.amount;
    }
  }

  for (final entry in categoryBreakdown.entries) {
    if (entry.value > biggestCostAmount) {
      biggestCostAmount = entry.value;
      biggestCostCategory =
          ExpenseCategory.values.firstWhere((e) => e.name == entry.key);
    }
  }

  return SeasonMetrics(
    totalExpenses: totalExpenses,
    totalRevenue: totalRevenue,
    totalProfit: totalRevenue - totalExpenses,
    cropCount: crops.length,
    topCrop: topCrop,
    biggestCostCategory: biggestCostCategory,
    cropMetrics: cropMetrics,
    categoryBreakdown: categoryBreakdown,
  );
}

