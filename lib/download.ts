import fse from 'fs-extra';
import { fetchExtensionBinary } from './arvisStoreApi';

const base64ToBuffer = (b64string: string) => {
  let buffer;

  if (typeof Buffer.from === 'function') {
    // Node 5.10+
    buffer = Buffer.from(b64string, 'base64');
  } else {
    // older Node versions
    buffer = new Buffer(b64string, 'base64');
  }

  return buffer;
};

const downloadExtension = async function (type: 'workflow' | 'plugin', bundleId: string) {
  try {
    const blob = await fetchExtensionBinary(type, bundleId);
    await fse.writeFile(`${bundleId}.arvis${type}`, base64ToBuffer(blob));
  } catch {
    console.error('File not found. double check the extension\'s install type is local.');
  }
};

export {
  downloadExtension,
};
