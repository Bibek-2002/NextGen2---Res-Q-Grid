import 'package:flutter/material.dart';
import '../services/api_service.dart';

class KnowledgeScreen extends StatefulWidget {
  final String token;

  const KnowledgeScreen({super.key, required this.token});

  @override
  State<KnowledgeScreen> createState() => _KnowledgeScreenState();
}

class _KnowledgeScreenState extends State<KnowledgeScreen> {
  List<dynamic> _entries = [];
  bool _loading = true;
  String? _error;

  static const categoryIcons = {
    'Road': Icons.route,
    'Bridge': Icons.compare_arrows,
    'Shelter': Icons.home,
    'BoatLaunchPoint': Icons.directions_boat,
    'WaterDepth': Icons.waves,
    'VillageContact': Icons.contact_phone,
    'LocalLanguage': Icons.translate,
    'MedicalResource': Icons.medical_services,
    'LivestockArea': Icons.pets,
    'DangerZone': Icons.warning,
  };

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
      final entries = await ApiService.getKnowledge(widget.token);
      if (mounted) setState(() => _entries = entries);
    } catch (e) {
      if (mounted) setState(() => _error = 'Could not load local knowledge');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Local Knowledge'),
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _entries.isEmpty
                  ? const Center(child: Text('No local knowledge entries yet'))
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        itemCount: _entries.length,
                        itemBuilder: (context, index) {
                          final entry = _entries[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            child: ListTile(
                              leading: Icon(
                                categoryIcons[entry['category']] ?? Icons.info,
                              ),
                              title: Text(entry['category'] ?? ''),
                              subtitle: Text(entry['description'] ?? ''),
                              trailing: entry['village'] != null
                                  ? Text(entry['village'])
                                  : null,
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
