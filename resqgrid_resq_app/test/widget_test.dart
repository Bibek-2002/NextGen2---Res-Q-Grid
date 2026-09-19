import 'package:flutter_test/flutter_test.dart';

import 'package:resqgrid_resq_app/main.dart';

void main() {
  testWidgets('shows the team login screen', (WidgetTester tester) async {
    await tester.pumpWidget(const ResQApp());

    expect(find.text('ResQGrid - Team Login'), findsOneWidget);
    expect(find.text('Phone'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
    expect(find.text('Login'), findsOneWidget);
  });
}