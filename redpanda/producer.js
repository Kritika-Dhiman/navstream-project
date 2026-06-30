const { Kafka }=require("kafkajs")

const kafka=new Kafka({
    clientId: "battery-simulator",
    brokers: ["localhost:19092"]
})

const producer=kafka.producer();

async function connectProducer() {
    await producer.connect();
};

async function sendTelemetry(data) {
    try {
        await producer.send({
            topic: "battery-telemetry",
            messages: [
                {
                    value: JSON.stringify(data)
                }
            ]
        });
    } catch(err) {
        console.error("Producer Error:", err);
    }
}
module.exports={
    connectProducer,
    sendTelemetry
};