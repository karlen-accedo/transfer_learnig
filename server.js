let { exec, spawn } = require('child_process');
let dataSampler = require('./sample');
/******* START DATA SAMPLEING ***********/
const DATA_FOLDER = './samples/';
const SAMPLED_DATA_FOLDER = './tmp/data/';
const SAMPLE_COUNT = 5;

dataSampler(DATA_FOLDER, SAMPLED_DATA_FOLDER, SAMPLE_COUNT);

/*********** END DATA SAMLING ***********/
const STD_BUFFER_SIZE = 1024 * 1024 * 1024; // 1gb

const tarinConfig = {
    'image_dir': SAMPLED_DATA_FOLDER,
    'how_many_training_steps': 500,
    'testing_percentage': 10,
    'validation_percentage': 10,
    'train_batch_size': 100,
    'final_tensor_name': 'final_result',
    //'rand_selection_percent': 5,
    'trainer_file_path': 'train.py'
};


trainCnn(5, tarinConfig, (res) => {
    console.log('');
    console.log('');
    console.info("--------- classification successful !!!! -----------");
    console.info(`--------- results are in  ${res.out}  -----------`);
    console.info(`--------- run    tensorboard --logdir ${res.root}   to see the visual results (run it in anaconda python shell if u are using python from anaconda env.) -----------`);

    process.exit(0);
});

/**
 *
 output_labels                           the output labels path
 summaries_dir                           the summaries directory
 output_graph                            the output graph path
 intermediate_output_graphs_dir
 how_many_training_steps                 by default this is set to 200, but for high accuracy it recommended to be at least 2000
 testing_percentage                      percent of images that will be used for testing
 validation_percentage                   percent of images that will be used for validating
 train_batch_size                        image count that in every iteration is used
 bottleneck_dir                          bottlenecks are feature vectors of images, and there is no to keep separate bottlenecks for each tarining steps
 final_tensor_name                       final tensor name that will be used for predicting
 rand_selection_percent                  images are randomly selected according to this percent.
 *
 * @param numberOfCNNS
 * @param config
 * @param callback
 */
function trainCnn(numberOfCNNS = 1, config, callback) {
    let trainingProgress = {};
    let isDitributedTrainFnished = () => {
        let finihedProcesses = 0;
        for (let i in trainingProgress) {
            if (trainingProgress[i]) {
                finihedProcesses++;
            }
        }
        return finihedProcesses === numberOfCNNS;
    };
    const current = new Date();
    const datePrefix = `${current.getDate()}-${current.getMonth()}-${current.getFullYear()}`;
    const root = './tmp';
    for (let i = 0; i < numberOfCNNS; i++) {
        const innerPath = `${root}/${datePrefix}/${'cnn_' + i}`;
        let command = 'python';

        let params = [config['trainer_file_path']];
        params = params.concat(buildSpawnCommand({
            '--image_dir': `${config['image_dir']}sample_${i}`,
            '--output_labels': `${innerPath}/output_labels.txt`,
            '--summaries_dir': `${innerPath}/retrain_logs`,
            '--output_graph': `${innerPath}/output_graph.pb`,
            '--intermediate_output_graphs_dir': `${innerPath}/intermediate_graph/`,
            '--how_many_training_steps': config['how_many_training_steps'] || 4,
            '--testing_percentage': config['testing_percentage'] || 10,
            '--validation_percentage': config['validation_percentage'] || 10,
            '--train_batch_size': config['train_batch_size'] || 100,
            '--bottleneck_dir': `${innerPath}/bottleneck`,
            '--final_tensor_name': `${config['final_tensor_name'] || 'final_result'}_${i}`
        }));
        console.log('');
        console.log(`---------- started training classifier ${i} with command line -----------`);
        console.log(command);
        console.log(params);

        const python = spawn(command, params);
        python.stdout.on('data', (data) => {
        });

        python.stderr.on('data', (data) => {
            console.log(`------------ classifier ${i} ------------`);
            console.log(`${data}`);
        });

        python.on('close', (code) => {
            trainingProgress[i] = true;
            console.log(`------------- classifier ${i} ready and located in  ${innerPath}   ------------`);
            if (isDitributedTrainFnished() && callback && typeof callback === 'function') {
                callback({ out: `./tmp/${datePrefix}/`, code, root });
            }
            console.log(`child process ${i} exited with code ${code}`);
        });
    }
}

function buildCommand(pre, body, post) {
    let cmd = pre;
    for (let i in body) {
        cmd += ' ' + i + '=' + body[i];
    }

    post && (cmd += ' ' + post);

    return cmd;
}

function buildSpawnCommand(body) {
    const params = [];
    for (let i in body) {
        params.push(i + '=' + body[i])
    }

    return params;
}

function execute(command, callback) {
    exec(command, { maxBuffer: STD_BUFFER_SIZE }, function (error, stdout, stderr) {
        callback(error, stdout);
    });
}