import axios from 'axios';
import { API_BASE_URL } from '../config';

export async function login(phone, password) {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, { phone, password });
    return res.data;
}

export async function getIncidents(token) {
    const res = await axios.get(`${API_BASE_URL}/incidents`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}

export async function getIncidentById(token, id) {
    const res = await axios.get(`${API_BASE_URL}/incidents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}

export async function getResources(token) {
    const res = await axios.get(`${API_BASE_URL}/resources`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}