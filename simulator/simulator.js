const {connectProducer,sendTelemetry}=require('../redpanda/producer');

let battery={
    voltage: 410,
    current: 20,
    temperature: 30,
    soc:80
}

function gaussianNoise(){
    let u=0, v=0;
    while(u===0) u=Math.random();
    while(v===0) v=Math.random();
    return Math.sqrt(-2.0*Math.log(u))*Math.cos(2.0*Math.PI*v)
}

let previousTime=Date.now()/1000;

async function start() {

    await connectProducer();

    setInterval(async () => {

        battery.voltage += 0.1 * gaussianNoise();
        battery.current += 0.5 * gaussianNoise();
        battery.temperature += 0.05 * gaussianNoise();
        battery.soc -= 0.01;

        const currentTime = Date.now() / 1000;

        const telemetry = {
            voltage: battery.voltage,
            current: battery.current,
            temperature: battery.temperature,

            t0: previousTime,
            t: currentTime,

            ratedCapacity: 100,
            initialSOC: 80,
            ratedEnergy: 500,
            socMin: 20,

            pvVoltage: 420,
            pvCurrent: 10
        };

        await sendTelemetry(telemetry);

        console.log("Sent:", telemetry);

        previousTime = currentTime;

    }, 1000);
}

start();

