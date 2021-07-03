import _ from 'lodash';
import { fetchStaticStore, fetchStore } from './arvisStoreApi';

export const searchWorkflow = async (input: string, options?: { order?: string }) => {
  const store = await fetchStore();
  const staticStore = await fetchStaticStore();

  const items = Object.keys(store.workflows).filter((extension) => {
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

  if (options && options.order) {
    return _.sortBy(items, options.order).reverse();
  }

  return items;
};

export const searchPlugin = async (input: string, options?: { order?: string }) => {
  const store = await fetchStore();
  const staticStore = await fetchStaticStore();

  const items = Object.keys(store.plugins).filter((extension) => {
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

  if (options && options.order) {
    return _.sortBy(items, options.order).reverse();
  }

  return items;
};

export const searchExtension = async (input: string, options?: { order?: string }) => {
  const extensions = [
    ...await searchWorkflow(input),
    ...await searchPlugin(input),
  ];

  if (options && options.order) {
    return _.sortBy(extensions, options.order).reverse();
  }

  return extensions;
};

export const searchMostTotalDownload = async () => {
  return await searchExtension('', { order: 'dt' });
};

export const searchMostWeeklyDownload = async () => {
  return await searchExtension('', { order: 'dw' });
};