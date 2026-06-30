console.log("1");
const fs = require("fs");
const path = require("path");
console.log("2");
const batteryCalculator = require("../processor/batteryCalculator");
const { detectAnomaly } = require("../processor/anomalyDetector");

const file = path.join(__dirname, "training_data.csv");

// CSV Header
fs.writeFileSync(
    file,
    "voltage,current,temperature,soc,filteredCurrent,powerExport,soh,anomaly\n"
);

let battery = {
    voltage: 410,
    current: 20,
    temperature: 30,
    soc: 80
};

function gaussianNoise() {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

let previousTime = Date.now() / 1000;
let anomalyCount = 0;
let normalCount = 0;

try {
    for (let i = 0; i < 1000; i++) {

        // Normal operating noise
        battery.voltage += 0.1 * gaussianNoise();
        battery.current += 0.5 * gaussianNoise();
        battery.temperature += 0.05 * gaussianNoise();
        battery.soc -= 0.02;

        // Inject faults occasionally
        if (i % 200 === 50)  battery.temperature = 48;
        if (i % 200 === 100) battery.voltage = 370;
        if (i % 200 === 150) battery.soc = 15;

        // Bring back to normal
        if (i % 200 === 160) {
            battery.temperature = 30;
            battery.voltage = 410;
            battery.soc = 80;
        }

        const currentTime = previousTime + 1;

        const telemetry = {
            voltage:      battery.voltage,
            current:      battery.current,
            temperature:  battery.temperature,
            t0:           previousTime,
            t:            currentTime,
            ratedCapacity: 100,
            initialSOC:   battery.soc,
            ratedEnergy:  500,
            socMin:       20,
            pvVoltage:    420,
            pvCurrent:    10
        };

        const result = batteryCalculator.calculate(telemetry);
        const anomaly = detectAnomaly(telemetry, result);

        if (anomaly) anomalyCount++;
        else normalCount++;

        // Use correct field names from batteryCalculator return object
        const filterSOC       = result.filterSOC       ?? 0;
        const filteredCurrent = result.filteredCurrent ?? 0;
        const powerExport     = result.powerExport     ?? 0;
        const filterSOH       = result.filterSOH       ?? 0;

        const row = [
            telemetry.voltage.toFixed(2),
            telemetry.current.toFixed(2),
            telemetry.temperature.toFixed(2),
            Number(filterSOC).toFixed(2),
            Number(filteredCurrent).toFixed(2),
            Number(powerExport).toFixed(2),
            Number(filterSOH).toFixed(2),
            anomaly ? 1 : 0
        ].join(",");

        fs.appendFileSync(file, row + "\n");
        previousTime = currentTime;
    }

    console.log("=================================");
    console.log("Dataset generated successfully!");
    console.log("File:", file);
    console.log("Total Samples :", anomalyCount + normalCount);
    console.log("Normal Samples:", normalCount);
    console.log("Anomaly Samples:", anomalyCount);
    console.log("=================================");

} catch (err) {
    console.error("Script failed at runtime:");
    console.error(err.message);
    console.error(err.stack);
}