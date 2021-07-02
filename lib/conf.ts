import Conf from 'conf';

const schema = {
  GH_API_KEY: {
    type: 'string',
  },
} as const;

const config = new Conf({
  schema,
  clearInvalidConfig: true,
  configName: 'arvis-store',
});

export const setGithubApiKey = (apiKey: string) => {
  config.set('GH_API_KEY', apiKey);
};

export const getGithubApiKey = () => {
  if (!config.has('GH_API_KEY')) {
    throw new Error('GH_API_KEY key not set. Please set github api key first');
  }
  return config.get('GH_API_KEY') as string;
};