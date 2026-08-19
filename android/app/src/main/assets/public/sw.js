/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "service-worker.js",
    "revision": "273f13062c59abf4131050ff468c7a6a"
  }, {
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "index.html",
    "revision": "caf9879d1962a218ef5488a743aa418c"
  }, {
    "url": "assets/vendor-D6Emt4CX.js",
    "revision": null
  }, {
    "url": "assets/utils-fYCG1JqN.js",
    "revision": null
  }, {
    "url": "assets/trainname-CsaqQLPq.js",
    "revision": null
  }, {
    "url": "assets/trainSchedules-B1soh3xH.js",
    "revision": null
  }, {
    "url": "assets/maps-f-FpKD9p.js",
    "revision": null
  }, {
    "url": "assets/index-DKp77P6X.js",
    "revision": null
  }, {
    "url": "assets/index-COmZfwNb.css",
    "revision": null
  }, {
    "url": "assets/index-BuhckpUN.js",
    "revision": null
  }, {
    "url": "assets/flightSchedules-D7cbC4TT.js",
    "revision": null
  }, {
    "url": "assets/exportUtils-7ZjtJfDt.js",
    "revision": null
  }, {
    "url": "assets/dataWorker-De9EcLUy.js",
    "revision": null
  }, {
    "url": "assets/charts-DIlnrvYw.js",
    "revision": null
  }, {
    "url": "assets/airports-5fb7GIkM.js",
    "revision": null
  }, {
    "url": "assets/MapView-DsWwCruX.js",
    "revision": null
  }, {
    "url": "assets/MapView-CIGW-MKW.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "0cad7488b9973595da8ec44e0676f99e"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html"), {
    denylist: [/^\/api\//, /^\/firebase-messaging-sw\.js$/]
  }));

}));
