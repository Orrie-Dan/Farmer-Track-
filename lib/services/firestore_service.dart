import 'package:cloud_firestore/cloud_firestore.dart';

import '../models.dart';
import '../utils.dart';

class FirestoreService {
  FirestoreService(FirebaseFirestore firestore) : _db = firestore;

  final FirebaseFirestore _db;

  CollectionReference<Map<String, dynamic>> _userCol(String userId, String colName) {
    return _db.collection('users').doc(userId).collection(colName);
  }

  DocumentReference<Map<String, dynamic>> _userDoc(String userId, String colName, String docId) {
    return _db.collection('users').doc(userId).collection(colName).doc(docId);
  }

  // ── Seasons ──

  Future<Season> createSeason({
    required String userId,
    required String name,
    required String startDate,
    required String endDate,
    required String currency,
  }) async {
    final id = generateId();
    final season = Season(
      id: id,
      userId: userId,
      name: name,
      startDate: startDate,
      endDate: endDate,
      currency: currency,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    );
    await _userDoc(userId, 'seasons', id).set(season.toMap());
    return season;
  }

  Future<List<Season>> getSeasons(String userId) async {
    final snap = await _userCol(userId, 'seasons').get();
    final seasons = snap.docs.map((d) => Season.fromMap(d.data())).toList();
    seasons.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return seasons;
  }

  Future<Season?> getSeason(String userId, String seasonId) async {
    final snap = await _userDoc(userId, 'seasons', seasonId).get();
    return snap.exists ? Season.fromMap(snap.data()!) : null;
  }

  Future<void> deleteSeason(String userId, String seasonId) {
    return _userDoc(userId, 'seasons', seasonId).delete();
  }

  // ── Crop Cycles ──

  Future<CropCycle> createCropCycle({
    required String userId,
    required String seasonId,
    required String cropName,
    required String fieldName,
    required String plantingDate,
    required String expectedHarvestDate,
    required String unit,
    required CropStatus status,
    double? expectedYieldQty,
  }) async {
    final id = generateId();
    final crop = CropCycle(
      id: id,
      seasonId: seasonId,
      userId: userId,
      cropName: cropName,
      fieldName: fieldName,
      plantingDate: plantingDate,
      expectedHarvestDate: expectedHarvestDate,
      expectedYieldQty: expectedYieldQty,
      unit: unit,
      status: status,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    );
    await _userDoc(userId, 'crops', id).set(crop.toMap());
    return crop;
  }

  Future<List<CropCycle>> getCropsBySeason(String userId, String seasonId) async {
    final snap = await _userCol(userId, 'crops').where('seasonId', isEqualTo: seasonId).get();
    final crops = snap.docs.map((d) => CropCycle.fromMap(d.data())).toList();
    crops.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return crops;
  }

  Future<CropCycle?> getCrop(String userId, String cropId) async {
    final snap = await _userDoc(userId, 'crops', cropId).get();
    return snap.exists ? CropCycle.fromMap(snap.data()!) : null;
  }

  Future<void> updateCropStatus({
    required String userId,
    required String cropId,
    required CropStatus status,
  }) {
    return _userDoc(userId, 'crops', cropId).set(
      {'status': status.name, 'updatedAt': nowIso()},
      SetOptions(merge: true),
    );
  }

  Future<void> deleteCrop(String userId, String cropId) {
    return _userDoc(userId, 'crops', cropId).delete();
  }

  // ── Expenses ──

  Future<Expense> createExpense({
    required String userId,
    required String cropCycleId,
    required String seasonId,
    required ExpenseCategory category,
    required double amount,
    required String date,
    required String note,
  }) async {
    final id = generateId();
    final expense = Expense(
      id: id,
      cropCycleId: cropCycleId,
      seasonId: seasonId,
      userId: userId,
      category: category,
      amount: amount,
      date: date,
      note: note,
      createdAt: nowIso(),
    );
    await _userDoc(userId, 'expenses', id).set(expense.toMap());
    return expense;
  }

