// testPublisher.js

const {
    connectRabbitMQ,
    publishEvent
} = require("./rabbitmq/publisher");

async function test() {

    await connectRabbitMQ();

    await publishEvent({
        type: "LOW_SOC",
        severity: "HIGH"
    });

    setTimeout(() => {
        process.exit(0);
    }, 5000);
}

test();