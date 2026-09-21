import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function Login() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const result = await login(phone, password);
            if (result.token && (result.user.role === 'Admin' || result.user.role === 'RescueTeam')) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('userName', result.user.name);
                navigate('/dashboard');
            } else if (result.token) {
                setError('This dashboard is only for Admin/RescueTeam roles');
            } else {
                setError(result.message || 'Login failed');
            }
        } catch {
            setError('Could not connect to server. Check backend URL/IP.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <form onSubmit={handleLogin} style={{ width: 300 }}>
                <h2>ResQGrid — Government Dashboard</h2>
                <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 10 }} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 10 }} />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}