  Future<List<Expense>> getExpensesByCrop(String userId, String cropCycleId) async {
    final snap = await _userCol(userId, 'expenses')
        .where('cropCycleId', isEqualTo: cropCycleId)
        .get();
    final expenses = snap.docs.map((d) => Expense.fromMap(d.data())).toList();
    expenses.sort((a, b) => b.date.compareTo(a.date));
    return expenses;
  }

  Future<List<Expense>> getExpensesBySeason(String userId, String seasonId) async {
    final snap = await _userCol(userId, 'expenses').where('seasonId', isEqualTo: seasonId).get();
    return snap.docs.map((d) => Expense.fromMap(d.data())).toList();
  }

  Future<void> deleteExpense(String userId, String expenseId) {
    return _userDoc(userId, 'expenses', expenseId).delete();
  }

  // ── Harvests ──

  Future<Harvest> createHarvest({
    required String userId,
    required String cropCycleId,
    required String seasonId,
    required String harvestDate,
    required double quantity,
    required String unit,
    required String note,
  }) async {
    final id = generateId();
    final harvest = Harvest(
      id: id,
      cropCycleId: cropCycleId,
      seasonId: seasonId,
      userId: userId,
      harvestDate: harvestDate,
      quantity: quantity,
      unit: unit,
      note: note,
      createdAt: nowIso(),
    );
    await _userDoc(userId, 'harvests', id).set(harvest.toMap());
    return harvest;
  }

  Future<List<Harvest>> getHarvestsByCrop(String userId, String cropCycleId) async {
    final snap = await _userCol(userId, 'harvests')
        .where('cropCycleId', isEqualTo: cropCycleId)
        .get();
    final harvests = snap.docs.map((d) => Harvest.fromMap(d.data())).toList();
    harvests.sort((a, b) => b.harvestDate.compareTo(a.harvestDate));
    return harvests;
  }

  Future<List<Harvest>> getHarvestsBySeason(String userId, String seasonId) async {
    final snap = await _userCol(userId, 'harvests').where('seasonId', isEqualTo: seasonId).get();
    return snap.docs.map((d) => Harvest.fromMap(d.data())).toList();
  }

  Future<void> deleteHarvest(String userId, String harvestId) {
    return _userDoc(userId, 'harvests', harvestId).delete();
  }

  // ── Sales ──

  Future<Sale> createSale({
    required String userId,
    required String cropCycleId,
    required String seasonId,
    required String date,
    required double quantitySold,
    required String unit,
    required double pricePerUnit,
    required BuyerType buyerType,
    required PaymentStatus paymentStatus,
    String? buyerName,
    String? note,
  }) async {
    final id = generateId();
    final totalPrice = quantitySold * pricePerUnit;
    final sale = Sale(
      id: id,
      cropCycleId: cropCycleId,
      seasonId: seasonId,
      userId: userId,
      date: date,
      quantitySold: quantitySold,
      unit: unit,
      pricePerUnit: pricePerUnit,
      totalPrice: totalPrice,
      buyerType: buyerType,
      paymentStatus: paymentStatus,
      buyerName: buyerName,
      note: note,
      createdAt: nowIso(),
    );
    await _userDoc(userId, 'sales', id).set(sale.toMap());
    return sale;
  }

  Future<List<Sale>> getSalesByCrop(String userId, String cropCycleId) async {
    final snap = await _userCol(userId, 'sales').where('cropCycleId', isEqualTo: cropCycleId).get();
    final sales = snap.docs.map((d) => Sale.fromMap(d.data())).toList();
    sales.sort((a, b) => b.date.compareTo(a.date));
    return sales;
  }

  Future<List<Sale>> getSalesBySeason(String userId, String seasonId) async {
    final snap = await _userCol(userId, 'sales').where('seasonId', isEqualTo: seasonId).get();
    return snap.docs.map((d) => Sale.fromMap(d.data())).toList();
  }

  Future<void> deleteSale(String userId, String saleId) {
    return _userDoc(userId, 'sales', saleId).delete();
  }
}

