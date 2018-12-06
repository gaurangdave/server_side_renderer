/**
 * Minio Service
 */

import { minio } from 'aarnam-helper-scripts/dist';
import { InitializationParams } from 'aarnam-helper-scripts/dist/lib/minio';
import { MinioHelper } from 'aarnam-helper-scripts/dist/lib/minio/MinioHelper';

const Q = require('q');
const readFileSync = require('fs').readFileSync;
const existsSync = require('fs').existsSync;

let minioClientConfig: InitializationParams;

if (existsSync('/run/secrets/minio_access')) {
    // read minio client from docker secrets.
    minioClientConfig = JSON.parse(readFileSync('/run/secrets/minio_access'));
} else if (existsSync('/var/openfaas/secrets/minio_access')) {
    minioClientConfig = JSON.parse(
        readFileSync('/var/openfaas/secrets/minio_access')
    );
} else {
    minioClientConfig = require('./minio.config');
}

const minioClient: MinioHelper | null = minio.initialize(minioClientConfig);

export const getFile = (params: GetFileParams) =>
    new Q.Promise(async (resolve: Function, reject: Function) => {
        let { bucketName, fileName, dirName } = params;

        let data = '';

        if (dirName) {
            fileName = `${dirName}/${fileName}`;
        }

        if (!minioClient) {
            return reject(new Error('initialization error'));
        }

        try {
            const resp = await minioClient.getObject({ bucketName, fileName });
            return resolve(resp.data);
        } catch (error) {
            return reject(error);
        }
    });

export const getConfigFile = async (bucketName: string) => {
    const configData =
        (await getFile({
            bucketName,
            fileName: 'config.json',
        })) || '{}';

    return JSON.parse(configData);
};

export const putContent = (params: PutContentParams) => {
    return new Q.Promise(async (resolve: Function, reject: Function) => {
        let { bucketName, fileName, dirName = './', data } = params;

        if (dirName) {
            fileName = `${dirName}/${fileName}`;
        }

        if (!minioClient) {
            return reject(new Error('initialization error'));
        }

        try {
            const resp = await minioClient.putStringObject({
                bucketName,
                fileName,
                dirName,
                data,
            });
            return resolve(resp.data);
        } catch (error) {
            return reject(error);
        }
    });
};

export type GetFileParams = {
    bucketName: string;
    fileName: string;
    dirName?: string;
};

export type PutContentParams = {
    bucketName: string;
    fileName: string;
    dirName?: string;
    data: string;
};
module.exports = {
    getFile,
    getConfigFile,
    putContent,
};
