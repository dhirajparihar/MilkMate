import 'package:flutter_test/flutter_test.dart';
import 'package:doodh_dost/main.dart';

void main() {
  testWidgets('DoodhDostApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const DoodhDostApp());
    expect(find.text('Doodh Dost'), findsWidgets);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Orders'), findsOneWidget);
    expect(find.text('Shops'), findsOneWidget);
  });
}
