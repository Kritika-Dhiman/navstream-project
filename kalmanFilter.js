class KalmanFilter{
    constructor({
        processNoise=0.01,
        measurementNoise=0.1,
        estimate=0
    }={}){
        this.q=processNoise;
        this.r=measurementNoise;
        this.x=estimate;
        this.p=1;
    }
    update(measurement){
        this.p=this.p+this.q;
        //gain
        const k=this.p/(this.p+this.r);
        this.x=this.x+k*(measurement-this.x);
        this.p=(1-k)*this.p;
        return this.x;
    }
}

module.exports=KalmanFilter;