"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vm = __importStar(require("vm"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dist_1 = require("aarnam-helper-scripts/dist");
const minio_service_1 = require("../services/minio.service");
const utils = require('../utils');
const crypto = require('crypto');
const _logger = new dist_1.logger.Logger();
const getServerResourcePath = (config, fileName) => {
    const { currentVersion } = config;
    return `server/${currentVersion}/${fileName}`;
};
const getBrowserResourcePath = (config, fileName) => {
    const { currentVersion } = config;
    return `browser/${currentVersion}/${fileName}`;
};
const getMainJS = (config) => {
    const { app: bucketName, currentVersion } = config;
    const params = {
        bucketName,
        fileName: getServerResourcePath(config, 'main.js'),
    };
    return minio_service_1.getFile(params);
};
const getTemplate = (config) => {
    const { app: bucketName, currentVersion } = config;
    const params = {
        bucketName,
        fileName: getBrowserResourcePath(config, 'index.html'),
    };
    return minio_service_1.getFile(params);
};
const getRenderScript = () => {
    const renderScript = path.join(__dirname, 'render-script.js');
    return fs.readFileSync(renderScript, {
        encoding: 'utf8',
    });
};
const getCachedVersion = (params) => __awaiter(this, void 0, void 0, function* () {
    const { bucketName, url = '/', configuration } = params;
    const versionHash = crypto
        .createHash('md5')
        .update(url)
        .digest('hex');
    const cachedFileName = `${versionHash}.html`;
    let cachedHTML = null;
    try {
        cachedHTML = yield minio_service_1.getFile({
            bucketName,
            fileName: getServerResourcePath(configuration, cachedFileName),
        });
    }
    catch (error) {
        _logger.warn('Error getting cached html', error._data);
    }
    if (cachedHTML) {
        _logger.info(`Returning template for path ${url} from cache`);
        return cachedHTML;
    }
    const htmlToCache = yield generateDynamicHTML(params);
    if (htmlToCache) {
        yield minio_service_1.putContent({
            bucketName,
            fileName: getServerResourcePath(configuration, cachedFileName),
            data: htmlToCache,
        });
    }
    return htmlToCache;
});
const generateDynamicHTML = (params) => __awaiter(this, void 0, void 0, function* () {
    const { url, configuration } = params;
    let template = null;
    try {
        const mainJS = yield getMainJS(configuration);
        template = yield getTemplate(configuration);
        const renderer = getRenderScript();
        if (!mainJS || !template || !renderer) {
            _logger.error('main js, template or renderer missing');
            return null;
        }
        const sandbox = {
            require: require,
            console: console,
            exports,
            template,
            AppServerModuleNgFactory: {},
            LAZY_MODULE_MAP: {},
            createServerSideTemplate: (url) => { },
        };
        vm.createContext(sandbox);
        vm.runInNewContext(mainJS, sandbox);
        sandbox.AppServerModuleNgFactory =
            sandbox.exports.AppServerModuleNgFactory;
        sandbox.LAZY_MODULE_MAP = sandbox.exports.LAZY_MODULE_MAP;
        vm.runInNewContext(renderer, sandbox);
        return yield sandbox.createServerSideTemplate(url);
    }
    catch (e) {
        console.log('Error in dynamic html : ', e);
        return template;
    }
});
exports.generateHTML = (params) => __awaiter(this, void 0, void 0, function* () {
    const { configuration } = params;
    if (!configuration) {
        _logger.error('Missing Configuration! Cannot generate content.');
        return utils.getDefaultView();
    }
    const { isCached } = configuration;
    if (isCached) {
        return (yield generateDynamicHTML(params)) || utils.getDefaultView();
    }
    else {
        return (yield generateDynamicHTML(params)) || utils.getDefaultView();
    }
});
module.exports = {
    generateHTML: exports.generateHTML,
};
