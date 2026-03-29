import type {
  CropCycle,
  Expense,
  Harvest,
  Sale,
  CropMetrics,
  SeasonMetrics,
  ExpenseCategory,
} from "@/types";

export function computeCropMetrics(
  expenses: Expense[],
  harvests: Harvest[],
  sales: Sale[]
): CropMetrics {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalPrice, 0);
  const harvestedQty = harvests.reduce((sum, h) => sum + h.quantity, 0);
  const soldQty = sales.reduce((sum, s) => sum + s.quantitySold, 0);

  return {
    totalExpenses,
    totalRevenue,
    profit: totalRevenue - totalExpenses,
    harvestedQty,
    soldQty,
    remainingQty: Math.max(0, harvestedQty - soldQty),
  };
}

export function computeSeasonMetrics(
  crops: CropCycle[],
  allExpenses: Expense[],
  allHarvests: Harvest[],
  allSales: Sale[]
): SeasonMetrics {
  const cropMetrics: Record<string, CropMetrics & { cropName: string }> = {};
  const categoryBreakdown: Record<string, number> = {};

  let totalExpenses = 0;
  let totalRevenue = 0;
  let topCropProfit = -Infinity;
  let topCrop: string | null = null;
  let biggestCostAmount = 0;
  let biggestCostCategory: ExpenseCategory | null = null;

  for (const crop of crops) {
    const cropExpenses = allExpenses.filter((e) => e.cropCycleId === crop.id);
    const cropHarvests = allHarvests.filter((h) => h.cropCycleId === crop.id);
    const cropSales = allSales.filter((s) => s.cropCycleId === crop.id);
    const metrics = computeCropMetrics(cropExpenses, cropHarvests, cropSales);

    cropMetrics[crop.id] = { ...metrics, cropName: crop.cropName };
    totalExpenses += metrics.totalExpenses;
    totalRevenue += metrics.totalRevenue;

    if (metrics.profit > topCropProfit) {
      topCropProfit = metrics.profit;
      topCrop = crop.cropName;
    }

    for (const expense of cropExpenses) {
      categoryBreakdown[expense.category] =
        (categoryBreakdown[expense.category] || 0) + expense.amount;
    }
  }

  for (const [cat, amount] of Object.entries(categoryBreakdown)) {
    if (amount > biggestCostAmount) {
      biggestCostAmount = amount;
      biggestCostCategory = cat as ExpenseCategory;
    }
  }

  return {
    totalExpenses,
    totalRevenue,
    totalProfit: totalRevenue - totalExpenses,
    cropCount: crops.length,
    topCrop,
    biggestCostCategory,
    cropMetrics,
    categoryBreakdown,
  };
}
