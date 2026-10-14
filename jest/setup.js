/* eslint-env jest */

// Mocks de los módulos nativos de terceros que el preset de RN no trae. Cada
// mock expone jest.fn() que los tests controlan importando el módulo mockeado
// (p. ej. `Keychain.getGenericPassword.mockRejectedValueOnce(...)`). Ningún
// valor aquí es una credencial real: tokens, idTokens y client secrets son
// cadenas de prueba.

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(async () => true),
  getGenericPassword: jest.fn(async () => false),
  resetGenericPassword: jest.fn(async () => true),
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(async () => true),
    signIn: jest.fn(async () => ({ type: 'success', data: { idToken: 'google-id-token-de-prueba' } })),
    signOut: jest.fn(async () => null),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

jest.mock('@stripe/stripe-react-native', () => {
  const stripe = {
    initPaymentSheet: jest.fn(async () => ({ error: undefined })),
    presentPaymentSheet: jest.fn(async () => ({ error: undefined })),
  };
  return {
    __stripe: stripe,
    useStripe: () => stripe,
    StripeProvider: ({ children }) => children,
  };
});

jest.mock('react-native-vision-camera', () => {
  const state = {
    device: { id: 'back', position: 'back' },
    hasPermission: true,
    requestPermission: jest.fn(async () => true),
    onCodeScanned: null,
  };
  return {
    __camera: state,
    Camera: () => null,
    useCameraDevice: () => state.device,
    useCameraPermission: () => ({
      hasPermission: state.hasPermission,
      requestPermission: state.requestPermission,
    }),
    useCodeScanner: config => {
      state.onCodeScanned = config.onCodeScanned;
      return config;
    },
  };
});

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(async () => ({ didCancel: true })),
  launchImageLibrary: jest.fn(async () => ({ didCancel: true })),
}));

// Íconos SVG: irrelevantes para los caminos de error, se renderizan como nada.
jest.mock('react-native-heroicons/outline', () =>
  new Proxy({}, { get: (_, nombre) => (nombre === '__esModule' ? true : () => null) }),
);
jest.mock('react-native-heroicons/solid', () =>
  new Proxy({}, { get: (_, nombre) => (nombre === '__esModule' ? true : () => null) }),
);

// heroui-native arrastra reanimated/worklets, que necesitan el runtime nativo.
// Solo se usan Input/FieldError (formularios) y el Provider: se sustituyen por
// primitivas de RN con el mismo comportamiento observable (texto y onChangeText).
jest.mock('heroui-native', () => {
  const React = require('react');
  const { Text, TextInput } = require('react-native');
  return {
    HeroUINativeProvider: ({ children }) => children,
    Input: ({ isDisabled, isInvalid, ...props }) =>
      React.createElement(TextInput, { ...props, editable: !isDisabled }),
    FieldError: ({ children, isInvalid }) => (isInvalid ? React.createElement(Text, null, children) : null),
  };
});

jest.mock('uniwind', () => ({ ScopedTheme: ({ children }) => children }));

jest.mock('react-native-maps', () => {
  const MapView = () => null;
  MapView.Marker = () => null;
  return { __esModule: true, default: MapView, Marker: () => null, PROVIDER_DEFAULT: null, PROVIDER_GOOGLE: 'google' };
});

jest.mock('react-native-qrcode-svg', () => () => null);

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

// Para App.test.tsx (monta la app completa): gesture-handler trae su propio
// setup de Jest, y el CSS global de uniwind no aplica fuera de Metro.
require('react-native-gesture-handler/jestSetup');
jest.mock('../src/global.css', () => ({}), { virtual: true });
