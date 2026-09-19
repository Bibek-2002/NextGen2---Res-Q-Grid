import 'package:flutter/material.dart';

import '../services/api_service.dart';
import 'camp_dashboard.dart';
import 'hospital_dashboard.dart';
import 'ngo_dashboard.dart';
import 'rescue_dashboard.dart';
import 'volunteer_dashboard.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _login() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await ApiService.login(
        _phoneController.text.trim(),
        _passwordController.text,
      );
      if (!mounted) return;

      final user = result['user'];
      if (result['token'] is! String || user is! Map) {
        setState(() => _error = result['message'] ?? 'Login failed');
        return;
      }

      final token = result['token'] as String;
      final userName = user['name'] as String? ?? 'Team member';
      final role = user['role'] as String?;
      final Widget dashboard;
      switch (role) {
        case 'Volunteer':
          dashboard = VolunteerDashboard(token: token, userName: userName);
          break;
        case 'Hospital':
          dashboard = HospitalDashboard(token: token, userName: userName);
          break;
        case 'NGO':
          dashboard = NgoDashboard(token: token, userName: userName);
          break;
        case 'Camp':
          dashboard = CampDashboard(token: token, userName: userName);
          break;
        case 'RescueTeam':
          dashboard = RescueDashboard(token: token, userName: userName);
          break;
        default:
          setState(() => _error =
              'This app is only for Volunteer/Hospital/NGO/Camp/RescueTeam roles');
          return;
      }

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => dashboard),
      );
    } catch (_) {
      if (mounted) {
        setState(() => _error =
            'Could not connect to server. Check backend URL/IP.');
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ResQGrid - Team Login')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _phoneController,
              decoration: const InputDecoration(labelText: 'Phone'),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            const SizedBox(height: 24),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Text(
                  _error!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                  textAlign: TextAlign.center,
                ),
              ),
            _loading
                ? const CircularProgressIndicator()
                : ElevatedButton(
                    onPressed: _login,
                    child: const Text('Login'),
                  ),
          ],
        ),
      ),
    );
  }
}