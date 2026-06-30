const amqp=require('amqplib');

async function start() {
    const connection=await amqp.connect(
        "amqp://localhost"
    );

    const channel=await connection.createChannel();
    await channel.assertExchange("ems.actions", "fanout", {
        durable: true
    });
    
    await channel.assertExchange("ems.dlx", "direct", {
        durable: true
    });
    
    await channel.assertQueue("q.alerts.dead", {
        durable: true
    });
    
    await channel.bindQueue(
        "q.alerts.dead",
        "ems.dlx",
        "q.alerts"
    );
    
    await channel.assertQueue("q.alerts", {
        durable: true,
        arguments: {
            "x-dead-letter-exchange": "ems.dlx",
            "x-dead-letter-routing-key": "q.alerts"
        }
    });
    
    await channel.bindQueue(
        "q.alerts",
        "ems.actions",
        ""
    );

    channel.prefetch(1);

    console.log("Waiting for messages....");
    channel.consume(
        "q.alerts",
        (msg)=>{
            if(!msg) return;
            try{
                const alert=JSON.parse(msg.content.toString());
                console.log("Aler Received");
                console.log(alert);
               
                channel.ack(msg);
            }catch(err){
                console.error("Failed to process alert",err.message)
                channel.nack(msg,false,false);
            }
            
        },
        {
            noAck:false
        }
    );
}

start().catch(console.error);