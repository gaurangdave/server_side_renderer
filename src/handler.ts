'use strict';

import * as ngRenderer from './lib/angular/angular.ssr';
const querystring = require('querystring');
import { logger } from 'aarnam-helper-scripts/dist';
const utils = require('./lib/utils');
import { getConfigFile } from './lib/services/minio.service';
logger.Logger.LoggingDisabled = true;
/**
 * Main SSR handler function
 * @param {*} context
 * @param {*} callback
 */
module.exports = async (context: any, callback: Function) => {
    /**
     * 1. Read config from the bucket based on url/param
     * 2. Based on the `framework` in the config calls the corresponding engine.
     */

    try {
        const queryParams = process.env.Http_Query;
        if (queryParams) {
            const params = querystring.parse(queryParams.toString());
            let { app: bucketName, url = '/' } = params;

            // return default view if bucketName is not passd
            if (!bucketName) {
                return callback(null, utils.getDefaultView());
            }

            //Read the config file from minio here.
            const configuration = await getConfigFile(bucketName);

            // pre-fix URL for single page application
            if (url && !url.startsWith('/')) {
                url = `/${url}`;
            }

            // TODO change this to read based on config.
            const html = await ngRenderer.generateHTML({
                bucketName,
                url,
                configuration,
            });

            return callback(null, html);
        } else {
            // return default view.
            return callback(null, utils.getDefaultView());
        }
    } catch (e) {
        // TODO log errors.
        // return default view in case of errors.
        return callback(null, utils.getDefaultView());
    }
};
