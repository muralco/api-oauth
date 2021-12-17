# MURAL OAuth2 Server

This repo is an app for simplifying the OAuth process, used to demonstrate how to use MURAL OAuth endpoints.

## Setup

To use this app:

Begin by copying [`.env.example`](./.env.example) to `.env`. Then be sure to fill out the 3 following env vars:

- `MURAL_CLIENT_ID`
- `MURAL_CLIENT_SECRET`
- `REDIRECT_URI`

Once you have set these values, you can run the following commands to get the server up and running:

```bash
npm install
npm start
```

### Additional Options

In your `.env` there are some other settings you can set as well:

- `API_BASE` (default: "https://app.mural.co") - This can be adjusted to change the API base url.
- `SERVER_PORT` (default: 5000) - You can adjust the port that the express server runs on.

## `public` Folder

In addition to all of this, the express server is set up to serve anything in the [`/public`](./public/) folder and can
be used to develop your front-end.

## `public/mural-fetch.js`

Inside the public folder we have a javascript file that has a default export of a function `createMuralFetch` that sets
up a few helper methods for using the express API that is implemented by this package.

### `createMuralFetch(options):Object`

#### Parameters

- `options:Object<String:String?>` [ default: `{}` ]
  - `authUrl:String?` [ default: `${window.location.origin}/auth` ] - the path to our initial auth endpoint.
    This is where the user will be redirected to when not authenticated.
  - `refreshUrl:String?` [ default: `${window.location.origin}/auth/refresh` ] - the endpoint that a refresh token can
    be posted to refresh the access token and refresh token.

#### Returns

`createMuralFetch` returns an object with several functions that can be used to handle authentication and fetching with
credentials.

- returns `Object<String:Function>`
  - [`startAuth`](#startauthboolean)
  - [`redirectForAuth`](#redirectforauth)
  - [`clearAuth`](#clearauth)
  - [`authFetch`](#authfetchinput--initpromiseresponse)
  - [`authRefresh`](#authrefreshpromiseboolean)
  - [`inspectTokens`](#inspecttokensobjectstringstring)

### `startAuth():Boolean`

This function checks to see if the credentials are available in either localStorage or in the query string.
Should be called first thing.

#### Returns `Boolean`

- If there are auth tokens already, then this will return true.
- If it can't find auth tokens, it will return false. You will want to call [`redirectForAuth`](#redirectforauth) to
  begin the authorization process.

### `redirectForAuth()`

This function will redirect the user to the `authUrl` provided to [`createMuralFetch`](#createmuralfetchoptionsobject).
it will also append the current address as the `redirectUri` in the query string for `authUrl`.

### `clearAuth()`

Use this to "log out" the currently authorized user by deleting the current set of tokens and making sure they do not
get stored.

### `authFetch(input [, init]):Promise<Response>`

This is a wrapper for the native [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) function. This will
automatically add our authorization header with the currently supplied access token.

If you are not familiar with the Fetch API, Take a look at the [MDN Docs on using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)

### `authRefresh():Promise<Boolean>`

This will attempt to refresh our tokens by posting our current refresh token to the `refreshUrl` provided to [`createMuralFetch`](#createmuralfetchoptionsobject).

#### Returns `Promise<Boolean>`

- If the tokens are successfully refreshed, the promise will resolve true.
- If the tokens are not refreshed, it will resolve false.

### `inspectTokens():Object<String:String>`

This function will return an object containing the current values of `accessToken` and `refreshToken`. Modifying the
values returned will not modify the currently stored values.

#### Returns `Object<String:String?>`

- `Object<String:String?>`
  - `accessToken` - the current access token used to provide authorization.
  - `refreshToken` - the current refresh token that can be used get new tokens.
