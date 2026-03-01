const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mqtt = require('mqtt');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// === YOUR CONFIG ===
const TEAM_ID = 'the_rock';
const MQTT_BROKER = '157.173.101.159';
const MQTT_PORT = 1883;

const BASE_TOPIC = `rfid/${TEAM_ID}`;
const STATUS_TOPIC = `${BASE_TOPIC}/card/status`;
const BALANCE_TOPIC = `${BASE_TOPIC}/card/balance`;
const TOPUP_TOPIC = `${BASE_TOPIC}/card/topup`;

// MQTT Client
const mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`, {
    clientId: `backend_${TEAM_ID}_${Math.random().toString(16).slice(3)}`
});

mqttClient.on('connect', () => {
    console.log('--- DEBUG: MQTT connected to broker ---');
    mqttClient.subscribe([STATUS_TOPIC, BALANCE_TOPIC], (err) => {
        if (!err) {
            console.log(`--- DEBUG: Subscribed to ${STATUS_TOPIC} and ${BALANCE_TOPIC} ---`);
        } else {
            console.error('--- DEBUG: Subscription Error:', err);
        }
    });
});

mqttClient.on('message', (topic, message) => {
    console.log(`--- DEBUG: MQTT Message Received on [${topic}] ---`);
    try {
        const payload = JSON.parse(message.toString());
        console.log('--- DEBUG: Payload:', JSON.stringify(payload, null, 2));

        // Update card database when card is scanned
        if (topic.includes('status') && payload.uid) {
            const uid = payload.uid;
            let card = cardsDB.get(uid);
            
            if (!card) {
                // Auto-register new card on first scan
                card = {
                    uid,
                    holderName: 'Unknown',
                    cardType: 'Standard',
                    notes: 'Auto-registered on scan',
                    balance: payload.balance || 0,
                    createdAt: new Date().toISOString(),
                    lastScan: new Date().toISOString(),
                    scanCount: 1
                };
                cardsDB.set(uid, card);
                console.log(`--- DEBUG: Auto-registered new card ${uid} ---`);
            } else {
                // Update existing card
                card.balance = payload.balance || card.balance;
                card.lastScan = new Date().toISOString();
                card.scanCount = (card.scanCount || 0) + 1;
                cardsDB.set(uid, card);
            }
        }
        
        // Update balance when top-up occurs
        if (topic.includes('balance') && payload.uid) {
            const uid = payload.uid;
            const card = cardsDB.get(uid);
            if (card) {
                card.balance = payload.new_balance || payload.balance || card.balance;
                card.lastScan = new Date().toISOString();
                cardsDB.set(uid, card);
            }
        }

        // Broadcast to all connected WebSocket clients
        let clientCount = 0;
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ topic, data: payload }));
                clientCount++;
            }
        });
        console.log(`--- DEBUG: Broadcasted to ${clientCount} dashboard(s) ---`);
    } catch (e) {
        console.error('--- DEBUG: Invalid JSON Received:', message.toString());
    }
});

mqttClient.on('error', (err) => console.error('--- DEBUG: MQTT ERROR:', err));

// In-memory card database (replace with real DB in production)
const cardsDB = new Map();

// HTTP middleware
app.use(express.json());

// Serve frontend static files
app.use(express.static(__dirname));

// === CRUD ENDPOINTS ===

// CREATE - Register a new card
app.post('/cards', (req, res) => {
    console.log('--- DEBUG: POST /cards (CREATE) received ---');
    const { uid, holderName, cardType, notes } = req.body;
    
    if (!uid) {
        return res.status(400).json({ error: 'Card UID is required' });
    }
    
    if (cardsDB.has(uid)) {
        return res.status(409).json({ error: 'Card already exists' });
    }
    
    const card = {
        uid,
        holderName: holderName || 'Unknown',
        cardType: cardType || 'Standard',
        notes: notes || '',
        balance: 0,
        createdAt: new Date().toISOString(),
        lastScan: null,
        scanCount: 0
    };
    
    cardsDB.set(uid, card);
    console.log(`--- DEBUG: Card ${uid} created ---`);
    
    // Broadcast to all WebSocket clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ 
                topic: 'card/created', 
                data: card 
            }));
        }
    });
    
    res.status(201).json(card);
});

// READ - Get all cards
app.get('/cards', (req, res) => {
    console.log('--- DEBUG: GET /cards (READ ALL) received ---');
    const cards = Array.from(cardsDB.values());
    res.json(cards);
});

// READ - Get single card
app.get('/cards/:uid', (req, res) => {
    console.log(`--- DEBUG: GET /cards/${req.params.uid} (READ ONE) received ---`);
    const card = cardsDB.get(req.params.uid);
    
    if (!card) {
        return res.status(404).json({ error: 'Card not found' });
    }
    
    res.json(card);
});

// UPDATE - Update card information
app.put('/cards/:uid', (req, res) => {
    console.log(`--- DEBUG: PUT /cards/${req.params.uid} (UPDATE) received ---`);
    const { uid } = req.params;
    const card = cardsDB.get(uid);
    
    if (!card) {
        return res.status(404).json({ error: 'Card not found' });
    }
    
    const { holderName, cardType, notes } = req.body;
    
    if (holderName !== undefined) card.holderName = holderName;
    if (cardType !== undefined) card.cardType = cardType;
    if (notes !== undefined) card.notes = notes;
    card.updatedAt = new Date().toISOString();
    
    cardsDB.set(uid, card);
    console.log(`--- DEBUG: Card ${uid} updated ---`);
    
    // Broadcast to all WebSocket clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ 
                topic: 'card/updated', 
                data: card 
            }));
        }
    });
    
    res.json(card);
});

// DELETE - Remove a card
app.delete('/cards/:uid', (req, res) => {
    console.log(`--- DEBUG: DELETE /cards/${req.params.uid} (DELETE) received ---`);
    const { uid } = req.params;
    
    if (!cardsDB.has(uid)) {
        return res.status(404).json({ error: 'Card not found' });
    }
    
    const card = cardsDB.get(uid);
    cardsDB.delete(uid);
    console.log(`--- DEBUG: Card ${uid} deleted ---`);
    
    // Broadcast to all WebSocket clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ 
                topic: 'card/deleted', 
                data: { uid } 
            }));
        }
    });
    
    res.json({ success: true, message: 'Card deleted', card });
});

// POST /topup - from dashboard
app.post('/topup', (req, res) => {
    console.log('--- DEBUG: POST /topup received ---');
    const { uid, amount } = req.body;
    console.log('--- DEBUG: Topup Data:', { uid, amount });

    if (!uid || typeof amount !== 'number' || amount <= 0) {
        console.error('--- DEBUG: Topup Validation Failed ---');
        return res.status(400).json({ error: 'Invalid uid or amount (>0)' });
    }

    const payload = JSON.stringify({ uid, amount });
    mqttClient.publish(TOPUP_TOPIC, payload);
    console.log(`--- DEBUG: Published to ${TOPUP_TOPIC} ---`);

    res.json({ success: true, message: 'Top-up command sent' });
});

// WebSocket connection
wss.on('connection', (ws) => {
    console.log('--- DEBUG: New Dashboard WebSocket Connection Established ---');
    ws.send(JSON.stringify({ message: 'Connected to real-time updates' }));

    ws.on('close', () => console.log('--- DEBUG: Dashboard WebSocket Disconnected ---'));
});

const PORT = 9259;
server.listen(PORT, '0.0.0.0', () => {
    console.log('============================================');
    console.log(`Backend running on http://localhost:${PORT}/wallet.html`);
    console.log('Waiting for RFID scans...');
    console.log('============================================');
});

