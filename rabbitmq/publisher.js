const amqp = require("amqplib");

let connection;
let channel;

async function connectRabbitMQ() {

    connection = await amqp.connect(
        "amqp://localhost"
    );

    channel =
        await connection.createChannel();

    // Fanout exchange
    
    await channel.assertExchange(
        "ems.actions",
        "fanout",
        { durable: true }
    );

    // Dead Letter Exchange
    await channel.assertExchange(
        "ems.dlx",
        "direct",
        { durable: true }
    );

    // Dead Letter Queue
    await channel.assertQueue(
        "q.alerts.dead",
        {
            durable: true
        }
    );

    await channel.bindQueue(
        "q.alerts.dead",
        "ems.dlx",
        "q.alerts"
    );

    // Alert Queue
    await channel.assertQueue(
        "q.alerts",
        {
            durable: true,
            arguments: {
                "x-dead-letter-exchange": "ems.dlx",
                "x-dead-letter-routing-key": "q.alerts"
            }
        }
    );

    // Retraining Queue
    await channel.assertQueue(
        "q.retraining",
        {
            durable: true
        }
    );

    await channel.bindQueue(
        "q.alerts",
        "ems.actions",
        ""
    );

    await channel.bindQueue(
        "q.retraining",
        "ems.actions",
        ""
    );
    console.log("Exchange and queues created");
    console.log(
        "RabbitMQ connected ✓"
    );
}

async function publishEvent(event) {

    if (!channel) {
        throw new Error(
            "RabbitMQ not connected"
        );
    }

    const published =
        channel.publish(
            "ems.actions",
            "",
            Buffer.from(
                JSON.stringify(event)
            ),
            {
                persistent: true
            }
        );

    console.log(
        "Published:",
        event
    );

    return published;
}

async function closeRabbitMQ() {

    if (channel) {
        await channel.close();
    }

    if (connection) {
        await connection.close();
    }
}

module.exports = {
    connectRabbitMQ,
    publishEvent,
    closeRabbitMQ
};