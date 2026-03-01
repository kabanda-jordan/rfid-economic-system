# KJPay | RFID Payment System

KJPay is a high-performance RFID card top-up ecosystem. It features an ESP8266 Hub (Edge), a Node.js API Bridge, and a real-time Web Dashboard with full CRUD operations.

![KJPay Dashboard](https://img.shields.io/badge/Status-Production%20Ready-success)
![MQTT](https://img.shields.io/badge/Protocol-MQTT-blue)
![WebSocket](https://img.shields.io/badge/Real--time-WebSocket-orange)

---

## 🌐 Local Development & Testing

**Dashboard URL:** [http://157.173.101.159:9242/client.html](http://157.173.101.159:9242/client.html)

> [!IMPORTANT]  
> To test locally, ensure you have an MQTT broker (like Mosquitto) running on your machine.

---

## 🏗️ System Architecture

```
┌─────────────────────┐         MQTT          ┌──────────────────────┐
│   ESP8266 Hub       │ ◄──────────────────► │  Node.js Backend     │
│   (Edge Device)     │   rfid/the_rock/*     │   (API Bridge)       │
└─────────────────────┘                        └──────────────────────┘
         │                                              │
         │ Reads/Writes                                 │ WebSocket + HTTP
         │ RFID Cards                                   │
         ▼                                              ▼
┌─────────────────────┐                        ┌──────────────────────┐
│  MFRC522 Reader     │                        │  Web Dashboard       │
│  (RFID Scanner)     │                        │  (Real-time UI)      │
└─────────────────────┘                        └──────────────────────┘
```

### Components:

1. **ESP8266 Hub**: Processes RFID cards and writes balance to Sector 2, communicating via **MQTT** on the `rfid/the_rock/` namespace.
2. **Backend Bridge (Node.js)**: Bridges the MQTT broker and the Dashboard using **MQTT** for ESP8266 communication and **WebSockets/HTTP** for the dashboard.
3. **Web Dashboard**: A real-time UI built with HTML/Tailwind CSS that displays card statuses and allows triggering top-up operations.

---

## 📁 Project Structure

```
rfid/
├── firmware/
│   ├── firmware.ino          # Main logic for RFID scanning and MQTT communication
│   └── debug_firmware.ino    # Debug version with serial output
├── client.html               # Responsive UI for managing card balances
├── server.js                 # Express server with WebSocket and MQTT integration
├── mosquitto.conf            # MQTT broker configuration
├── package.json              # Node.js dependencies
└── README.md                 # This file
```

---

## 🔌 Protocol Separation & Isolation

### MQTT
- **Purpose**: Used between the ESP8266 and the Backend for high-efficiency edge-to-cloud communication
- **Topic Isolation**: All MQTT topics are prefixed with `rfid/the_rock/` to ensure full isolation on a shared broker
- **Topics**:
  - `rfid/the_rock/card/status` - Card scan events
  - `rfid/the_rock/card/balance` - Balance update events
  - `rfid/the_rock/card/topup` - Top-up commands

### WebSockets
- **Purpose**: Used for real-time "KJPay Stream" updates
- **Features**: Live card scans, balance updates, and activity feed

### HTTP (REST)
- **Purpose**: Used for "Top-Up" command requests from the dashboard to the backend
- **Endpoints**:
  - `POST /cards` - Register a new card
  - `GET /cards` - Get all cards
  - `GET /cards/:uid` - Get specific card
  - `PUT /cards/:uid` - Update card information
  - `DELETE /cards/:uid` - Delete a card
  - `POST /topup` - Send top-up command via MQTT

---

## 🚀 How to Run

### Backend
1. Navigate to the project folder
2. Run `npm install` to install dependencies
3. Run `npm start` to start the bridge
4. Server will start on `http://157.173.101.159:9242`

### Firmware
1. Upload `firmware/firmware.ino` to your ESP8266 using Arduino IDE
2. Ensure your wiring matches the pin definitions in `firmware.ino`
3. Configure WiFi credentials and MQTT broker IP in the code
4. The device will connect to WiFi and start scanning for cards

### Dashboard
1. Ensure the backend server is running
2. Open your browser and navigate to: `http://157.173.101.159:9242/client.html`
3. The dashboard will connect via WebSocket automatically

---

## ✨ Features

✅ **Real-time balance display**  
✅ **Register and manage RFID cards** (CRUD operations)  
✅ **Top-up RFID cards via dashboard**  
✅ **Real-time activity stream using WebSockets**  
✅ **Transaction log and history**  
✅ **Card holder management**  
✅ **Multiple card types** (Standard, Premium, VIP, Employee)  
✅ **Scan count tracking**  
✅ **System status monitoring** (MQTT Broker, ESP8266 Hub)  

---

## 🎨 Dashboard Overview

### KJPay RFID Payment System

**Dashboard Sections:**
- 📊 Dashboard
- 💳 RFID Cards
- 📜 Transactions
- 🔌 ESP8266 Hub
- 📈 Reports
- ⚙️ Settings

**System Status:**
- MQTT Broker: Connection indicator
- ESP8266 Hub: Scanning status

**Team & Admin Info:**
- **TR** / The Rock / Team Admin

---

## 💳 RFID Card Management

### Real-time Card Monitoring
- **Protocol**: MQTT (`rfid/the_rock/*`)
- **Stats Display**:
  - Active cards count
  - Total balance (RWF)
  - Transactions count
  - Last scan timestamp

### Getting Started
1. Scan an RFID card on the ESP8266 hub to get started
2. Card will auto-register on first scan
3. View card details in the dashboard grid
4. Manage cards using CRUD operations

### Card Information
Each card displays:
- Card Holder Name
- Card UID (Unique Identifier)
- Current Balance (RWF)
- Card Type (Standard/Premium/VIP/Employee)
- Scan Count
- Last Scan Time
- Edit/Delete buttons (on hover)

---

## 💰 Card Top-Up

### Add Balance to RFID Cards via MQTT Command

**Steps:**
1. Input **Card UID** (e.g., A1B2C3D4)
2. Input **Amount** (RWF)
3. Click **"Send Top-Up Command"**
4. Backend publishes MQTT message to ESP8266
5. ESP8266 writes new balance to card Sector 2
6. Dashboard updates in real-time

---

## 📡 Real-Time Activity Stream

### Live Updates via WebSocket

**Activity Types:**
- 🔵 **Card Scans**: When RFID card is detected
- 🟢 **Top-ups**: When balance is added
- ⚪ **System Events**: CRUD operations and connections

**Status:**
- Waiting for RFID events...
- Activity will appear here in real-time
- Shows timestamp and MQTT topic for each event

---

## 🎮 CRUD Operations

### Create (Register Card)
- Click "Register Card" button
- Enter Card UID, Holder Name, Card Type, and Notes
- Card is added to the system

### Read (View Cards)
- All registered cards displayed in grid view
- Real-time balance updates
- Scan history and statistics

### Update (Edit Card)
- Hover over card and click edit icon
- Update holder name, card type, or notes
- Changes broadcast to all connected clients

### Delete (Remove Card)
- Hover over card and click delete icon
- Confirm deletion in modal
- Card removed from system

---

## 🔧 Configuration

### Backend (server.js)
```javascript
const TEAM_ID = 'the_rock';
const MQTT_BROKER = '157.173.101.159';
const MQTT_PORT = 1883;
const PORT = 9242;
```

### Frontend (client.html)
```javascript
const BACKEND_URL = "http://157.173.101.159:9242";
```

### ESP8266 (firmware.ino)
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "157.173.101.159";
const int mqtt_port = 1883;
```

---

## 🛠️ Technical Stack

### Hardware
- **ESP8266**: WiFi-enabled microcontroller
- **MFRC522**: RFID reader module (13.56 MHz)
- **RFID Cards**: MIFARE Classic 1K

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web server framework
- **MQTT**: IoT messaging protocol
- **WebSocket**: Real-time bidirectional communication

### Frontend
- **HTML5**: Markup language
- **Tailwind CSS**: Utility-first CSS framework
- **JavaScript**: Client-side scripting
- **Font Awesome**: Icon library

---

## 🐛 Troubleshooting

### Dashboard not loading
1. Verify backend server is running on port 9242
2. Check browser console (F12) for errors
3. Ensure WebSocket connection is established
4. Clear browser cache and reload

### Cards not appearing
1. Check MQTT broker is running
2. Verify ESP8266 is connected to WiFi
3. Ensure MQTT topics match: `rfid/the_rock/*`
4. Check backend console for MQTT messages

### Top-up not working
1. Verify card UID is correct (uppercase)
2. Check MQTT broker is receiving messages
3. Ensure ESP8266 is subscribed to topup topic
4. Check ESP8266 serial monitor for errors

---

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "ws": "^8.14.2",
  "mqtt": "^5.2.0"
}
```

Install with:
```bash
npm install
```

---

## 👥 Team

**Team Name**: The Rock  
**Project**: KJPay - RFID Payment System  
**Admin**: TR (Team Admin)  
**Year**: 2026

---

## 🎓 Educational Value

This project demonstrates:
- IoT device communication using MQTT
- Real-time web applications with WebSocket
- RESTful API design and implementation
- CRUD operations and data management
- Frontend development with modern CSS
- Hardware integration (ESP8266 + RFID)
- System architecture and protocol separation

---

## 🚀 Future Enhancements

- [ ] User authentication and authorization
- [ ] Transaction history with detailed logs
- [ ] Export data to CSV/PDF
- [ ] Email notifications
- [ ] Mobile app support
- [ ] Multiple ESP8266 hubs
- [ ] Database persistence (MongoDB/PostgreSQL)
- [ ] Analytics dashboard with charts
- [ ] Card blocking/unblocking
- [ ] Balance limits and restrictions

---

## 📄 License

This project is created for educational purposes.

---

## 🙏 Acknowledgments

- MQTT Protocol for efficient IoT communication
- Tailwind CSS for rapid UI development
- Font Awesome for beautiful icons
- Express.js for robust backend framework
- WebSocket for real-time communication

---

**Built with ❤️ by Team The Rock**

*Making RFID payments simple, secure, and stylish!*
