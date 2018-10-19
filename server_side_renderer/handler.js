'use strict';

const angularSSR = require('./lib/angular/angular.ssr');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
const utils = require('./lib/utils');


/**
 * Main SSR handler function
 * @param {*} context
 * @param {*} callback
 */
module.exports = async (context, callback) => {
    /**
     * 1. Read config from the bucket based on url/param
     * 2. Based on the `framework` in the config calls the corresponding engine.
     */

    try {
        const app = process.env.Http_Query;
        if(app){
            const params = querystring.parse(app.toString());
            const {
                app:bucket,
                url = "/"
            } = params;
            
            if(!bucket) {
                return callback(null, utils.getDefaultView());
            }

            const html = await angularSSR.createServerSideTemplate({bucket, url});
            return callback(null, html);
        }
        else {
            return callback(null, utils.getDefaultView());
        }

    } catch (e) {
        // TODO log errors. 
        return callback(null, utils.getDefaultView());
    }
};