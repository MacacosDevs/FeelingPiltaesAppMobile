module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest/setup.js'],
  // El primer render de una pantalla carga (y transpila) todo su árbol de módulos.
  testTimeout: 20000,
  // Los SDKs nativos de terceros se publican sin transpilar (ESM/TS/Flow), así
  // que hay que dejarlos pasar por babel igual que react-native.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-[^/]+)?|@react-native(-community)?|@react-native-google-signin|@react-navigation|@stripe|heroui-native|uniwind)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/__tests__/helpers/'],
};
