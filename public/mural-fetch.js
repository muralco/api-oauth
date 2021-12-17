/**
 * @typedef {object} ConstructorOptions - The options for the constructor method of MuralFetch.
 * @property {string} [authURL=`${window.location.origin}/auth`] - The URL to redirect the user to that begins the
 * authorization process
 * @property {string} [refreshURL=`${window.location.origin}/auth/refresh`] -  The endpoint that a POST request can be
 * made to, which will refresh the access token.
 */

/**
 * This will create an instance of our MuralFetch authorization tool kit.
 * @param {ConstructorOptions} [options={}] - our options object
 * @returns {Object}
 */

export default function createMuralFetch(options) {
  /**
   * @typedef {object} Tokens - Object containing the OAuth tokens.
   * @property {(string|undefined)} accessToken - The OAuth bearer token used to make requests.
   * @property {(string|undefined)} refreshToken - The OAuth refresh token used to update our tokens.
   */

  /** @type ConstructorOptions */
  const DefaultConstructorOptions = {
    authURL: `${window.location.origin}/auth`,
    refreshURL: `${window.location.origin}/auth/refresh`,
  };
  /** @type ConstructorOptions */
  const { authURL, refreshURL } = { ...DefaultConstructorOptions, ...options };

  /**
   * The current access token.
   * @private
   * @type {(string|undefined)}
   */
  let accessToken;
  /**
   * The current refresh token.
   * @private
   * @type {(string|undefined)}
   */
  let refreshToken;

  /**
   * Save the current tokens to localStorage.
   * @private
   */
  function saveTokens() {
    localStorage.setItem(
      "MuralFetchTokens",
      JSON.stringify({ accessToken, refreshToken })
    );
  }

  /**
   * Attempts to load tokens from localStorage if they exist. Then removes them from localStorage.
   * @private
   * @returns {Tokens}
   */
  function loadTokens() {
    const tokens = JSON.parse(localStorage.getItem("MuralFetchTokens"));
    localStorage.removeItem("MuralFetchTokens");
    return tokens || {};
  }

  /**
   * Activated when the page unloads to save our current Tokens to localstorage.
   * @private
   */
  function destroy() {
    window.removeEventListener("beforeunload", destroy);
    saveTokens();
  }

  return {
    /**
     * Begins the redirect process for the OAuth flow.
     */
    redirectForAuth() {
      const redirect = new URL(authURL);
      redirect.searchParams.set("redirectUri", window.location.href);
      window.location.replace(redirect.href);
    },

    /**
     * Our authenticated fetch function. takes the same params as window.fetch
     * @name authFetch
     * @param {(Request|String)} input
     * @param {RequestInit?} [init]
     * @returns {Promise<Response>}
     */
    authFetch(input, init) {
      const initRequest = new Request(input, init);

      const authRequest = new Request(initRequest, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return window.fetch(authRequest);
    },

    /**
     * Calls to refresh our access token and refresh token.
     * If refresh is not possible, will trigger a redirect to start auth.
     * @returns {Promise<boolean>}
     */
    async authRefresh() {
      try {
        const response = await fetch(refreshURL, {
          body: JSON.stringify({ refreshToken }),
          method: "POST",
          headers: {
            "content-type": "application/json; charset=utf-8",
          },
        });
        /** @type {Tokens} */
        const tokens = await response.json();
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
        return true;
      } catch {
        clearAuth();
        redirectForAuth();
        return false;
      }
    },

    /**
     * Inspect the current token values.
     * @returns {Tokens}
     */
    inspectTokens() {
      return { accessToken, refreshToken };
    },
    /**
     * Clears the currently used Auth settings.
     * @returns {boolean}
     */
    clearAuth() {
      window.removeEventListener("beforeunload", destroy);
      accessToken = undefined;
      refreshToken = undefined;
      return true;
    },
    /**
     * Does the checks needed to start the auth process.
     * @returns {boolean}
     */
    startAuth() {
      if (window.location.search !== "") {
        const queryString = new URLSearchParams(window.location.search);
        accessToken = queryString.get("accessToken");
        refreshToken = queryString.get("refreshToken");
        const updateQuery = new URL(window.location.href);
        updateQuery.searchParams.delete("accessToken");
        updateQuery.searchParams.delete("refreshToken");
        window.history.pushState(
          { path: updateQuery.href },
          "",
          updateQuery.href
        );
      } else {
        const tokens = loadTokens();
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
      }

      if (!accessToken || !refreshToken) {
        return false;
      }
      window.addEventListener("beforeunload", destroy);

      return true;
    },
  };
}
