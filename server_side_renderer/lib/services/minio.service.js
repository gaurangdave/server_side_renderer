/**
 * Minio Service
 */

const minio = require('minio');
const Q = require('q');
const constants = require('../constants');
const readFileSync = require('fs').readFileSync;
const existsSync = require('fs').existsSync;

let minioClientConfig = {};

if(existsSync('/run/secrets/minio_access')){
    // read minio client from docker secrets.
    minioClientConfig = JSON.parse(readFileSync('/run/secrets/minio_access'));
} 
else if(existsSync('/var/openfaas/secrets/minio_access')){
    minioClientConfig = JSON.parse(readFileSync('/var/openfaas/secrets/minio_access'));
}
else {
    minioClientConfig = require('../../minio.config.json');
}


const minioClient = new minio.Client(minioClientConfig);

const doesBucketExists = (bucket) => {
    return new Q.Promise((resolve, reject) => {
        minioClient.bucketExists(bucket, function(err, exists) {
            if (err) {            
              return reject(err);
            }

            return resolve(exists);
          })
    });
};


const getFile = params =>
    new Q.Promise(async (resolve, reject) => {
        const { bucket, object } = params;

        let data = '';

        const bucketExists = await doesBucketExists(bucket);

        if(!bucketExists) {
            return reject(new Error(`Bucket ${bucket} does not exists`));
        }
        
        minioClient.getObject(bucket, object, (err, dataStream) => {
            if (err) {
                return reject(err);
            }

            dataStream.setEncoding('utf8');

            dataStream.on('data', function(chunk) {
                data += chunk;
            });

            dataStream.on('end', function() {
                return resolve(data);
            });

            dataStream.on('error', function(err) {
                return reject(err);
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
