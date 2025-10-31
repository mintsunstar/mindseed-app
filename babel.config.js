// babel.config.js
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', { alias: { '@': './' } }],
      'react-native-reanimated/plugin', // 있으면 항상 마지막
    ],
  }
}
