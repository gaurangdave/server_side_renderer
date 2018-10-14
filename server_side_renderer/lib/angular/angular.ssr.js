/**
 *  Module to create server side templates for Angular Apps
 */
const minioService = require('../services/minio.service');
const vm = require('vm');
const fs = require('fs');
const Q = require('q');
const path = require('path');

const getMainJS = config => {
    /**
     *  TODO read params from config.
     */
    const params = {
        bucket: 'node-hello',
        object: 'main.js',
    };

    return minioService.getFile(params);
};

const getTemplate = config => {
    /**
     *  TODO read params from config.
     */
    const params = {
        bucket: 'node-hello',
        object: 'index.html',
    };

    return minioService.getFile(params);
};

const getRenderScript = () => {
    const renderScript = path.join(__dirname, 'render-script.js');
    return fs.readFileSync(renderScript, {
        encoding: 'utf8',
    });
};

const createServerSideTemplate = async config => {
    const mainJS = await getMainJS(config);
    const template = await getTemplate(config);
    const renderer = getRenderScript();

    /**
     * 1. Run mainJS and map required objects to sandbox.
     * 2. Map template to sandbox.
     * 3. Run the renderer script in sandbox context.
     */
    const sandbox = {
        require: require,
        console: console,
        exports,
        template,
    };

    try {
        vm.createContext(sandbox);

        vm.runInNewContext(mainJS, sandbox);

        sandbox.AppServerModuleNgFactory =
            sandbox.exports.AppServerModuleNgFactory;
        sandbox.LAZY_MODULE_MAP = sandbox.exports.LAZY_MODULE_MAP;

        vm.runInNewContext(renderer, sandbox);
        return await sandbox.createServerSideTemplate();
    } catch (e) {
        console.error('Error : ', e);
        throw e;
    }
};

module.exports = {
    createServerSideTemplate,
};
