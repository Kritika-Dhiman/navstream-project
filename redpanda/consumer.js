const express=require("express");
const cors=require("cors");
const batteryCalculator=require('../processor/batteryCalculator');

const {connectRabbitMQ, publishEvent}=require('../rabbitmq/publisher');
const {loadModel,predictAnomaly}=require('../inference/onnxInference');
const { Kafka }=require("kafkajs");

const app = express();

app.use(cors());

let latestTelemetry = {};
const kafka=new Kafka({
    clientId: "battery-consumer",
    brokers: ["localhost:19092"],
});

const consumer=kafka.consumer({
    groupId: "battery-group",
});
app.get("/telemetry", (req, res) => {
    res.json(latestTelemetry);
});
async function run() {
    app.listen(5000, () => {
        console.log("API running on http://localhost:5000");
    });
    await loadModel();
    await connectRabbitMQ();
    await consumer.connect();

    await consumer.subscribe({
        topic: "battery-telemetry",
        fromBeginning:true
    });

    await consumer.run({
        eachMessage: async ({message}) =>{
            const data= JSON.parse(
                message.value.toString()
            );
            const result = batteryCalculator.calculate(data);
           
            console.log({
                filteredCurrent: result.filteredCurrent,
                soc: result.filterSOC,
                soh: result.filterSOH,
                powerExport: result.powerExport
            });
            try {
                const prediction = await predictAnomaly({
                    voltage: data.voltage,
                    current: data.current,
                    temperature: data.temperature,
                    soc: result.filterSOC,
                    filteredCurrent: result.filteredCurrent,
                    powerExport: result.powerExport,
                    soh: result.filterSOH
                });
            
                console.log(prediction);
            
                if (prediction.isAnomaly) {
                    await publishEvent({
                        timestamp: Date.now(),
                        source: "onnx-model",
                        type: "BATTERY_ANOMALY",
                        severity: "HIGH",
                        prediction: prediction.label
                    });
                }
                latestTelemetry = {
                    voltage: data.voltage,
                    current: data.current,
                    temperature: data.temperature,
                    soc: result.filterSOC,
                    soh: result.filterSOH,
                    power:result.powerExport,
                    prediction: prediction.label,
                    isAnomaly: prediction.isAnomaly,
                    timestamp: Date.now()
                };
            } catch (err) {
                console.error("ONNX inference failed:", err);
            }
            
        },
    });
}

run().catch(console.error);