/**
 *  Module to create server side templates for Angular Apps
 */

import * as vm from 'vm';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from 'aarnam-helper-scripts/dist';
import { getFile, putContent } from '../services/minio.service';

const utils = require('../utils');
const crypto = require('crypto');

const _logger = new logger.Logger();
/**
 * Utility function to get absolute path of given resource on minio storage.
 * @param config
 * @param fileName
 */
const getServerResourcePath = (config: Configuration, fileName: string) => {
    const { currentVersion } = config;

    return `server/${currentVersion}/${fileName}`;
};

/**
 * Utility function to get absolute path of given resource on minio storage.
 * @param config
 * @param fileName
 */
const getBrowserResourcePath = (config: Configuration, fileName: string) => {
    const { currentVersion } = config;
    return `browser/${currentVersion}/${fileName}`;
};

/**
 * Function to read main.js from Minio storage.
 * @param config
 */
const getMainJS = (config: Configuration) => {
    const { app: bucketName, currentVersion } = config;
    const params = {
        bucketName,
        fileName: getServerResourcePath(config, 'main.js'),
    };

    return getFile(params);
};

/**
 * Function to read teamplate html from minio storage.
 * @param config
 */
const getTemplate = (config: Configuration) => {
    const { app: bucketName, currentVersion } = config;
    const params = {
        bucketName,
        fileName: getBrowserResourcePath(config, 'index.html'),
    };

    return getFile(params);
};

/**
 * Function to read render script.
 */
const getRenderScript = () => {
    // TODO Think if we need to make the render script dynamic as well.
    const renderScript = path.join(__dirname, 'render-script.js');
    return fs.readFileSync(renderScript, {
        encoding: 'utf8',
    });
};

/**
 * Function to read cached HTML if present.
 * If cached html is not present, html is generated and then cached.
 * @param params
 */
const getCachedVersion = async (params: GenerateHtmlParams) => {
    /**
     *  1. Check if cached version of the URL is present.
     *  2. If not call generateDynamicHTML() to generate the HTML
     *  3. Cache the version by making a fire and forget call.
     *  4. Return the generated version.
     */
    const { bucketName, url = '/', configuration } = params;
    const versionHash = crypto
        .createHash('md5')
        .update(url)
        .digest('hex');

    const cachedFileName = `${versionHash}.html`;
    let cachedHTML = null;
    try {
        cachedHTML = await getFile({
            bucketName,
            fileName: getServerResourcePath(configuration, cachedFileName),
        });
    } catch (error) {
        _logger.warn('Error getting cached html', error._data);
    }

    if (cachedHTML) {
        _logger.info(`Returning template for path ${url} from cache`);
        return cachedHTML;
    }

    const htmlToCache = await generateDynamicHTML(params);

    // only cache if we generated html correctly
    if (htmlToCache) {
        await putContent({
            bucketName,
            fileName: getServerResourcePath(configuration, cachedFileName),
            data: htmlToCache,
        });
    }

    return htmlToCache;
};

/**
 * Function to generate dynamic server side HTML for given app.
 * @param params
 */
const generateDynamicHTML = async (params: GenerateHtmlParams) => {
    const { url, configuration } = params;
    let template = null;
    try {
        // TODO instead of waiting for each resource fire multiple requests.
        const mainJS = await getMainJS(configuration);
        template = await getTemplate(configuration);
        const renderer = getRenderScript();

        if (!mainJS || !template || !renderer) {
            _logger.error('main js, template or renderer missing');
            return null;
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
            AppServerModuleNgFactory: {},
            LAZY_MODULE_MAP: {},
            createServerSideTemplate: (url: string) => {},
        };

        vm.createContext(sandbox);

        vm.runInNewContext(mainJS, sandbox);

        sandbox.AppServerModuleNgFactory =
            sandbox.exports.AppServerModuleNgFactory;
        sandbox.LAZY_MODULE_MAP = sandbox.exports.LAZY_MODULE_MAP;

        vm.runInNewContext(renderer, sandbox);
        return await sandbox.createServerSideTemplate(url);
    } catch (e) {
        console.log('Error in dynamic html : ', e);
        return template;
    }
};

/**
 * Function to generate HTML for Angular apps.
 * @param params
 */
export const generateHTML = async (params: GenerateHtmlParams) => {
    const { configuration } = params;
    if (!configuration) {
        _logger.error('Missing Configuration! Cannot generate content.');
        return utils.getDefaultView();
    }
    const { isCached } = configuration;

    if (isCached) {
        return (await generateDynamicHTML(params)) || utils.getDefaultView();
    } else {
        return (await generateDynamicHTML(params)) || utils.getDefaultView();
    }
};

/**
 * @typedef {Object} GenerateHtmlParams
 * @property {string} bucketName - Indicates bucket name
 * @property {string} url - Url for client app to render
 * @property {string} configuration - Client app configuration
 */
export type GenerateHtmlParams = {
    bucketName: string;
    url: string;
    configuration?: Configuration | any;
};

/**
 * @typedef {Object} GenerateHtmlParams
 * @property {string} app - Indicates the app name/bucket name
 * @property {boolean} isCached - Indicates whether app is cached or not
 * @property {string} currentVersion - Hash for current version of the app
 * @property {string} previousVersion - Hash for current version of the app
 * @property {string[]} versionHistory - Array of version history of the app
 */
export type Configuration = {
    isCached: boolean;
    app: string;
    currentVersion: string;
    previousVersion: string;
    versionHistory: string[];
};

module.exports = {
    generateHTML,
};
