enum CropStatus { planted, harvested, closed }

enum ExpenseCategory {
  seed,
  fertilizer,
  pesticide,
  labor,
  transport,
  equipment,
  irrigation,
  other,
}

enum BuyerType { market, cooperative, individual, other }

enum PaymentStatus { paid, unpaid, partial }

class Season {
  const Season({
    required this.id,
    required this.userId,
    required this.name,
    required this.startDate,
    required this.endDate,
    required this.currency,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String userId;
  final String name;
  final String startDate;
  final String endDate;
  final String currency;
  final String createdAt;
  final String updatedAt;

  factory Season.fromMap(Map<String, dynamic> map) {
    return Season(
      id: map['id'] as String,
      userId: map['userId'] as String,
      name: map['name'] as String,
      startDate: map['startDate'] as String,
      endDate: map['endDate'] as String,
      currency: map['currency'] as String,
      createdAt: map['createdAt'] as String,
      updatedAt: map['updatedAt'] as String,
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'userId': userId,
        'name': name,
        'startDate': startDate,
        'endDate': endDate,
        'currency': currency,
        'createdAt': createdAt,
        'updatedAt': updatedAt,
      };
}

class CropCycle {
  const CropCycle({
    required this.id,
    required this.seasonId,
    required this.userId,
    required this.cropName,
    required this.fieldName,
    required this.plantingDate,
    required this.expectedHarvestDate,
    required this.unit,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.expectedYieldQty,
  });

  final String id;
  final String seasonId;
  final String userId;
  final String cropName;
  final String fieldName;
  final String plantingDate;
  final String expectedHarvestDate;
  final double? expectedYieldQty;
  final String unit;
  final CropStatus status;
  final String createdAt;
  final String updatedAt;

  factory CropCycle.fromMap(Map<String, dynamic> map) {
    return CropCycle(
      id: map['id'] as String,
      seasonId: map['seasonId'] as String,
      userId: map['userId'] as String,
      cropName: map['cropName'] as String,
      fieldName: (map['fieldName'] as String?) ?? 'Main Field',
      plantingDate: map['plantingDate'] as String,
      expectedHarvestDate: map['expectedHarvestDate'] as String,
      expectedYieldQty: (map['expectedYieldQty'] as num?)?.toDouble(),
      unit: map['unit'] as String,
      status: _cropStatusFromString(map['status'] as String),
      createdAt: map['createdAt'] as String,
      updatedAt: map['updatedAt'] as String,
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'seasonId': seasonId,
        'userId': userId,
        'cropName': cropName,
        'fieldName': fieldName,
        'plantingDate': plantingDate,
        'expectedHarvestDate': expectedHarvestDate,
        'expectedYieldQty': expectedYieldQty,
        'unit': unit,
        'status': status.name,
        'createdAt': createdAt,
        'updatedAt': updatedAt,
      };
}

class Expense {
  const Expense({
    required this.id,
    required this.cropCycleId,
    required this.seasonId,
    required this.userId,
    required this.category,
    required this.amount,
    required this.date,
    required this.note,
    required this.createdAt,
  });

  final String id;
  final String cropCycleId;
  final String seasonId;
  final String userId;
  final ExpenseCategory category;
  final double amount;
  final String date;
  final String note;
  final String createdAt;

  factory Expense.fromMap(Map<String, dynamic> map) {
    return Expense(
      id: map['id'] as String,
      cropCycleId: map['cropCycleId'] as String,
      seasonId: map['seasonId'] as String,
      userId: map['userId'] as String,
      category: _expenseCategoryFromString(map['category'] as String),
      amount: (map['amount'] as num).toDouble(),
      date: map['date'] as String,
      note: (map['note'] as String?) ?? '',
      createdAt: map['createdAt'] as String,
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'cropCycleId': cropCycleId,
        'seasonId': seasonId,
        'userId': userId,
        'category': category.name,
        'amount': amount,
        'date': date,
        'note': note,
        'createdAt': createdAt,
      };
}

class Harvest {
  const Harvest({
    required this.id,
    required this.cropCycleId,
    required this.seasonId,
    required this.userId,
    required this.harvestDate,
    required this.quantity,
    required this.unit,
    required this.note,
    required this.createdAt,
  });

  final String id;
  final String cropCycleId;
  final String seasonId;
  final String userId;
  final String harvestDate;
  final double quantity;
  final String unit;
  final String note;
  final String createdAt;

  factory Harvest.fromMap(Map<String, dynamic> map) {
    return Harvest(
      id: map['id'] as String,
      cropCycleId: map['cropCycleId'] as String,
      seasonId: map['seasonId'] as String,
      userId: map['userId'] as String,
      harvestDate: map['harvestDate'] as String,
      quantity: (map['quantity'] as num).toDouble(),
      unit: map['unit'] as String,
      note: (map['note'] as String?) ?? '',
      createdAt: map['createdAt'] as String,
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'cropCycleId': cropCycleId,
        'seasonId': seasonId,
        'userId': userId,
        'harvestDate': harvestDate,
        'quantity': quantity,
        'unit': unit,
        'note': note,
        'createdAt': createdAt,
      };
}

class Sale {
  const Sale({
    required this.id,
    required this.cropCycleId,
    required this.seasonId,
    required this.userId,
    required this.date,
    required this.quantitySold,
    required this.unit,
    required this.pricePerUnit,
    required this.totalPrice,
    required this.buyerType,
    required this.paymentStatus,
    required this.createdAt,
    this.buyerName,
    this.note,
  });

  final String id;
  final String cropCycleId;
  final String seasonId;
  final String userId;
  final String date;
  final double quantitySold;
  final String unit;
  final double pricePerUnit;
  final double totalPrice;
  final BuyerType buyerType;
  final PaymentStatus paymentStatus;
  final String? buyerName;
  final String? note;
  final String createdAt;

  factory Sale.fromMap(Map<String, dynamic> map) {
    return Sale(
      id: map['id'] as String,
      cropCycleId: map['cropCycleId'] as String,
      seasonId: map['seasonId'] as String,
      userId: map['userId'] as String,
      date: map['date'] as String,
      quantitySold: (map['quantitySold'] as num).toDouble(),
      unit: map['unit'] as String,
      pricePerUnit: (map['pricePerUnit'] as num).toDouble(),
      totalPrice: (map['totalPrice'] as num).toDouble(),
      buyerType: _buyerTypeFromString(map['buyerType'] as String),
      paymentStatus: _paymentStatusFromString(map['paymentStatus'] as String),
      buyerName: map['buyerName'] as String?,
      note: map['note'] as String?,
      createdAt: map['createdAt'] as String,
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'cropCycleId': cropCycleId,
        'seasonId': seasonId,
        'userId': userId,
        'date': date,
        'quantitySold': quantitySold,
        'unit': unit,
        'pricePerUnit': pricePerUnit,
        'totalPrice': totalPrice,
        'buyerType': buyerType.name,
        'paymentStatus': paymentStatus.name,
        'buyerName': buyerName,
        'note': note,
        'createdAt': createdAt,
      };
}

CropStatus _cropStatusFromString(String value) =>
    CropStatus.values.firstWhere((e) => e.name == value);

ExpenseCategory _expenseCategoryFromString(String value) =>
    ExpenseCategory.values.firstWhere((e) => e.name == value);

BuyerType _buyerTypeFromString(String value) =>
    BuyerType.values.firstWhere((e) => e.name == value);

PaymentStatus _paymentStatusFromString(String value) =>
    PaymentStatus.values.firstWhere((e) => e.name == value);

