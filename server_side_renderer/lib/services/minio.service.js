"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = require("aarnam-helper-scripts/dist");
const Q = require('q');
const readFileSync = require('fs').readFileSync;
const existsSync = require('fs').existsSync;
let minioClientConfig;
if (existsSync('/run/secrets/minio_access')) {
    minioClientConfig = JSON.parse(readFileSync('/run/secrets/minio_access'));
}
else if (existsSync('/var/openfaas/secrets/minio_access')) {
    minioClientConfig = JSON.parse(readFileSync('/var/openfaas/secrets/minio_access'));
}
else {
    minioClientConfig = require('./minio.config');
}
const minioClient = dist_1.minio.initialize(minioClientConfig);
exports.getFile = (params) => new Q.Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
    let { bucketName, fileName, dirName } = params;
    let data = '';
    if (dirName) {
        fileName = `${dirName}/${fileName}`;
    }
    if (!minioClient) {
        return reject(new Error('initialization error'));
    }
    try {
        const resp = yield minioClient.getObject({ bucketName, fileName });
        return resolve(resp.data);
    }
    catch (error) {
        return reject(error);
    }
}));
exports.getConfigFile = (bucketName) => __awaiter(this, void 0, void 0, function* () {
    const configData = (yield exports.getFile({
        bucketName,
        fileName: 'config.json',
    })) || '{}';
    return JSON.parse(configData);
});
exports.putContent = (params) => {
    return new Q.Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        let { bucketName, fileName, dirName = './', data } = params;
        if (dirName) {
            fileName = `${dirName}/${fileName}`;
        }
        if (!minioClient) {
            return reject(new Error('initialization error'));
        }
        try {
            const resp = yield minioClient.putStringObject({
                bucketName,
                fileName,
                dirName,
                data,
            });
            return resolve(resp.data);
        }
        catch (error) {
            return reject(error);
        }
    }));
};
module.exports = {
    getFile: exports.getFile,
    getConfigFile: exports.getConfigFile,
    putContent: exports.putContent,
};
