var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _marked = [bundler].map(regeneratorRuntime.mark);

var _require = require('rollup');
var rollup = _require.rollup;

var path = require('path');

var _require2 = require('child_process');
var fork = _require2.fork;

var logger = require('backed-logger');
var iterator = void 0;
var cache = void 0;
var warnings = [];

var logWorker = fork(path.join(__dirname, 'workers/log-worker.js'));

function bundler(bundles, fn) {
  var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, bundle, dest, format, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, warning;

  return regeneratorRuntime.wrap(function bundler$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 3;
          _iterator = bundles[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 17;
            break;
          }

          bundle = _step.value;
          dest = bundle.dest;
          format = bundle.format;

          bundle = bundle.bundle || bundle;
          bundle.dest = dest;
          bundle.format = format;
          _context.next = 14;
          return fn(bundle);

        case 14:
          _iteratorNormalCompletion = true;
          _context.next = 5;
          break;

        case 17:
          _context.next = 23;
          break;

        case 19:
          _context.prev = 19;
          _context.t0 = _context['catch'](3);
          _didIteratorError = true;
          _iteratorError = _context.t0;

        case 23:
          _context.prev = 23;
          _context.prev = 24;

          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }

        case 26:
          _context.prev = 26;

          if (!_didIteratorError) {
            _context.next = 29;
            break;
          }

          throw _iteratorError;

        case 29:
          return _context.finish(26);

        case 30:
          return _context.finish(23);

        case 31:
          logWorker.kill('SIGINT');

          if (!global.debug) {
            _context.next = 52;
            break;
          }

          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context.prev = 36;

          for (_iterator2 = warnings[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            warning = _step2.value;

            logger.warn(warning);
          }
          _context.next = 44;
          break;

        case 40:
          _context.prev = 40;
          _context.t1 = _context['catch'](36);
          _didIteratorError2 = true;
          _iteratorError2 = _context.t1;

        case 44:
          _context.prev = 44;
          _context.prev = 45;

          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }

        case 47:
          _context.prev = 47;

          if (!_didIteratorError2) {
            _context.next = 50;
            break;
          }

          throw _iteratorError2;

        case 50:
          return _context.finish(47);

        case 51:
          return _context.finish(44);

        case 52:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this, [[3, 19, 23, 31], [24,, 26, 30], [36, 40, 44, 52], [45,, 47, 51]]);
}

var Builder = function () {
  function Builder(config) {
    classCallCheck(this, Builder);

    logWorker.send(logger._chalk('building', 'cyan'));
    logWorker.send('start');
    this.build(config);
  }

  /**
   * convert hyphen to a javascript property srting
   */


  createClass(Builder, [{
    key: 'toJsProp',
    value: function toJsProp(string) {
      var parts = string.split('-');
      if (parts.length > 1) {
        string = parts[0];
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = parts[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var part = _step3.value;

            if (parts[0] !== part) {
              var upper = part.charAt(0).toUpperCase();
              string += upper + part.slice(1).toLowerCase();
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
      return string;
    }
  }, {
    key: 'build',
    value: function build(config) {
      var _this = this;

      this.promiseBundles(config).then(function (bundles) {
        iterator = bundler(bundles, _this.bundle);
        iterator.next();
      }).catch(function (error) {
        logger.warn(error);
      });
    }
  }, {
    key: 'handleFormats',
    value: function handleFormats(bundle, format) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        try {
          var dest = bundle.dest;
          if (format === 'iife' && !bundle.moduleName) {
            bundle.moduleName = _this2.toJsProp(bundle.name);
          } else {
            switch (format) {
              case 'cjs':
                dest = bundle.dest.replace('.js', '-node.js');
                break;
              case 'es':
              case 'amd':
                dest = bundle.dest.replace('.js', '-' + format + '.js');
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
  }, {
    key: 'handleFormat',
    value: function handleFormat(bundle) {
      var _this3 = this;

      var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

      return new Promise(function (resolve) {
        if (format) {
          bundle.format = format;
        }
        if (bundle.format === 'iife' && !bundle.moduleName) {
          bundle.moduleName = _this3.toJsProp(bundle.name);
        }
        resolve(bundle);
      });
    }
  }, {
    key: 'promiseBundles',
    value: function promiseBundles(config) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        var formats = [];
        var bundles = config.bundles;
        try {
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = bundles[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var bundle = _step4.value;

              bundle.name = bundle.name || config.name;
              bundle.babel = bundle.babel || config.babel;
              bundle.sourceMap = bundle.sourceMap || config.sourceMap;
              if (config.format && typeof config.format !== 'string' && !bundle.format) {
                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;

                try {
                  for (var _iterator5 = config.format[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var format = _step5.value;

                    formats.push(_this4.handleFormats(bundle, format));
                  }
                } catch (err) {
                  _didIteratorError5 = true;
                  _iteratorError5 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                      _iterator5.return();
                    }
                  } finally {
                    if (_didIteratorError5) {
                      throw _iteratorError5;
                    }
                  }
                }
              } else if (bundle.format) {
                formats.push(_this4.handleFormat(bundle));
              } else if (!bundle.format) {
                formats.push(_this4.handleFormat(bundle, config.format));
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          Promise.all(formats).then(function (bundles) {
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

  }, {
    key: 'bundle',
    value: function bundle() {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { src: null, dest: 'bundle.js', format: 'iife', name: null, plugins: [], moduleName: null, sourceMap: true };

      var plugins = config.plugins || [];
      if (config.babel) {
        var babel = require('rollup-plugin-babel');
        plugins.push(babel(config.babel));
      }
      rollup({
        entry: process.cwd() + '/' + config.src,
        plugins: plugins,
        cache: cache,
        // Use the previous bundle as starting point.
        onwarn: function onwarn(warning) {
          warnings.push(warning);
        }
      }).then(function (bundle) {
        cache = bundle;
        bundle.write({
          // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
          format: config.format,
          moduleName: config.moduleName,
          sourceMap: config.sourceMap,
          dest: process.cwd() + '/' + config.dest
        });
        logWorker.send(logger._chalk(global.config.name + '::build finished', 'cyan'));
        setTimeout(function () {
          iterator.next();
        }, 100);
      }).catch(function (err) {
        var code = err.code;
        logWorker.send('pauze');
        logger.error(err);
        if (code === 'PLUGIN_ERROR' || code === 'UNRESOLVED_ENTRY') {
          logWorker.kill('SIGINT');
        } else {
          logger.warn('trying to resume the build ...');
          logWorker.send('resume');
        }
      });
    }
  }]);
  return Builder;
}();

export default Builder;
//# sourceMappingURL=builder-es.js.map
