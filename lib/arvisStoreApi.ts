import got from 'got';
import parseJson from 'parse-json';
import { pluginCompilationUrl, staticStoreUrl, storeUrl, workflowCompilationUrl } from './constant';

export const fetchWorkflowCompilationTemplate = async () => {
  try {
    const resp = await got(workflowCompilationUrl);
    return (parseJson(resp.body) as any);
  } catch (err) {
    throw new Error('fetchWorkflowCompilationTemplate url not available.');
  }
};

export const fetchPluginCompilationTemplate = async () => {
  try {
    const resp = await got(pluginCompilationUrl);
    return (parseJson(resp.body) as any);
  } catch (err) {
    throw new Error('fetchPluginCompilationTemplate url not available.');
  }
};

export const fetchStore = async () => {
  try {
    const resp = await got(storeUrl);
    return (parseJson(resp.body) as any);
  } catch (err) {
    throw new Error('Store url not available or store format might be invalid.');
  }
};

export const fetchStaticStore = async () => {
  try {
    const resp = await got(staticStoreUrl);
    return (parseJson(resp.body) as any);
  } catch (err) {
    throw new Error('StaticStoreUrl url not available or store format might be invalid.');
  }
};

