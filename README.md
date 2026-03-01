# Emerald Wallet | RFID Ecosystem

This project is a high-performance RFID card top-up ecosystem. It features an ESP8266 Emerald Hub (Edge), a Node.js API Bridge, and a real-time Web Dashboard.

## Local Development & Testing
**Dashboard URL:** [http://localhost:3000/wallet.html](http://localhost:3000/wallet.html)

> [!IMPORTANT]
> To test locally, ensure you have an MQTT broker (like Mosquitto) running on your machine.

## System Architecture

1.  **Emerald Hub (ESP8266):** Processes RFID cards and writes balance to Sector 2, communicating via **MQTT** on the `rfid/the_rock/` namespace.

2.  **Backend Bridge (Node.js):** Bridges between the MQTT broker and the Dashboard. It uses **MQTT** to communicate with the ESP8266 and **WebSockets/HTTP** for the dashboard.

3.  **Web Dashboard:** A real-time UI built with HTML/Tailwind CSS that displays card statuses and allows triggering top-up operations.

## Project Structure

-   `firmware/`: Contains the MicroPython code for the ESP8266.
    -   `main.py`: Main logic for RFID scanning and MQTT communication.
    -   `mfrc522.py`: RFID reader library.
-   `backend/`: Node.js server acting as the communication bridge.
    -   `server.js`: Express server with WebSocket and MQTT integration.
-   `frontend/`: The Web Dashboard code.
    -   `wallet.html`: Responsive UI for managing card balances.

## Protocol Separation & Isolation

-   **MQTT:** Used between the ESP8266 and the Backend for high-efficiency edge-to-cloud communication.
-   **Topic Isolation:** All MQTT topics are prefixed with `rfid/the_rock/` to ensure full isolation on the shared broker.
-   **WebSockets:** Used for real-time " Emerald Stream" updates.

-   **HTTP (REST):** Used for "Top-Up" command requests from the dashboard to the backend.

## How to Run

### Backend
1.  Navigate to the `backend/` folder.
2.  Run `npm install` to install dependencies.
3.  Run `npm start` to start the bridge.

### Firmware
1.  Upload `main.py` and `mfrc522.py` to your ESP8266 using Thonny or ampy.
2.  Ensure your wiring matches the pin definitions in `main.py`.
3.  The device will connect to WiFi and start scanning for cards.

## Features
-   ✅ Real-time balance display.
-   ✅ Secure card-based balance storage (Sector 2, Block 8).
-   ✅ Team-based topic isolation.
-   ✅ Modern responsive dashboard with Dark Mode support.