const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const { withNativeWind } = require("nativewind/metro");
 
const config = mergeConfig(getDefaultConfig(__dirname), {
  /* your config */
  resolver: {
    projectRoot: __dirname,
    nodeModulesFolders: [
      __dirname + '/node_modules',
    ],
    assetExts: [...getDefaultConfig(__dirname).resolver.assetExts],
  },
  watchFolders: [
    __dirname + '/node_modules/@react-navigation',
  ],
});
 
module.exports = withNativeWind(config, { input: "./global.css" });