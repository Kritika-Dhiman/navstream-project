const ort=require("onnxruntime-node");
const path=require("path")

let session=null;
async function loadModel() {
    if(session) return;
    const modelPath=path.join(__dirname,"../python-sidecar/models/model.onnx");
    session=await ort.InferenceSession.create(modelPath);
    console.log(session.inputNames);
    console.log(session.outputNames);
    console.log("ONX model loaded");
}

async function predictAnomaly(features) {
    if(!session) throw new Error("Model not loaded");
    const input=new Float32Array([
        features.voltage,
        features.current,
        features.temperature,
        features.soc,
        features.filteredCurrent,
        features.powerExport,
        features.soh
    ]);
    const feeds={float_input:new ort.Tensor(
        "float32",
        input,
        [1,7]
    )};
    const results = await session.run(feeds, ["label","probabilities"])
    const label = Number(results["label"].data[0]) 
    const probabilities =Array.from(results.probabilities.data);
 
    
    return {
        isAnomaly: label === 1,
        label,
        probabilities
    }
}

module.exports={loadModel,predictAnomaly};