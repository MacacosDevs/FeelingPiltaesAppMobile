/**
 * @format
 */

import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HeroUINativeProvider } from 'heroui-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { ScopedTheme } from 'uniwind';
import { RootNavigator } from './src/navigation/RootNavigator';
import { STRIPE_PUBLISHABLE_KEY } from './src/config/env';
import './src/global.css';

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      {/* The app only ships a light design, so the HeroUI Native theme is
          pinned to "light" regardless of the device's system appearance. */}
      <ScopedTheme theme="light">
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <HeroUINativeProvider>
            <SafeAreaProvider>
              <StatusBar barStyle="dark-content" />
              <RootNavigator />
            </SafeAreaProvider>
          </HeroUINativeProvider>
        </StripeProvider>
      </ScopedTheme>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
