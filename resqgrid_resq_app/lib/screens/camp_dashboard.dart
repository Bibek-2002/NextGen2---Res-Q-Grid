import 'package:flutter/material.dart';

import '../services/api_service.dart';

class CampDashboard extends StatefulWidget {
  final String token;
  final String userName;

  const CampDashboard({
    super.key,
    required this.token,
    required this.userName,
  });

  @override
  State<CampDashboard> createState() => _CampDashboardState();
}

class _CampDashboardState extends State<CampDashboard> {
  final _quantityController = TextEditingController();
  String _selectedResource = 'Capacity';
  bool _loading = false;
  String? _message;

  static const resources = [
    'Capacity',
    'Food',
    'Water',
    'Blankets',
    'Medicine',
  ];

  Future<void> _update() async {
    final quantity = int.tryParse(_quantityController.text.trim());
    if (quantity == null) {
      setState(() => _message = 'Enter a valid number');
      return;
    }

    setState(() {
      _loading = true;
      _message = null;
    });
    try {
      final result = await ApiService.campStatusUpdate(
        widget.token,
        _selectedResource,
        quantity,
        '',
      );
      if (mounted) setState(() => _message = result['message'] ?? 'Updated');
    } catch (error) {
      if (mounted) setState(() => _message = 'Error: $error');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _quantityController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Camp - ${widget.userName}')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            DropdownButtonFormField<String>(
              initialValue: _selectedResource,
              items: resources
                  .map((resource) => DropdownMenuItem(
                        value: resource,
                        child: Text(resource),
                      ))
                  .toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() => _selectedResource = value);
                }
              },
              decoration:
                  const InputDecoration(labelText: 'Resource / Status Type'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _quantityController,
              decoration: const InputDecoration(labelText: 'Quantity'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 24),
            if (_message != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Text(_message!),
              ),
            _loading
                ? const CircularProgressIndicator()
                : ElevatedButton(
                    onPressed: _update,
                    child: const Text('Update'),
                  ),
          ],
        ),
      ),
    );
  }
}
