const KalmanFilter=require('./kalmanFilter');
const FilerOrchestrator=require('./filterOrchestrator');
const { or } = require('mathjs');

const orchestrator=new FilerOrchestrator();

let totalCapacity=0;
let totalConsumedEnergy=0;
let totalCAh=0;
let totalDAh=0;
let totalDAhDt=0;

function getOpenVoltage(voltage,current){
    return (current<=0)?voltage:0;
}
function getLoadVoltage(voltage,current){
    return (current>0)?voltage:0;
}
function getCurrentExport(current){
    return (current>=0)?current:0;
}
function getCurrentDraw(current){
    return (current<0)?current:0;

}
function getPowerDraw(openVoltage,currentDraw){
    if(!openVoltage || !currentDraw){
        return 0;
    }
    return openVoltage*currentDraw;
}

function getPowerExport(loadVoltage,currentExport){
    if(loadVoltage==0 || currentExport==0){
        return 0;
    }
    return loadVoltage*currentExport;
}

function getCurrentCapacity(current,t0,t){
    const dt = (t - t0) / 3600; 
    totalCapacity += current * dt;
    return totalCapacity;
}

function getSOC(initialSOC,currentCapacity,ratedCapacity){
    return initialSOC+(currentCapacity/ratedCapacity)*100;
}

function getInternalResistance(openVoltage,loadVoltage,currentExport){
    if (!openVoltage || !loadVoltage || !currentExport) return null;
    return (openVoltage-loadVoltage)/currentExport;
}

function getSOH(currentCapacity,ratedCapacity){
    return (currentCapacity/ratedCapacity)*100;
}


function getConsumedEnergy(powerDraw,t0,t){
    const dt=(t-t0)/3600;
    totalConsumedEnergy+=(powerDraw*dt);
    return totalConsumedEnergy;
}

function getErem(ratedEnergy,stateOfCharge,socMin){
    return ratedEnergy*(stateOfCharge-socMin);
}

function getCAh(currentDraw,t0,t){
    const dt=(t-t0)/3600;
    if(currentDraw) totalCAh+=(currentDraw*dt);
    return totalCAh;
}

function getDAh(currentExport,t0,t){
    const dt=(t-t0)/3600;
    if(currentExport) totalDAh+=(currentExport*dt);
    return totalDAh;
}

function getCycleCount(currentExport,t0,t,ratedCapacity){
    const dt=(t-t0)/3600;
    if(currentExport) totalDAhDt+=(totalDAh*dt);
    return totalDAhDt/ratedCapacity;
}

function getGridExportPower(openVoltage,currentDraw){
    if(!openVoltage || !currentDraw) return 0;
    return openVoltage*currentDraw;
}

function getLoadPowerDraw(powerExport,gridExportPower){
    return powerExport-gridExportPower;
}

const stats={};
function updateStats(key,value){
    if(value==null || value==undefined) return;
    if(!stats[key]){
        stats[key]={sum: 0, count: 0, min: Infinity, max: -Infinity};
    }
    stats[key].sum +=value;
    stats[key].count +=1;
    stats[key].min =Math.min(stats[key].min,value);
    stats[key].max =Math.max(stats[key].max,value);
}

function getStats(key){
    if(!stats[key]) return null;
    const {sum,count,min,max}=stats[key];
    return {avg: sum/count,min,max};
}

function calculate(data){
    
    const{
        voltage,
        current,
        temperature,
        t0,
        t,
        ratedCapacity,
        initialSOC,
        ratedEnergy,
        socMin,
        pvVoltage,
        pvCurrent
    }=data;
    const filteredCurrent=orchestrator.filteredCurrent(current);

    const openVoltage=getOpenVoltage(voltage,current);
    const loadVoltage=getLoadVoltage(voltage,current);
    const currentExport=getCurrentExport(filteredCurrent);
    const currentDraw=getCurrentDraw(filteredCurrent);
    const powerDraw=getPowerDraw(openVoltage,currentDraw);
    const powerExport=getPowerExport(loadVoltage,currentExport);
    const currentCapacity=getCurrentCapacity(filteredCurrent,t0,t);
    const stateOfCharge=getSOC(initialSOC,currentCapacity,ratedCapacity);
    const filterSOC=orchestrator.filteredSOC(stateOfCharge);
    const depthOfDischarge=1-stateOfCharge;
    const internalResistance=getInternalResistance(openVoltage,loadVoltage,currentExport);
    const filterIR=internalResistance===null?null:orchestrator.filteredIR(internalResistance);
    const stateOfHealth=getSOH(currentCapacity,ratedCapacity);
    const filterSOH=orchestrator.filteredSOH(stateOfHealth);
    const consumedEnergy=getConsumedEnergy(powerDraw,t0,t);
    const remainingEnergy=getErem(ratedEnergy,stateOfCharge,socMin);
    const chargedAmpHour=getCAh(currentDraw,t0,t);
    const dischargedAmpHour=getDAh(currentExport,t0,t);
    const cycleCount=getCycleCount(currentExport,t0,t,ratedCapacity);
    const gridExportPower=getGridExportPower(openVoltage,currentDraw);
    const loadPowerDraw=getLoadPowerDraw(powerExport,gridExportPower);
    const solarPvPower=pvVoltage-voltage;

    const computed = {
        filteredCurrent,openVoltage, loadVoltage, currentExport, currentDraw,
        temperature, powerDraw, powerExport, currentCapacity,
        stateOfCharge,filterSOC, depthOfDischarge, internalResistance,filterIR,
        stateOfHealth,filterSOH, consumedEnergy, remainingEnergy,
        chargedAmpHour, dischargedAmpHour, cycleCount,
        gridExportPower, loadPowerDraw, solarPvPower
    };
    Object.entries(computed).forEach(([key, value]) => updateStats(key, value));

    return{
        filteredCurrent,
        openVoltage,
        loadVoltage,
        currentExport,
        currentDraw,
        powerDraw,
        powerExport,
        currentCapacity,
        stateOfCharge,
        filterSOC,
        depthOfDischarge,
        internalResistance,
        filterIR,
        stateOfHealth,
        filterSOH,
        consumedEnergy,
        remainingEnergy,
        chargedAmpHour,
        dischargedAmpHour,
        cycleCount,
        gridExportPower,
        loadPowerDraw,
        solarPvPower
    };
}

module.exports={
    calculate, getStats
};