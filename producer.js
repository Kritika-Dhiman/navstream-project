const mqtt = require('mqtt');

const client =
    mqtt.connect('mqtt://localhost:1883');

client.on('connect',()=>{

    setInterval(()=>{

        const telemetry = {

            voltage: 51.2,

            current:
                10 +
                (Math.random()-0.5),

            temperature: 30,

            t0: Date.now()/1000,

            t: Date.now()/1000 + 1,

            ratedCapacity: 100,

            initialSOC: 80,

            ratedEnergy: 5000,

            socMin: 20,

            pvVoltage: 60,

            pvCurrent: 8
        };

        client.publish(
            'battery/raw',
            JSON.stringify(telemetry)
        );

    },1000);

});