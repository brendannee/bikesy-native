import { registerRootComponent } from 'expo';
import { activateKeepAwake } from 'expo-keep-awake';
import App from './app/App';

if (__DEV__) {
  activateKeepAwake();
}

registerRootComponent(App);
