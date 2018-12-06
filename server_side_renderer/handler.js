'use strict';
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
const ngRenderer = __importStar(require("./lib/angular/angular.ssr"));
const querystring = require('querystring');
const dist_1 = require("aarnam-helper-scripts/dist");
const utils = require('./lib/utils');
const minio_service_1 = require("./lib/services/minio.service");
dist_1.logger.Logger.LoggingDisabled = true;
module.exports = (context, callback) => __awaiter(this, void 0, void 0, function* () {
    try {
        const queryParams = process.env.Http_Query;
        if (queryParams) {
            const params = querystring.parse(queryParams.toString());
            let { app: bucketName, url = '/' } = params;
            if (!bucketName) {
                return callback(null, utils.getDefaultView());
            }
            const configuration = yield minio_service_1.getConfigFile(bucketName);
            if (url && !url.startsWith('/')) {
                url = `/${url}`;
            }
            const html = yield ngRenderer.generateHTML({
                bucketName,
                url,
                configuration,
            });
            return callback(null, html);
        }
        else {
            return callback(null, utils.getDefaultView());
        }
    }
    catch (e) {
        return callback(null, utils.getDefaultView());
    }
});
