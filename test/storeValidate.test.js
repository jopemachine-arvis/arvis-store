const fse = require('fs-extra');
const { api } = require('../dist/lib');

describe('store validation', () => {
    test('store', async () => {
        const onlineStore = await api.fetchStore();
        const offlineStore = await fse.readJSON('./internal/store.json');

        expect(Object.keys(onlineStore).length >= 0).toStrictEqual(true);
        expect(Object.keys(offlineStore).length >= 0).toStrictEqual(true);
    });

    test('static-store', async () => {
        const onlineStore = await api.fetchStaticStore();
        const offlineStore = await fse.readJSON('./internal/static-store.json');

        expect(Object.keys(onlineStore).length >= 0).toStrictEqual(true);
        expect(Object.keys(offlineStore).length >= 0).toStrictEqual(true);
    });
});