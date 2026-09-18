import 'package:flutter/material.dart';
import 'knowledge_screen.dart';
import 'sos_form_screen.dart';
import 'status_screen.dart';

class HomeScreen extends StatelessWidget {
  final String token;
  final String userName;

  const HomeScreen({super.key, required this.token, required this.userName});

  static const needs = [
    {'label': 'Rescue', 'icon': Icons.directions_boat},
    {'label': 'Food', 'icon': Icons.restaurant},
    {'label': 'Water', 'icon': Icons.water_drop},
    {'label': 'Medicine', 'icon': Icons.medication},
    {'label': 'Medical', 'icon': Icons.local_hospital},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Hi, $userName'),
        actions: [
          IconButton(
            icon: const Icon(Icons.list_alt),
            tooltip: 'My Reports',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => StatusScreen(token: token),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.menu_book),
            tooltip: 'Local Knowledge',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => KnowledgeScreen(token: token),
              ),
            ),
          ),
        ],
      ),
      body: GridView.count(
        padding: const EdgeInsets.all(16),
        crossAxisCount: 2,
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        children: needs.map((need) {
          return Card(
            child: InkWell(
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => SosFormScreen(
                    token: token,
                    evidenceType: need['label'] as String,
                  ),
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(need['icon'] as IconData, size: 48),
                  const SizedBox(height: 8),
                  Text(need['label'] as String, style: const TextStyle(fontSize: 18)),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
