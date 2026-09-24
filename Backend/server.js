require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGO_URI;


app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
	cors: { origin: '*' }
});

app.set('io', io);

io.on('connection', (socket) => {
	console.log('Client connected:', socket.id);
	socket.on('disconnect', () => {
		console.log('Client disconnected:', socket.id);
	});
});

app.get('/', (req, res) => {
	res.json({ message: 'Backend is running' });
});

app.get('/health', (req, res) => {
	const isConnected = mongoose.connection.readyState === 1;

	res.status(isConnected ? 200 : 503).json({
		server: 'ok',
		mongodb: isConnected ? 'connected' : 'disconnected'
	});
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api', require('./routes/updates'));
app.use('/api/knowledge', require('./routes/knowledge'));
app.use('/api/incidents', require('./routes/incidents'));

async function startServer() {
	if (!mongoUri) {
		throw new Error('MONGO_URI is missing in .env');
	}

	await mongoose.connect(mongoUri, {
		serverSelectionTimeoutMS: 10000
	});

	server.listen(port, () => {
		console.log(`Server running on http://localhost:${port}`);
		console.log('MongoDB connected successfully');
	});
}

mongoose.connection.on('error', (error) => {
	console.error('MongoDB error:', error.message);
});

startServer().catch((error) => {
	console.error('Unable to start server:', error.message);
	process.exit(1);
});
