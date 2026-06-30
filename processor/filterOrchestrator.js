
const KalmanFilter=require('./kalmanFilter');

class FilerOrchestrator{
    constructor(){
        this.filters={
            current: new KalmanFilter({
                processNoise: 0.01,
                measurementNoise: 0.1
            }),
            soc: new KalmanFilter({
                processNoise: 0.001,
                measurementNoise: 0.05
            }),
            soh: new KalmanFilter({
                processNoise:0.001,
                measurementNoise:0.02
            }),
            ir: new KalmanFilter({
                processNoise:0.0001,
                measurementNoise:0.05
            })
        };
    }
    filteredCurrent(current){
        return this.filters.current.update(current);
    }
    filteredSOC(soc){
        return this.filters.soc.update(soc)
    }
    filteredSOH(soh){
        return this.filters.soh.update(soh);
    }
    filteredIR(ir){
        return this.filteredSOH.ir.update(ir);
    }
}

module.exports=FilerOrchestrator;