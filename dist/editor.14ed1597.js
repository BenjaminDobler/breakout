// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"types.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GemType = void 0;
var GemType;

(function (GemType) {
  GemType[GemType["BALL_SPEED_INCREASE"] = 0] = "BALL_SPEED_INCREASE";
  GemType[GemType["BALL_SPEED_DECREASE"] = 1] = "BALL_SPEED_DECREASE";
  GemType[GemType["PADDLE_GROW"] = 2] = "PADDLE_GROW";
  GemType[GemType["PADDLE_SHRINK"] = 3] = "PADDLE_SHRINK";
  GemType[GemType["NONE"] = 4] = "NONE";
})(GemType = exports.GemType || (exports.GemType = {}));
},{}],"editor.ts":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var types_1 = require("./types");

console.log('editor');
var brickColors = [];
brickColors[types_1.GemType.BALL_SPEED_DECREASE] = 'red';
brickColors[types_1.GemType.NONE] = 'grey';
brickColors[types_1.GemType.BALL_SPEED_INCREASE] = 'green';
brickColors[types_1.GemType.PADDLE_GROW] = 'black';
brickColors[types_1.GemType.PADDLE_SHRINK] = 'yellow';
var height = 600;
var width = 800;
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var rows = 0;
var cols = 0;
var apply = document.querySelector('#apply');
var selectMode = document.querySelector('#selectMode');
var gemSelect = document.querySelector('#gemSelect');
var exportButton = document.querySelector('#expot_btn');
exportButton.addEventListener('click', function () {
  var bs = bricks.filter(function (b) {
    return b.selected;
  }).map(function (b) {
    var c = __assign({}, b);

    delete c.width;
    delete c.height;
    delete c.x;
    delete c.y;
    delete c.selected;
    return c;
  });
  var data = {
    rows: rows,
    cols: cols,
    bricks: bs
  };
  console.log(JSON.stringify(data, null, 2));
});
gemSelect.addEventListener('change', function () {
  if (selectedBrick) {
    selectedBrick.gemType = gemSelect.selectedIndex;
    render();
  }
});
var selectedBrick;
canvas.addEventListener('click', function (e) {
  var rect = canvas.getBoundingClientRect();
  var x = e.pageX - rect.left;
  var y = e.pageY - rect.top;
  var xPos = Math.floor(x / (width / cols));
  var yPos = Math.floor(y / (height / rows));
  var index = yPos * cols + xPos;
  bricks[index].selected = selectMode.checked;
  selectedBrick = bricks[index];
  gemSelect.selectedIndex = selectedBrick.gemType;
  render();
});
var bricks = [];
apply.addEventListener('click', function () {
  console.log('on apply ');
  rows = parseInt(document.querySelector('#rows-tx').value);
  cols = parseInt(document.querySelector('#cols-tx').value);
  bricks = [];

  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      bricks.push({
        r: r,
        c: c,
        y: r * (height / rows),
        x: c * (width / cols),
        width: width / cols,
        height: height / rows,
        selected: false,
        gemType: types_1.GemType.NONE,
        strength: 1
      });
    }
  }

  render();
});

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.beginPath();
  context.lineWidth = 1;
  context.strokeStyle = '#000000';
  context.fillStyle = '#000000';
  context.fillStyle = '#999999';

  for (var _i = 0, bricks_1 = bricks; _i < bricks_1.length; _i++) {
    var brick = bricks_1[_i];

    if (brick.selected) {
      context.fillStyle = brickColors[brick.gemType];
    } else {
      context.fillStyle = '#999999';
    }

    context.beginPath();
    context.lineWidth = 1;
    context.rect(brick.x, brick.y, brick.width, brick.height);
    context.fill();
    context.stroke();
    context.closePath();
  }

  if (selectedBrick) {
    //context.fillStyle = '999999';
    context.beginPath();
    context.strokeStyle = '#00ff00';
    context.lineWidth = 3;
    context.rect(selectedBrick.x, selectedBrick.y, selectedBrick.width, selectedBrick.height); // context.fill();

    context.stroke();
    context.closePath();
  }
}
},{"./types":"types.ts"}],"../../../tools/node/node-v10.18.1-darwin-x64/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "52717" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../tools/node/node-v10.18.1-darwin-x64/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","editor.ts"], null)
//# sourceMappingURL=/editor.14ed1597.js.map