import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config.dart';

class ApiService {
  static Future<Map<String, dynamic>> login(
    String phone,
    String password,
  ) async {
    final response = await http
        .post(
          Uri.parse('${AppConfig.baseUrl}/auth/login'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'phone': phone, 'password': password}),
        )
        .timeout(const Duration(seconds: 10));
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> hospitalUpdate(
    String token,
    String resourceType,
    int quantity,
    String unit,
  ) async {
    return _postAuthorized(
      '/hospital-update',
      token,
      {'resourceType': resourceType, 'quantity': quantity, 'unit': unit},
    );
  }

  static Future<Map<String, dynamic>> ngoInventoryUpdate(
    String token,
    String resourceType,
    int quantity,
    String unit,
  ) async {
    return _postAuthorized(
      '/ngo-inventory',
      token,
      {'resourceType': resourceType, 'quantity': quantity, 'unit': unit},
    );
  }

  static Future<Map<String, dynamic>> campStatusUpdate(
    String token,
    String resourceType,
    int quantity,
    String unit,
  ) async {
    return _postAuthorized(
      '/camp-status',
      token,
      {'resourceType': resourceType, 'quantity': quantity, 'unit': unit},
    );
  }

  static Future<Map<String, dynamic>> addKnowledge(
    String token,
    String category,
    String description,
    String? village,
  ) async {
    return _postAuthorized(
      '/knowledge',
      token,
      {'category': category, 'description': description, 'village': village},
    );
  }

  static Future<List<dynamic>> getIncidents(String token) async {
    final response = await http
        .get(
          Uri.parse('${AppConfig.baseUrl}/incidents'),
          headers: {'Authorization': 'Bearer $token'},
        )
        .timeout(const Duration(seconds: 10));
    return jsonDecode(response.body) as List<dynamic>;
  }

  static Future<Map<String, dynamic>> _postAuthorized(
    String path,
    String token,
    Map<String, dynamic> body,
  ) async {
    final response = await http
        .post(
          Uri.parse('${AppConfig.baseUrl}$path'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 10));
    return jsonDecode(response.body) as Map<String, dynamic>;
  }
}