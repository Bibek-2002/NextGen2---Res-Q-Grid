import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { getIncidents, getResources } from '../services/api';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';
import L from 'leaflet';
import 'leaflet.heat';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function priorityColor(priority) {
    if (priority === 'High') return '#e63946';
    if (priority === 'Medium') return '#f4a261';
    return '#2a9d8f';
}

function HeatmapLayer({ points }) {
    const map = useMap();
    const layerRef = useRef(null);

    useEffect(() => {
        if (layerRef.current) {
            map.removeLayer(layerRef.current);
        }
        if (points.length > 0) {
            layerRef.current = L.heatLayer(points, { radius: 35, blur: 25 }).addTo(map);
        }
        return () => {
            if (layerRef.current) map.removeLayer(layerRef.current);
        };
    }, [points, map]);

    return null;
}

export default function Dashboard() {
    const [incidents, setIncidents] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');

    const loadIncidents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getIncidents(token);
            setIncidents(data);
        } catch {
            setError('Could not load incidents');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const loadResources = useCallback(async () => {
        try {
            const data = await getResources(token);
            setResources(data);
        } catch {
            console.error('Could not load resources');
        }
    }, [token]);

    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }
        void Promise.resolve().then(loadIncidents);
        void Promise.resolve().then(loadResources);
    }, [loadIncidents, loadResources, navigate, token]);

    useEffect(() => {
        if (!token) return undefined;

        const socketUrl = API_BASE_URL.replace('/api', '');
        const socket = io(socketUrl);

        socket.on('incident-updated', (updatedIncident) => {
            setIncidents((previousIncidents) => {
                const exists = previousIncidents.some((incident) => incident._id === updatedIncident._id);
                if (exists) {
                    return previousIncidents.map((incident) => (
                        incident._id === updatedIncident._id ? updatedIncident : incident
                    ));
                }
                return [updatedIncident, ...previousIncidents];
            });
        });

        return () => socket.disconnect();
    }, [token]);

    function handleLogout() {
        localStorage.clear();
        navigate('/');
    }

    const validIncidents = incidents.filter((i) => i.location && i.location.lat && i.location.lng);
    const center = validIncidents.length > 0
        ? [validIncidents[0].location.lat, validIncidents[0].location.lng]
        : [22.98, 87.85];

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ width: 350, overflowY: 'auto', borderRight: '1px solid #ccc', padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Hi, {userName}</h3>
                    <button onClick={handleLogout}>Logout</button>
                </div>
                <button onClick={loadIncidents} style={{ marginBottom: 12 }}>Refresh</button>
                {loading && <p>Loading...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {incidents.map((incident) => (
                    <div key={incident._id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 10, borderLeft: `6px solid ${priorityColor(incident.priority)}` }}>
                        <strong>{incident.village || 'Unknown location'}</strong>
                        <p style={{ margin: '4px 0' }}>Victims: {incident.estimatedVictims ?? '?'}</p>
                        <p style={{ margin: '4px 0' }}>Needs: {(incident.needs || []).join(', ')}</p>
                        <p style={{ margin: '4px 0' }}>Confidence: {Math.round((incident.confidenceScore || 0) * 100)}%</p>
                        <p style={{ margin: '4px 0' }}>Status: {incident.status}</p>
                    </div>
                ))}
                <h3 style={{ marginTop: 24 }}>Resources</h3>
                {resources.map((resource) => (
                    <div key={resource._id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                        <strong>{resource.ownerType}</strong> — {resource.resourceType}: {resource.quantity}
                    </div>
                ))}
            </div>
            <div style={{ flex: 1 }}>
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <HeatmapLayer points={validIncidents.map((incident) => [incident.location.lat, incident.location.lng, incident.estimatedVictims || 5])} />
                    {validIncidents.map((incident) => (
                        <Marker key={incident._id} position={[incident.location.lat, incident.location.lng]}>
                            <Popup>
                                <strong>{incident.village || 'Unknown location'}</strong><br />
                                Victims: {incident.estimatedVictims ?? '?'}<br />
                                Needs: {(incident.needs || []).join(', ')}<br />
                                Confidence: {Math.round((incident.confidenceScore || 0) * 100)}%
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}