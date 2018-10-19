/**
 *  Module to create server side templates for Angular Apps
 */
const minioService = require('../services/minio.service');
const vm = require('vm');
const fs = require('fs');
const Q = require('q');
const path = require('path');
const utils = require('../utils');

const getMainJS = bucket => {
    const params = {
        bucket,
        object: 'main.js',
    };

    return minioService.getFile(params);
};

const getTemplate = bucket => {

    const params = {
        bucket,
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
    const {
        bucket,
        url
    } = config;    

    try {
        
        const mainJS = await getMainJS(bucket);
        const template = await getTemplate(bucket);
        const renderer = getRenderScript();


        if(!mainJS || !template || !renderer){
            return utils.getDefaultView();  
        }

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

        vm.createContext(sandbox);

        vm.runInNewContext(mainJS, sandbox);

        sandbox.AppServerModuleNgFactory =
            sandbox.exports.AppServerModuleNgFactory;
        sandbox.LAZY_MODULE_MAP = sandbox.exports.LAZY_MODULE_MAP;

        vm.runInNewContext(renderer, sandbox);
        return await sandbox.createServerSideTemplate(url);
    } catch (e) {
        return utils.getDefaultView();
    }
};

module.exports = {
    createServerSideTemplate,
};
