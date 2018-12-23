const angularSSR = require('../../../server_side_renderer/lib/angular/angular.ssr');

const getConfigFile = require('../../../server_side_renderer/lib/services/minio.service').getConfigFile;

describe('module sanity testing', () => {
    test('module should be defined', () => {
        expect(angularSSR).toBeDefined();
    })

    test('modules should export members', () => {
        expect(angularSSR.generateHTML).toBeDefined();
    });
});

/**
 * TODO
 * Test createServerSideTemplate method
 * 0. Create a dummy angular project for tests?
 * 1. test to validate html is returned.
 * 2. test to validate correct html for routes is returned.
 * Implement Caching and write tests for that. 
 * 
 */
describe('test server side rendering', () => {
    test('should return html', async () => {
        const configuration = await getConfigFile('theboredengineer');

        const html = await angularSSR.generateHTML({
            bucketName: 'theboredengineer',
            url: '/games/snake',
            configuration
        });

        console.log(html);
        expect(html).toBeDefined();
    });
});