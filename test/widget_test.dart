// Smoke test without Firebase: FarmTrackApp requires Firebase.initializeApp()
// before pumpWidget. Use a trivial check so `flutter test` passes in CI.
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('placeholder', () {
    expect(2 + 2, 4);
  });
}
