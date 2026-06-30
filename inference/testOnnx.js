const {
    loadModel,
    predictAnomaly
} = require("./onnxInference");

async function test() {

    await loadModel();

    const prediction =
        await predictAnomaly({

            voltage:410,

            current:20,

            temperature:30,

            soc:80,

            filteredCurrent:20,

            powerExport:8200,

            soh:99

        });

    console.log(prediction);

}

test();