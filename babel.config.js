module.exports = {
  presets: ['module:@react-native/babel-preset','nativewind/babel'],
  // Reanimated's plugin is the worklets plugin — do not list both (duplicate error).
  plugins: ['react-native-reanimated/plugin'],
};
