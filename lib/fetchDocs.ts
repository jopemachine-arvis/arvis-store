import got from 'got';
import parseJson from 'parse-json';

const workflowCompilationUrl = 'https://raw.githubusercontent.com/jopemachine/arvis-store/master/template/workflow-template.json';
const pluginCompilationUrl = 'https://raw.githubusercontent.com/jopemachine/arvis-store/master/template/plugin-template.json';

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
  
