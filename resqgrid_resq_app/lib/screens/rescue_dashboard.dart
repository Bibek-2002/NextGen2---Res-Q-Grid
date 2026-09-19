import 'package:flutter/material.dart';

import '../services/api_service.dart';

class RescueDashboard extends StatefulWidget {
  final String token;
  final String userName;

  const RescueDashboard({
    super.key,
    required this.token,
    required this.userName,
  });

  @override
  State<RescueDashboard> createState() => _RescueDashboardState();
}

class _RescueDashboardState extends State<RescueDashboard> {
  List<dynamic> _incidents = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final incidents = await ApiService.getIncidents(widget.token);
      if (mounted) setState(() => _incidents = incidents);
    } catch (_) {
      if (mounted) setState(() => _error = 'Could not load incidents');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Color _priorityColor(String? priority) {
    switch (priority) {
      case 'High':
        return Colors.red;
      case 'Medium':
        return Colors.orange;
      default:
        return Colors.green;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Rescue Team - ${widget.userName}'),
        actions: [
          IconButton(
            onPressed: _load,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _incidents.isEmpty
                  ? const Center(child: Text('No active incidents'))
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        itemCount: _incidents.length,
                        itemBuilder: (context, index) {
                          final incident =
                              _incidents[index] as Map<String, dynamic>;
                          final needs =
                              (incident['needs'] as List?)?.join(', ') ?? '';
                          final confidence = incident['confidenceScore'] is num
                              ? (incident['confidenceScore'] as num).toDouble()
                              : 0.0;
                          return Card(
                            margin: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor:
                                    _priorityColor(incident['priority'] as String?),
                                child: Text('${incident['estimatedVictims'] ?? '?'}'),
                              ),
                              title: Text(
                                incident['village'] as String? ??
                                    'Unknown location',
                              ),
                              subtitle: Text(
                                'Needs: $needs\nConfidence: ${(confidence * 100).toStringAsFixed(0)}%',
                              ),
                              isThreeLine: true,
                              trailing: Text(
                                incident['status'] as String? ?? '',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
