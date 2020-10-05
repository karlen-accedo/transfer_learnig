let { exec, spawn } = require('child_process');
const STD_BUFFER_SIZE = 1024 * 1024 * 1024; // 1gb

predictFromMultipeCNN('24-3-2018', 'cnn', 5, (result) => {
    console.log(result)
});

function predictFromMultipeCNN(mainFolder, cnnName, cnnCount, callback) {
    let generalSeparator = '\r\n';
    let classSeparator = '-';
   
    /*
    python label_image.py \
    --graph=./tmp/output_graph.pb --labels=./tmp/output_labels.txt \
    --input_layer=Placeholder \
    --output_layer=final_result \
    --image=./flower_photos/daisy/21652746_cc379e0eea_m.jpg
    */
    const expectedOutputs = [];

    for (let i = 0; i < cnnCount; i++) {
        const command = buildCommand('python label_image.py', {
            '--graph': `./tmp/${mainFolder}/${cnnName}_${i}/output_graph.pb`,
            '--labels': `./tmp/${mainFolder}/${cnnName}_${i}/output_labels.txt`,
            '--input_layer': 'Placeholder',
            '--output_layer': `final_result_${i}`,
            '--image': process.env.IMAGE || './high-level-test/test2.jpeg'
        });

        execute(command, (error, stdout) => {
            if (!error) {
                let splitedOutPuts = stdout.split(generalSeparator);
                const result = {};
                splitedOutPuts.forEach((item) => {
                    let splitedSingleClass = item.split(classSeparator);
                    result[splitedSingleClass[0]] = parseFloat(splitedSingleClass[1]);
                });
                expectedOutputs.push(result);
                if (expectedOutputs.length === cnnCount && callback) {
                    callback(integrateOutputs(expectedOutputs))
                }
            } else {
                console.log(error);
            }
        })
    }
}

function integrateOutputs(outputs) {
    const finalOutput = {};
    for (let i = 0; i < outputs.length; i++) {
        let majority = '';
        let majorityVal = 0;
        for (let key in outputs[i]) {
            if (outputs[i][key] > majorityVal) {
                majority = key;
                majorityVal = outputs[i][key];
            }
        }
        if (!finalOutput[majority]) {
            finalOutput[majority] = 0;
        }
        finalOutput[majority]++
    }
    finalOutput.total = {
        count: 5
    };
    return finalOutput;
}

function buildCommand(pre, body, post) {
    let cmd = pre;
    for (let i in body) {
        cmd += ' ' + i + '=' + body[i];
    }

    post && (cmd += ' ' + post);

    return cmd;
}

function execute(command, callback) {
    exec(command, { maxBuffer: STD_BUFFER_SIZE }, function (error, stdout, stderr) {
        callback(error, stdout);
    });
}

