'use strict';

const angularSSR = require('./lib/angular/angular.ssr');
const querystring = require('querystring');

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

    // try {
    //     const html = await angularSSR.createServerSideTemplate();
    //     callback(html);
    // } catch (e) {
    //     // TODO handle errors gracefully
    //     callback(e);
    // }

    const app = process.env.Http_Query;
    // const url = process.env.Http_Query.url || 'n/a';
    const params = querystring.parse(app.toString());
    callback(undefined, params.app + ":" + process.version);
};