# Battery Monitoring Platform – Week 2

A real-time battery monitoring platform built to understand event-driven microservices, IoT data streaming, machine learning deployment, and real-time visualization.

## Architecture

```
Simulator
    │
    ▼
Redpanda (Telemetry Stream)
    │
    ▼
Node Consumer
    │
    ▼
Battery Analytics
(Kalman Filter)
    │
    ▼
ONNX Runtime (Random Forest)
    │
    ├──────────────► Express API ─────────► React Dashboard
    │
    ▼
RabbitMQ Fanout Exchange
    ├────────► Alert Service
    └────────► Dead Letter Queue (DLQ)
```

---

## Features

- Simulated IoT battery telemetry generation
- Real-time event streaming using Redpanda
- Battery analytics using Kalman Filtering
- SOC, SOH and Power calculations
- Machine Learning anomaly detection using Random Forest
- ONNX Runtime inference in Node.js
- RabbitMQ Fanout messaging
- Alert Service for anomaly notifications
- Dead Letter Queue (DLQ) implementation
- Express REST API
- React dashboard with live telemetry and charts

---

## Tech Stack

### Backend
- Node.js
- Express.js

### Streaming & Messaging
- Redpanda (Kafka API)
- RabbitMQ

### Machine Learning
- Python
- Pandas
- NumPy
- Scikit-learn
- ONNX
- ONNX Runtime

### Frontend
- React
- Vite
- Recharts
- Axios

---

## Project Structure

```
api/
dashboard/
inference/
processor/
python-sidecar/
rabbitmq/
redpanda/
simulator/
```

---

## Pipeline

1. Simulator generates battery telemetry.
2. Telemetry is streamed to Redpanda.
3. Node Consumer consumes the stream.
4. Battery metrics are computed using Kalman Filtering.
5. Processed features are passed to the ONNX Runtime model.
6. The Random Forest model predicts battery anomalies.
7. RabbitMQ broadcasts anomaly events.
8. Alert Service processes alert events.
9. Failed messages are routed to the Dead Letter Queue.
10. Express API exposes live telemetry.
11. React Dashboard visualizes battery health and predictions.

---

## Learning Outcomes

- Event-driven architecture
- Kafka-compatible streaming with Redpanda
- RabbitMQ Pub/Sub messaging
- Dead Letter Queue implementation
- Kalman Filtering for sensor preprocessing
- Python model deployment using ONNX Runtime
- Real-time React dashboard development
- Integration of ML inference with Node.js

---

## Future Improvements

- Redis caching
- WebSockets for real-time dashboard updates
- Model Retraining Service
- Command Service
- Protobuf-based binary messaging
- Docker & Kubernetes deployment
