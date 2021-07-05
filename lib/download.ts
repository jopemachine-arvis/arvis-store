import fse from 'fs-extra';
import path from 'path';
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

const downloadExtension = async function (
  type: 'workflow' | 'plugin',
  bundleId: string,
  options: { path?: string } = {}
): Promise<string | undefined> {
  try {
    const blob = await fetchExtensionBinary(type, bundleId);
    const basePath = options.path ? options.path : process.cwd();
    const dst = path.resolve(basePath, `${bundleId}.arvis${type}`);
    await fse.writeFile(dst, base64ToBuffer(blob));

    return dst;
  } catch {
    console.error('File not found. double check the extension\'s install type is local.');
  }
};

export {
  downloadExtension,
};
