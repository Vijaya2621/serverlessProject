import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const layerPath = path.resolve(__dirname, '../../layer/nodejs/node_modules');

const require = createRequire(import.meta.url);

export const loadLayerModule = (moduleName) => {
  try {
    return require(moduleName);
  } catch (error) {
    const layerModulePath = path.join(layerPath, moduleName);
    if (fs.existsSync(layerModulePath) || fs.existsSync(`${layerModulePath}.js`)) {
      return require(layerModulePath);
    }
    
    throw error;
  }
};
