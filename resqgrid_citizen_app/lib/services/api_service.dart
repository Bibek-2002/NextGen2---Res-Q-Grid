import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';

class ApiService {
  static Future<Map<String, dynamic>> login(String phone, String password) async {
    final res = await http.post(
      Uri.parse('${AppConfig.baseUrl}/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone, 'password': password}),
    );
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> submitSOS({
    required String token,
    required double lat,
    required double lng,
    required String evidenceType,
    required String description,
  }) async {
    final res = await http.post(
      Uri.parse('${AppConfig.baseUrl}/sos'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'location': {'lat': lat, 'lng': lng},
        'evidenceType': evidenceType,
        'description': description,
      }),
    );
    return jsonDecode(res.body);
  }

  static Future<List<dynamic>> getMyReports(String token) async {
    final res = await http
        .get(
          Uri.parse('${AppConfig.baseUrl}/sos/my-reports'),
          headers: {'Authorization': 'Bearer $token'},
        )
        .timeout(const Duration(seconds: 10));
    return jsonDecode(res.body);
  }
}