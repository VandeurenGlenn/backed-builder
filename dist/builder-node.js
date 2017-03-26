'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _classCallCheck = _interopDefault(require('babel-runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('babel-runtime/helpers/createClass'));
var _regeneratorRuntime = _interopDefault(require('babel-runtime/regenerator'));
var _asyncGenerator = _interopDefault(require('babel-runtime/helpers/asyncGenerator'));

var bundler = function () {
  var _ref = _asyncGenerator.wrap(_regeneratorRuntime.mark(function _callee(bundles, fn) {
    var fns, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, bundle, dest;

    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            fns = [];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 4;

            for (_iterator = bundles[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              bundle = _step.value;
              dest = bundle.dest;

              bundle = bundle.bundle || bundle;
              bundle.dest = dest;
              fns.push(fn(bundle));
            }

            _context.next = 12;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context['catch'](4);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 12:
            _context.prev = 12;
            _context.prev = 13;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 15:
            _context.prev = 15;

            if (!_didIteratorError) {
              _context.next = 18;
              break;
            }

            throw _iteratorError;

          case 18:
            return _context.finish(15);

          case 19:
            return _context.finish(12);

          case 20:
            _context.next = 22;
            return Promise.all(fns).then(function (bundles) {
              logWorker.kill('SIGINT');
              if (global.debug) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                  for (var _iterator2 = warnings[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var warning = _step2.value;

                    logger.warn(warning);
                  }
                } catch (err) {
                  _didIteratorError2 = true;
                  _iteratorError2 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                      _iterator2.return();
                    }
                  } finally {
                    if (_didIteratorError2) {
                      throw _iteratorError2;
                    }
                  }
                }
              }
              return bundles;
            });

          case 22:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[4, 8, 12, 20], [13,, 15, 19]]);
  }));

  return function bundler(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

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

var Builder = function () {
  function Builder() {
    _classCallCheck(this, Builder);
  }

  _createClass(Builder, [{
    key: 'toJsProp',


    /**
     * convert hyphen to a javascript property srting
     */
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

      logWorker.send('start');
      logWorker.send(logger._chalk('building', 'cyan'));
      this.promiseBundles(config).then(function (bundles) {
        iterator = bundler(bundles, _this.bundle);
        iterator.next();
      }).catch(function (error) {
        logger.warn(error);
      });
    }
  }, {
    key: 'handleFormats',
    value: function handleFormats(bundle) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        try {
          var format = bundle.format;
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
    key: 'promiseBundles',
    value: function promiseBundles(config) {
      var _this3 = this;

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

                    bundle.format = format;
                    formats.push(_this3.handleFormats(bundle));
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
              } else if (bundle.format && typeof bundle.format !== 'string') {
                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                  for (var _iterator6 = bundle.format[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var _format = _step6.value;

                    bundle.format = _format;
                    formats.push(_this3.handleFormats(bundle));
                  }
                } catch (err) {
                  _didIteratorError6 = true;
                  _iteratorError6 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                      _iterator6.return();
                    }
                  } finally {
                    if (_didIteratorError6) {
                      throw _iteratorError6;
                    }
                  }
                }
              } else {
                formats.push(_this3.handleFormats(bundle));
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

      return new Promise(function (resolve, reject) {
        var plugins = config.plugins || [];
        if (config.babel) {
          var babel = require('rollup-plugin-babel');
          plugins.push(babel(config.babel));
        }
        rollup({
          entry: process.cwd() + '/' + config.src,
          plugins: plugins,
          cache: cache, // Use the previous bundle as starting point.
          // acorn: {
          //   allowReserved: true
          // },
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
          logWorker.send(logger._chalk(config.name + '::build finished', 'cyan'));
          setTimeout(function () {
            resolve();
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
          reject(err);
        });
      });
    }
  }]);

  return Builder;
}();

var builder = new Builder();

module.exports = builder;
//# sourceMappingURL=builder-node.js.map
