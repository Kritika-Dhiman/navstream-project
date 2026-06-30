# Battery Calculator with Kalman Filter and MQTT Pipeline

A real-time Battery Management System (BMS) analytics pipeline that computes battery parameters from telemetry data, applies Kalman Filters for noise reduction, and processes telemetry using an MQTT-based publish-subscribe architecture.

## Features

- Battery parameter calculations based on the provided specification
- 1D Kalman Filter for sensor noise reduction
- Filter orchestration across multiple battery parameter pipelines
- MQTT-based telemetry streaming using Aedes broker
- Real-time telemetry processing
- Statistics tracking (Average, Minimum, Maximum)

---

## Battery Parameters Calculated

- Open Voltage
- Load Voltage
- Current Export
- Current Draw
- Power Draw
- Power Export
- Current Capacity
- State of Charge (SOC)
- State of Health (SOH)
- Internal Resistance (IR)
- Consumed Energy
- Remaining Energy
- Charged Ampere Hour (CAh)
- Discharged Ampere Hour (DAh)
- Cycle Count
- Grid Export Power
- Load Power Draw
- Solar PV Power

---

## Project Architecture

```
Telemetry Producer
        │
        ▼
 MQTT Broker (Aedes)
        │
        ▼
 MQTT Consumer (mqttPipeline.js)
        │
        ▼
 Filter Orchestrator
 ├── Current Kalman Filter
 ├── SOC Kalman Filter
 ├── SOH Kalman Filter
 └── Internal Resistance Kalman Filter
        │
        ▼
 Battery Analytics Engine
        │
        ▼
 Processed Telemetry
        │
        ▼
 Monitor
```

---

## Project Structure

```
BATTERYCALCULATOR/
│
├── app.js
├── batteryCalculator.js
├── kalmanFilter.js
├── filterOrchestrator.js
├── mqttPipeline.js
├── producer.js
├── monitor.js
├── package.json
└── README.md
```

---

## Components

### `batteryCalculator.js`

Implements the battery equations and computes battery parameters from telemetry.

### `kalmanFilter.js`

Implements a reusable 1D Kalman Filter for smoothing noisy sensor measurements.

### `filterOrchestrator.js`

Manages multiple Kalman Filter instances for Current, SOC, SOH, and Internal Resistance.

### `producer.js`

Simulates battery telemetry by publishing sensor data to MQTT.

### `mqttPipeline.js`

Consumes raw telemetry, applies filtering and battery calculations, then publishes processed results.

### `monitor.js`

Subscribes to processed telemetry and displays the computed battery metrics.

### `app.js`

Standalone testing file for validating calculations without MQTT.

---

## Technologies Used

- Node.js
- JavaScript
- MQTT
- Aedes MQTT Broker

---

## Installation

Install dependencies:

```bash
npm install
```

Install Aedes globally:

```bash
npm install -g aedes-cli
```

---

## Running the Project

### 1. Start MQTT Broker

```bash
aedes
```

---

### 2. Start Consumer

```bash
node mqttPipeline.js
```

---

### 3. Start Monitor

```bash
node monitor.js
```

---

### 4. Start Producer

```bash
node producer.js
```

---

## Testing Without MQTT

To directly test the battery calculator:

```bash
node app.js
```

---

## Kalman Filter Equations

The implemented Kalman Filter uses the following recursive equations:

### Prediction

```
P = P + Q
```

### Kalman Gain

```
K = P / (P + R)
```

### State Update

```
x = x + K(z - x)
```

### Covariance Update

```
P = (1 - K)P
```

where:

- **Q** = Process Noise
- **R** = Measurement Noise
- **P** = Estimate Covariance
- **K** = Kalman Gain
- **x** = Estimated State
- **z** = Measured Value

---

## MQTT Topics

| Topic | Description |
|-------|-------------|
| `battery/raw` | Raw battery telemetry |
| `battery/processed` | Filtered and processed battery metrics |

---

## Future Improvements

- Integration with real battery sensors (ESP32/BMS)
- Extended Kalman Filter (EKF)
- Database integration for historical analytics
- Web dashboard for real-time visualization
- Alerting and anomaly detection

---
