import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const ResQGridCitizenApp());
}

class ResQGridCitizenApp extends StatelessWidget {
  const ResQGridCitizenApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ResQGrid Citizen',
      theme: ThemeData(primarySwatch: Colors.red, useMaterial3: true),
      home: const LoginScreen(),
    );
  }
}