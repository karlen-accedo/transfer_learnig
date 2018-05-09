let fs = require('fs');
var shell = require('shelljs');
const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')


module.exports = function (DATA_FOLDER, SAMPLED_DATA_FOLDER, SAMPLE_COUNT) {
    console.log('Please wait, sampleing files...');

    createSampleDirectories(SAMPLED_DATA_FOLDER, SAMPLE_COUNT);
    const directories = getDirectories(DATA_FOLDER);
// sampling in round robin way
    for (let i = 0; i < directories.length; i++) {
        fs.readdirSync(directories[i]).forEach((file, index) => {
            let subdir_id = index % SAMPLE_COUNT;
            const classLabel = directories[i].split('\\')[1];
            const rootFolder = `${SAMPLED_DATA_FOLDER}sample_${subdir_id}/${classLabel}`;
            shell.mkdir('-p', rootFolder);
            fs.copyFileSync(join(directories[i], file), `${rootFolder}/${file}`);
        });

    }

    console.log('sampleing is done !');

    function isDirectory(source) {
        return lstatSync(source).isDirectory()
    }

    function getDirectories(source) {
        return readdirSync(source).map(name => join(source, name)).filter(isDirectory)
    }

    function createSampleDirectories(root, dirCount) {
        for (let i = 0; i < dirCount; i++) {
            shell.mkdir('-p', `${root}sample_${i}`);
        }
    }
}