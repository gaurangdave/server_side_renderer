// These are important and needed before anything else

require('reflect-metadata');
import 'zone.js/dist/zone-node';

const renderModuleFactory = require('@angular/platform-server')
    .renderModuleFactory;
const enableProdMode = require('@angular/core').enableProdMode;
// Import module map for lazy loading
// const provideModuleMap = require('@nguniversal/module-map-ngfactory-loader').provideModuleMap;
// const AppServerModuleNgFactory: any =
//     (this)['AppServerModuleNgFactory'] || {};

// const template: any = (global as any)['template'] || '';
/**
 *  Function to create server side template.
 *  @return Promise
 */
function createServerSideTemplate(url: string) {
    // Faster server renders w/ Prod mode (dev mode never needed)
    enableProdMode();
    /**
     * Global values needed in virtual machine context are:
     * AppServerModuleNgFactory (from main.js)
     * LAZY_MODULE_MAP (from main.js)
     * template (index.html)
     */

    try {
        return renderModuleFactory(this.AppServerModuleNgFactory, {
            // Our index.html
            document: this.template,
            // TODO make URL param dynamic.
            url,
            // TODO Figure this out.
            // DI so that we can get lazy-loading to work differently (since we need it to just instantly render it)
            // extraProviders: [{}]
        });        
    } catch (error) {
        console.error('Error in render script', error);
    }

}
