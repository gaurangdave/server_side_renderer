"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('reflect-metadata');
require("zone.js/dist/zone-node");
const renderModuleFactory = require('@angular/platform-server')
    .renderModuleFactory;
const enableProdMode = require('@angular/core').enableProdMode;
const provideModuleMap = require('@nguniversal/module-map-ngfactory-loader').provideModuleMap;
function createServerSideTemplate(url) {
    enableProdMode();
    try {
        const html = renderModuleFactory(this.AppServerModuleNgFactory, {
            document: this.template,
            url,
            extraProviders: provideModuleMap(this.LAZY_MODULE_MAP)
        });
        return html;
    }
    catch (error) {
        console.error('Error in render script', error);
    }
}
