"use client";

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { Season, CropCycle, Expense, Harvest, Sale } from "@/types";
import { generateId, nowISO } from "./utils";

function userCol(userId: string, colName: string) {
  return collection(getFirebaseDb(), "users", userId, colName);
}

function userDoc(userId: string, colName: string, docId: string) {
  return doc(getFirebaseDb(), "users", userId, colName, docId);
}

function sortDesc<T>(arr: T[], key: keyof T): T[] {
  return [...arr].sort((a, b) => {
    const va = String(a[key]);
    const vb = String(b[key]);
    return vb.localeCompare(va);
  });
}

// ── Seasons ──

export async function createSeason(
  userId: string,
  data: Omit<Season, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<Season> {
  const id = generateId();
  const season: Season = {
    id,
    userId,
    ...data,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  await setDoc(userDoc(userId, "seasons", id), season);
  return season;
}

export async function getSeasons(userId: string): Promise<Season[]> {
  const snap = await getDocs(userCol(userId, "seasons"));
  const seasons = snap.docs.map((d) => d.data() as Season);
  return sortDesc(seasons, "createdAt");
}

export async function getSeason(
  userId: string,
  seasonId: string
): Promise<Season | null> {
  const snap = await getDoc(userDoc(userId, "seasons", seasonId));
  return snap.exists() ? (snap.data() as Season) : null;
}

export async function deleteSeason(
  userId: string,
  seasonId: string
): Promise<void> {
  await deleteDoc(userDoc(userId, "seasons", seasonId));
}

// ── Crop Cycles ──

export async function createCropCycle(
  userId: string,
  data: Omit<CropCycle, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<CropCycle> {
  const id = generateId();
  const crop: CropCycle = {
    id,
    userId,
    ...data,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  await setDoc(userDoc(userId, "crops", id), crop);
  return crop;
}

export async function getCropsBySeason(
  userId: string,
  seasonId: string
): Promise<CropCycle[]> {
  const snap = await getDocs(
    query(userCol(userId, "crops"), where("seasonId", "==", seasonId))
  );
  const crops = snap.docs.map((d) => d.data() as CropCycle);
  return sortDesc(crops, "createdAt");
}

export async function getCrop(
  userId: string,
  cropId: string
): Promise<CropCycle | null> {
  const snap = await getDoc(userDoc(userId, "crops", cropId));
  return snap.exists() ? (snap.data() as CropCycle) : null;
}

export async function updateCropStatus(
  userId: string,
  cropId: string,
  status: CropCycle["status"]
): Promise<void> {
  await setDoc(
    userDoc(userId, "crops", cropId),
    { status, updatedAt: nowISO() },
    { merge: true }
  );
}

export async function deleteCrop(
  userId: string,
  cropId: string
): Promise<void> {
  await deleteDoc(userDoc(userId, "crops", cropId));
}

// ── Expenses ──

export async function createExpense(
  userId: string,
  data: Omit<Expense, "id" | "userId" | "createdAt">
): Promise<Expense> {
  const id = generateId();
  const expense: Expense = {
    id,
    userId,
    ...data,
    createdAt: nowISO(),
  };
  await setDoc(userDoc(userId, "expenses", id), expense);
  return expense;
}

export async function getExpensesByCrop(
  userId: string,
  cropCycleId: string
): Promise<Expense[]> {
  const snap = await getDocs(
    query(userCol(userId, "expenses"), where("cropCycleId", "==", cropCycleId))
  );
  const expenses = snap.docs.map((d) => d.data() as Expense);
  return sortDesc(expenses, "date");
}

export async function getExpensesBySeason(
  userId: string,
  seasonId: string
): Promise<Expense[]> {
  const snap = await getDocs(
    query(userCol(userId, "expenses"), where("seasonId", "==", seasonId))
  );
  return snap.docs.map((d) => d.data() as Expense);
}

export async function deleteExpense(
  userId: string,
  expenseId: string
): Promise<void> {
  await deleteDoc(userDoc(userId, "expenses", expenseId));
}

// ── Harvests ──

export async function createHarvest(
  userId: string,
  data: Omit<Harvest, "id" | "userId" | "createdAt">
): Promise<Harvest> {
  const id = generateId();
  const harvest: Harvest = {
    id,
    userId,
    ...data,
    createdAt: nowISO(),
  };
  await setDoc(userDoc(userId, "harvests", id), harvest);
  return harvest;
}

export async function getHarvestsByCrop(
  userId: string,
  cropCycleId: string
): Promise<Harvest[]> {
  const snap = await getDocs(
    query(userCol(userId, "harvests"), where("cropCycleId", "==", cropCycleId))
  );
  const harvests = snap.docs.map((d) => d.data() as Harvest);
  return sortDesc(harvests, "harvestDate");
}

export async function getHarvestsBySeason(
  userId: string,
  seasonId: string
): Promise<Harvest[]> {
  const snap = await getDocs(
    query(userCol(userId, "harvests"), where("seasonId", "==", seasonId))
  );
  return snap.docs.map((d) => d.data() as Harvest);
}

export async function deleteHarvest(
  userId: string,
  harvestId: string
): Promise<void> {
  await deleteDoc(userDoc(userId, "harvests", harvestId));
}

// ── Sales ──

export async function createSale(
  userId: string,
  data: Omit<Sale, "id" | "userId" | "createdAt">
): Promise<Sale> {
  const id = generateId();
  const sale: Sale = {
    id,
    userId,
    ...data,
    createdAt: nowISO(),
  };
  await setDoc(userDoc(userId, "sales", id), sale);
  return sale;
}

export async function getSalesByCrop(
  userId: string,
  cropCycleId: string
): Promise<Sale[]> {
  const snap = await getDocs(
    query(userCol(userId, "sales"), where("cropCycleId", "==", cropCycleId))
  );
  const sales = snap.docs.map((d) => d.data() as Sale);
  return sortDesc(sales, "date");
}

export async function getSalesBySeason(
  userId: string,
  seasonId: string
): Promise<Sale[]> {
  const snap = await getDocs(
    query(userCol(userId, "sales"), where("seasonId", "==", seasonId))
  );
  return snap.docs.map((d) => d.data() as Sale);
}

export async function deleteSale(
  userId: string,
  saleId: string
): Promise<void> {
  await deleteDoc(userDoc(userId, "sales", saleId));
}
