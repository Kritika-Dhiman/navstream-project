function detectAnomaly(telemetry, result) {
    
    if (result.filterSOC < 20) {
        return {
            type: "LOW_SOC",
            severity: "HIGH"
        };
    }

    if (telemetry.temperature > 45) {
        return {
            type: "HIGH_TEMPERATURE",
            severity: "HIGH"
        };
    }

    if (
        telemetry.voltage < 380 ||
        telemetry.voltage > 450
    ) {
        return {
            type: "VOLTAGE_OUT_OF_RANGE",
            severity: "MEDIUM"
        };
    }

    return null;
}
module.exports = {
    detectAnomaly
};