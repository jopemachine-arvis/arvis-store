import got from 'got';
import parseJson from 'parse-json';
import {
  extensionIconUrl,
  pluginCompilationUrl,
  staticStoreUrl,
  storeUrl,
  workflowCompilationUrl,
} from './constant';

export const fetchWorkflowCompilationTemplate = async (): Promise<string> => {
  try {
    const resp = await got(workflowCompilationUrl);
    return resp.body as any;
  } catch (err) {
    throw new Error('fetchWorkflowCompilationTemplate url not available.');
  }
};

export const fetchPluginCompilationTemplate = async (): Promise<string> => {
  try {
    const resp = await got(pluginCompilationUrl);
    return resp.body as any;
  } catch (err) {
    throw new Error('fetchPluginCompilationTemplate url not available.');
  }
};

export const fetchStore = async (): Promise<any> => {
  try {
    const resp = await got(storeUrl);
    return (parseJson(resp.body) as any);
  } catch (err) {
    throw new Error('Store url not available or store format might be invalid.');
  }
};

export const fetchStaticStore = async (): Promise<any> => {
  try {
    const resp = await got(staticStoreUrl);
    return (parseJson(resp.body) as any);
  } catch (err) {
    throw new Error('StaticStoreUrl url not available or store format might be invalid.');
  }
};

export const fetchExtensionIcon = async (type: 'workflow' | 'plugin', bundleId: string): Promise<any> => {
  try {
    const resp = await got(`${extensionIconUrl}/${type}/${bundleId}.png`);
    return (resp.body) as any;
  } catch (err) {
    throw new Error('Extension icon url not available');
  }
};

