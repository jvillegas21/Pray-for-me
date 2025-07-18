const { getDefaultConfig } = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

// Add structuredClone polyfill
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.alias = {
  ...config.resolver.alias,
};

module.exports = config;
