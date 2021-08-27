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

export const setGithubApiKey = (apiKey: string): void => {
  config.set('GH_API_KEY', apiKey);
};

export const getGithubApiKey = (): string => {
  if (!config.has('GH_API_KEY')) {
    throw new Error('GH_API_KEY key is not set. Please set github api key first');
  }
  return config.get('GH_API_KEY') as string;
};