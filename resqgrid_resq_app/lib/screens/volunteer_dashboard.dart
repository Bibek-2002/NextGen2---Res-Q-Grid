import 'package:flutter/material.dart';

import '../services/api_service.dart';

class VolunteerDashboard extends StatefulWidget {
  final String token;
  final String userName;

  const VolunteerDashboard({
    super.key,
    required this.token,
    required this.userName,
  });

  @override
  State<VolunteerDashboard> createState() => _VolunteerDashboardState();
}

class _VolunteerDashboardState extends State<VolunteerDashboard> {
  final _descController = TextEditingController();
  final _villageController = TextEditingController();
  String _selectedCategory = 'Road';
  bool _loading = false;
  String? _message;

  static const categories = [
    'Road',
    'Bridge',
    'Shelter',
    'BoatLaunchPoint',
    'WaterDepth',
    'VillageContact',
    'LocalLanguage',
    'MedicalResource',
    'LivestockArea',
    'DangerZone',
  ];

  Future<void> _submit() async {
    if (_descController.text.trim().isEmpty) {
      setState(() => _message = 'Description is required');
      return;
    }

    setState(() {
      _loading = true;
      _message = null;
    });
    try {
      final village = _villageController.text.trim();
      final result = await ApiService.addKnowledge(
        widget.token,
        _selectedCategory,
        _descController.text.trim(),
        village.isEmpty ? null : village,
      );
      if (mounted) {
        setState(() => _message = result['message'] ?? 'Submitted');
        _descController.clear();
      }
    } catch (error) {
      if (mounted) setState(() => _message = 'Error: $error');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _descController.dispose();
    _villageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Volunteer - ${widget.userName}')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const Text(
              'Submit Local Knowledge',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: _selectedCategory,
              items: categories
                  .map((category) => DropdownMenuItem(
                        value: category,
                        child: Text(category),
                      ))
                  .toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() => _selectedCategory = value);
                }
              },
              decoration: const InputDecoration(labelText: 'Category'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _villageController,
              decoration: const InputDecoration(labelText: 'Village (optional)'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _descController,
              decoration: const InputDecoration(labelText: 'Description'),
              maxLines: 3,
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
                    onPressed: _submit,
                    child: const Text('Submit'),
                  ),
          ],
        ),
      ),
    );
  }
}
