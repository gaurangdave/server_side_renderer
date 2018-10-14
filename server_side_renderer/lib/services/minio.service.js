/**
 * Minio Service
 */

const minio = require('minio');
const Q = require('q');
const constants = require('../constants');
const readFileSync = require('fs').readFileSync;

let minioClientConfig = {};

if (process.env.NODE_ENV && process.env.NODE_ENV === constants.PRODUCTION) {
    // read minio client from docker secrets.
    minioClientConfig = readFileSync('/run/secrets/minio_access');
} else {
    minioClientConfig = require('../../minio.config.json');
}

const minioClient = new minio.Client(minioClientConfig);
const getFile = params =>
    new Q.Promise((resolve, reject) => {
        const { bucket, object } = params;

        let data = '';
        minioClient.getObject(bucket, object, (err, dataStream) => {
            if (err) {
                console.log(err);
                reject(err);
            }

            dataStream.setEncoding('utf8');

            dataStream.on('data', function(chunk) {
                data += chunk;
            });

            dataStream.on('end', function() {
                resolve(data);
            });

            dataStream.on('error', function(err) {
                console.log(err);
                reject(err);
            });
        });
    });

const getConfigFile = bucket =>
    getFile({
        bucket,
        object: 'config.json',
    });

module.exports = {
    getFile,
    getConfigFile,
};
