const mqtt= require('mqtt')
const {calculate}=require('./batteryCalculator')

const client=mqtt.connect('mqtt://localhost:1883')

client.on('connect', () => {

    console.log('MQTT Connected');

    client.subscribe('battery/raw', (err) => {
        if(err){
            console.error(err);
        }
        else{
            console.log('Subscribed to battery/raw');
        }
    });

});

client.on('message',(topic,message)=>{
    if(topic!=='battery/raw'){
        return;
    }
    try{
        const telemetry=JSON.parse(message.toString());
        const result =calculate(telemetry);

        console.log('Processed:', result);

        client.publish(
            'battery/processed',
            JSON.stringify(result)
        );

    }
    catch(err){
        console.error('Processing error:', err)
    }
});