import 'package:flutter/material.dart';
import '../services/api_service.dart';

class StatusScreen extends StatefulWidget {
  final String token;

  const StatusScreen({super.key, required this.token});

  @override
  State<StatusScreen> createState() => _StatusScreenState();
}

class _StatusScreenState extends State<StatusScreen> {
  List<dynamic> _reports = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadReports();
  }

  Future<void> _loadReports() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final reports = await ApiService.getMyReports(widget.token);
      if (mounted) {
        setState(() => _reports = reports);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _error = 'Could not load reports');
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Map<String, dynamic> _displayStatus(String status) {
    switch (status) {
      case 'Pending':
        return {'label': 'Sent', 'color': Colors.orange, 'icon': Icons.send};
      case 'Reconciled':
        return {'label': 'Acknowledged', 'color': Colors.green, 'icon': Icons.check_circle};
      case 'Duplicate':
        return {'label': 'Delivered (merged with existing)', 'color': Colors.blue, 'icon': Icons.merge};
      case 'Conflicting':
        return {'label': 'Delivered (under review)', 'color': Colors.red, 'icon': Icons.warning};
      default:
        return {'label': status, 'color': Colors.grey, 'icon': Icons.help};
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My SOS Reports'),
        actions: [
          IconButton(onPressed: _loadReports, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _reports.isEmpty
                  ? const Center(child: Text('No SOS reports yet'))
                  : RefreshIndicator(
                      onRefresh: _loadReports,
                      child: ListView.builder(
                        itemCount: _reports.length,
                        itemBuilder: (context, index) {
                          final report = _reports[index];
                          final display = _displayStatus(report['status'] ?? '');
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            child: ListTile(
                              leading: Icon(display['icon'], color: display['color']),
                              title: Text(report['evidenceType'] ?? ''),
                              subtitle: Text(report['description'] ?? ''),
                              trailing: Text(
                                display['label'],
                                style: TextStyle(
                                  color: display['color'],
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
