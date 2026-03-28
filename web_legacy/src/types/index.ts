export interface Season {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export type CropStatus = "planted" | "harvested" | "closed";

export interface CropCycle {
  id: string;
  seasonId: string;
  userId: string;
  cropName: string;
  fieldName: string;
  plantingDate: string;
  expectedHarvestDate: string;
  expectedYieldQty?: number;
  unit: string;
  status: CropStatus;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | "seed"
  | "fertilizer"
  | "pesticide"
  | "labor"
  | "transport"
  | "equipment"
  | "irrigation"
  | "other";

export interface Expense {
  id: string;
  cropCycleId: string;
  seasonId: string;
  userId: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  note: string;
  createdAt: string;
}

export interface Harvest {
  id: string;
  cropCycleId: string;
  seasonId: string;
  userId: string;
  harvestDate: string;
  quantity: number;
  unit: string;
  note: string;
  createdAt: string;
}

export type BuyerType = "market" | "cooperative" | "individual" | "other";
export type PaymentStatus = "paid" | "unpaid" | "partial";

export interface Sale {
  id: string;
  cropCycleId: string;
  seasonId: string;
  userId: string;
  date: string;
  quantitySold: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  buyerType: BuyerType;
  paymentStatus: PaymentStatus;
  buyerName?: string;
  note?: string;
  createdAt: string;
}

export interface CropMetrics {
  totalExpenses: number;
  totalRevenue: number;
  profit: number;
  harvestedQty: number;
  soldQty: number;
  remainingQty: number;
}

export interface SeasonMetrics {
  totalExpenses: number;
  totalRevenue: number;
  totalProfit: number;
  cropCount: number;
  topCrop: string | null;
  biggestCostCategory: ExpenseCategory | null;
  cropMetrics: Record<string, CropMetrics & { cropName: string }>;
  categoryBreakdown: Record<string, number>;
}
