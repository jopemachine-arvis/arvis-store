import { fetchStaticStore, fetchStore } from './arvisStoreApi';

export const searchWorkflow = async (input: string) => {
  const store = await fetchStore();
  const staticStore = await fetchStaticStore();

  return Object.keys(store.workflow).filter((extension) => {
    const [creator, name] = extension.split('.');
    return name.includes(input);
  }).map((extension) => {
    const [creator, name] = extension.split('.');
    return {
      name,
      creator,
      type: 'workflow',
      ...store['workflows'][extension],
      ...staticStore['workflows'][extension]
    };
  });
};

export const searchPlugin = async (input: string) => {
  const store = await fetchStore();
  const staticStore = await fetchStaticStore();

  return Object.keys(store.plugin).filter((extension) => {
    const [creator, name] = extension.split('.');
    return name.includes(input);
  }).map((extension) => {
    const [creator, name] = extension.split('.');
    return {
      name,
      creator,
      type: 'plugin',
      ...store['plugins'][extension],
      ...staticStore['plugins'][extension]
    };
  });
};

export const searchExtension = async (input: string) => {
  return [
    ...await searchWorkflow(input),
    ...await searchPlugin(input),
  ];
};