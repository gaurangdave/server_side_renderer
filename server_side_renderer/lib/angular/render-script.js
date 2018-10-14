// These are important and needed before anything else
require('zone.js/dist/zone-node');
require('reflect-metadata');
const renderModuleFactory = require('@angular/platform-server')
    .renderModuleFactory;
const enableProdMode = require('@angular/core').enableProdMode;
// Import module map for lazy loading
// const provideModuleMap = require('@nguniversal/module-map-ngfactory-loader').provideModuleMap;

/**
 *  Function to create server side template.
 *  @return Promise
 */
function createServerSideTemplate() {
    // Faster server renders w/ Prod mode (dev mode never needed)
    enableProdMode();
    /**
     * Global values needed in virtual machine context are:
     * AppServerModuleNgFactory (from main.js)
     * LAZY_MODULE_MAP (from main.js)
     * template (index.html)
     */
    return renderModuleFactory(AppServerModuleNgFactory, {
        // Our index.html
        document: template,
        // TODO make URL param dynamic.
        url: '/',
        // TODO Figure this out.
        // DI so that we can get lazy-loading to work differently (since we need it to just instantly render it)
        // extraProviders: [{}]
    });
}
