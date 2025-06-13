/**
 * Module loader for ES modules to load dependencies from Lambda layers
 */
import { loadLayerModule } from './moduleResolver.js';

// Pre-load common dependencies
export const mongoose = loadLayerModule('mongoose');
export const bcrypt = loadLayerModule('bcryptjs');
export const jwt = loadLayerModule('jsonwebtoken');

// Export a function to dynamically load other modules
export const loadModule = (moduleName) => {
  return loadLayerModule(moduleName);
};