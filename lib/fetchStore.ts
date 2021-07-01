import got from 'got';
import parseJson from 'parse-json';

const storeUrl = 'https://raw.githubusercontent.com/jopemachine/arvis-store/master/internal/store.json';

export const fetchStore = async () => {
    try {
        const resp = await got(storeUrl);
        return (parseJson(resp.body) as any);
    } catch (err) {
        throw new Error('Store url not available or store format might be invalid.');
    }
};
