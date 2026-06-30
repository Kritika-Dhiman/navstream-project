const mqtt = require('mqtt');

const client =
    mqtt.connect('mqtt://localhost:1883');

client.on('connect',()=>{

    client.subscribe(
        'battery/processed'
    );

});

client.on('message',(topic,msg)=>{

    console.log(
        JSON.parse(
            msg.toString()
        )
    );

});