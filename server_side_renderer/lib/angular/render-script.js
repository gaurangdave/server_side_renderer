"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('reflect-metadata');
require("zone.js/dist/zone-node");
const renderModuleFactory = require('@angular/platform-server')
    .renderModuleFactory;
const enableProdMode = require('@angular/core').enableProdMode;
function createServerSideTemplate(url) {
    enableProdMode();
    try {
        return renderModuleFactory(this.AppServerModuleNgFactory, {
            document: this.template,
            url,
        });
    }
    catch (error) {
        console.error('Error in render script', error);
    }
}
