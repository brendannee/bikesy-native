# Bikesy Native

A react native app for bikesy.com. It is an iOS and Android app for finding bike directions. A web-based version is available at http://bikesy.com.

It uses routes based on open street maps and served from the Bikesy Server.

It allows users to specify a start and end point to a route along with a hill tolerance (from avoiding hills to not weighting hills much at all). It allows users to choose between three different scenarios of bike facilities from mainly bike lanes and bike routes to a very direct route.

Routes are displayed using the mapbox API.

Bikesy API
You can pull info directly from the bikesy backend using the [Bikesy API](https://blog.bikesy.com/api/: https://blog.bikesy.com/api/).

The assumptions that go into the routes provided by the Bikesy API are documented on the Bikesy API page .

## Running

### `yarn start`

Runs your app in development mode.

Open it in the [Expo app](https://expo.io) on your phone to view it. It will reload if you save edits to your files, and you will see build errors and logs in the terminal.

Sometimes you may need to reset or clear the React Native packager's cache. To do so, you can pass the `--reset-cache` flag to the start script:

```
yarn start --reset-cache
```

#### `yarn test`

Runs the [jest](https://github.com/facebook/jest) test runner on your tests.
