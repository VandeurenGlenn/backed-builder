var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

let bundler = (() => {
  var _ref = asyncGenerator.wrap(function* (bundles, fn) {
    let fns = [];
    for (let bundle of bundles) {
      let dest = bundle.dest;
      bundle = bundle.bundle || bundle;
      bundle.dest = dest;
      fns.push(fn(bundle));
    }

    yield Promise.all(fns).then(function (bundles) {
      logWorker.kill('SIGINT');
      if (global.debug) {
        for (let warning of warnings) {
          logger.warn(warning);
        }
      }
      return bundles;
    });
  });

  return function bundler(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

const { rollup } = require('rollup');
const path = require('path');
const { fork } = require('child_process');
const logger = require('backed-logger');
let iterator;
let cache;
let warnings = [];

const logWorker = fork(path.join(__dirname, 'workers/log-worker.js'));

class Builder {

  constructor(config) {
    logWorker.send(logger._chalk('building', 'cyan'));
    logWorker.send('start');
    this.build(config);
  }

  /**
   * convert hyphen to a javascript property srting
   */
  toJsProp(string) {
    let parts = string.split('-');
    if (parts.length > 1) {
      string = parts[0];
      for (let part of parts) {
        if (parts[0] !== part) {
          var upper = part.charAt(0).toUpperCase();
          string += upper + part.slice(1).toLowerCase();
        }
      }
    }
    return string;
  }

  build(config) {
    this.promiseBundles(config).then(bundles => {
      iterator = bundler(bundles, this.bundle);
      iterator.next();
    }).catch(error => {
      logger.warn(error);
    });
  }

  handleFormats(bundle) {
    return new Promise((resolve, reject) => {
      try {
        const format = bundle.format;
        let dest = bundle.dest;
        if (format === 'iife' && !bundle.moduleName) {
          bundle.moduleName = this.toJsProp(bundle.name);
        } else {
          switch (format) {
            case 'cjs':
              dest = bundle.dest.replace('.js', '-node.js');
              break;
            case 'es':
            case 'amd':
              dest = bundle.dest.replace('.js', `-${format}.js`);
              break;
            default:
              break;
            // do nothing
          }
        }
        resolve({ bundle: bundle, dest: dest, format: format });
      } catch (err) {
        reject(err);
      }
    });
  }

  promiseBundles(config) {
    return new Promise((resolve, reject) => {
      let formats = [];
      let bundles = config.bundles;
      try {
        for (let bundle of bundles) {
          bundle.name = bundle.name || config.name;
          bundle.babel = bundle.babel || config.babel;
          bundle.sourceMap = bundle.sourceMap || config.sourceMap;
          if (config.format && typeof config.format !== 'string' && !bundle.format) {
            for (let format of config.format) {
              bundle.format = format;
              formats.push(this.handleFormats(bundle));
            }
          } else if (bundle.format) {
            formats.push(this.handleFormats(bundle));
          } else if (!bundle.format) {
            formats.push(this.handleFormats(bundle));
          }
        }
        Promise.all(formats).then(bundles => {
          resolve(bundles);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * @param {object} config
   * @param {string} config.src path/to/js
   * @param {string} config.dest destination to write to
   * @param {string} config.format format to build ['es', 'iife', 'amd', 'cjs']
   * @param {string} config.name the name of your element/app
   * @param {string} config.moduleName the moduleName for your element/app (not needed for es & cjs)
   * @param {boolean} config.sourceMap Wether or not to build sourceMaps defaults to 'true'
   * @param {object} config.plugins rollup plugins to use [see](https://github.com/rollup/rollup/wiki/Plugins)
   */
  bundle(config = { src: null, dest: 'bundle.js', format: 'iife', name: null, plugins: [], moduleName: null, sourceMap: true }) {
    return new Promise((resolve, reject) => {
      let plugins = config.plugins || [];
      if (config.babel) {
        const babel = require('rollup-plugin-babel');
        plugins.push(babel(config.babel));
      }
      rollup({
        entry: `${process.cwd()}/${config.src}`,
        plugins: plugins,
        cache: cache,
        // Use the previous bundle as starting point.
        onwarn: warning => {
          warnings.push(warning);
        }
      }).then(bundle => {
        cache = bundle;
        bundle.write({
          // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
          format: config.format,
          moduleName: config.moduleName,
          sourceMap: config.sourceMap,
          dest: `${process.cwd()}/${config.dest}`
        });
        logWorker.send(logger._chalk(`${config.name}::build finished`, 'cyan'));
        setTimeout(() => {
          resolve();
        }, 100);
      }).catch(err => {
        const code = err.code;
        logWorker.send('pauze');
        logger.error(err);
        if (code === 'PLUGIN_ERROR' || code === 'UNRESOLVED_ENTRY') {
          logWorker.kill('SIGINT');
        } else {
          logger.warn('trying to resume the build ...');
          logWorker.send('resume');
        }
      });
    });
  }
}

export default Builder;
//# sourceMappingURL=builder-es.js.map
