import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../services/api_service.dart';

class SosFormScreen extends StatefulWidget {
  final String token;
  final String evidenceType;

  const SosFormScreen({super.key, required this.token, required this.evidenceType});

  @override
  State<SosFormScreen> createState() => _SosFormScreenState();
}

class _SosFormScreenState extends State<SosFormScreen> {
  final _descController = TextEditingController();
  bool _loading = false;
  String? _resultMessage;

  Future<Position> _getLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) throw Exception('Location services are disabled.');

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Location permission denied.');
      }
    }

    return await Geolocator.getCurrentPosition();
  }

  Future<void> _submit() async {
    setState(() { _loading = true; _resultMessage = null; });
    try {
      final position = await _getLocation();
      final result = await ApiService.submitSOS(
        token: widget.token,
        lat: position.latitude,
        lng: position.longitude,
        evidenceType: widget.evidenceType,
        description: _descController.text.trim(),
      );
      setState(() => _resultMessage = result['message'] ?? 'Submitted');
    } catch (e) {
      setState(() => _resultMessage = 'Error: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _descController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('${widget.evidenceType} — Need Help')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            TextField(
              controller: _descController,
              decoration: const InputDecoration(labelText: 'Describe your situation'),
              maxLines: 4,
            ),
            const SizedBox(height: 24),
            if (_resultMessage != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Text(_resultMessage!),
              ),
            _loading
                ? const CircularProgressIndicator()
                : ElevatedButton(
                    onPressed: _submit,
                    child: const Text('Send SOS'),
                  ),
          ],
        ),
      ),
    );
  }
}