const {calculate, getStats} = require('./batteryCalculator')

const telemetry={
    voltage: 51.2,
    current: -12.5,
    temperature: 32,
    t0: 0,
    t: 3600,
    ratedCapacity: 100,  
    initialSOC: 80,      
    ratedEnergy: 5120,   
    socMin: 20,          
    pvVoltage: 55.0,
    pvCurrent: 8.0
}

console.log(calculate(telemetry))
console.log(getStats('stateOfCharge'));