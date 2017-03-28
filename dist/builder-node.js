'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _classCallCheck = _interopDefault(require('babel-runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('babel-runtime/helpers/createClass'));
var _regeneratorRuntime = _interopDefault(require('babel-runtime/regenerator'));
var _asyncGenerator = _interopDefault(require('babel-runtime/helpers/asyncGenerator'));

var bundler = function () {
  var _ref = _asyncGenerator.wrap(_regeneratorRuntime.mark(function _callee(bundles, fn, cb) {
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
            return _asyncGenerator.await(Promise.all(fns).then(function (bundles) {
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
              cb(bundles);
            }).catch(function (error) {
              logger.warn(error);
            }));
          case 22:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[4, 8, 12, 20], [13,, 15, 19]]);
  }));
  return function bundler(_x, _x2, _x3) {
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
      return new Promise(function (resolve, reject) {
        logWorker.send('start');
        logWorker.send(logger._chalk('building', 'cyan'));
        _this.promiseBundles(config).then(function (bundles) {
          iterator = bundler(bundles, _this.bundle, function (bundles) {
            resolve(bundles);
          });
          iterator.next();
        }).catch(function (error) {
          logger.warn(error);
          reject(error);
        });
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
          var formats = [];
          if (bundle.shouldRename) {
            switch (format) {
              case 'iife':
                if (!bundle.moduleName) {
                  bundle.moduleName = _this2.toJsProp(bundle.name);
                }
                break;
              case 'cjs':
                dest = bundle.dest.replace('.js', '-node.js');
                break;
              case 'es':
              case 'amd':
                dest = bundle.dest.replace('.js', '-' + format + '.js');
                break;
              default:
                break;
            }
          }
          resolve({ bundle: bundle, dest: dest, format: format });
        } catch (err) {
          reject(err);
        }
      });
    }
  }, {
    key: 'forBundles',
    value: function forBundles(bundles, cb) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;
      try {
        for (var _iterator4 = bundles[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var bundle = _step4.value;
          cb(bundle);
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
    }
  }, {
    key: 'compareBundles',
    value: function compareBundles(bundles, cb) {
      this.forBundles(bundles, function (bundle) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;
        try {
          for (var _iterator5 = bundles[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var i = _step5.value;
            if (bundles.indexOf(i) !== bundles.indexOf(bundle)) {
              if (i.dest === bundle.dest) {
                if (i.format !== bundle.format) {
                  bundle.shouldRename = true;
                  return cb(bundle);
                }
              }
            }
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
        cb(bundle);
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
          _this3.compareBundles(bundles, function (bundle) {
            bundle.name = bundle.name || config.name;
            bundle.babel = bundle.babel || config.babel;
            bundle.sourceMap = bundle.sourceMap || config.sourceMap;
            if (config.format && typeof config.format !== 'string' && !bundle.format) {
              var _iteratorNormalCompletion6 = true;
              var _didIteratorError6 = false;
              var _iteratorError6 = undefined;
              try {
                for (var _iterator6 = config.format[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                  var format = _step6.value;
                  bundle.format = format;
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
          });
          Promise.all(formats).then(function (bundles) {
            resolve(bundles);
          });
        } catch (err) {
          reject(err);
        }
      });
    }
  }, {
    key: 'bundle',
    value: function bundle() {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { src: null, dest: 'bundle.js', format: 'iife', name: null, plugins: [], moduleName: null, sourceMap: true };
      return new Promise(function (resolve, reject) {
        var plugins = [];
        var requiredPlugins = {};
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;
        try {
          for (var _iterator7 = Object.keys(config.plugins)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var plugin = _step7.value;
            var required = void 0;
            try {
              required = require('rollup-plugin-' + plugin);
            } catch (error) {
              try {
                required = require(path.join(process.cwd(), '/node_modules/rollup-plugin-' + plugin));
              } catch (error) {
                reject(error);
              }
            }
            var conf = config.plugins[plugin];
            requiredPlugins[plugin] = required;
            plugins.push(requiredPlugins[plugin](conf));
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
              _iterator7.return();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }
        rollup({
          entry: process.cwd() + '/' + config.src,
          plugins: plugins,
          cache: cache,
          onwarn: function onwarn(warning) {
            warnings.push(warning);
          }
        }).then(function (bundle) {
          cache = bundle;
          bundle.write({
            format: config.format,
            moduleName: config.moduleName,
            sourceMap: config.sourceMap,
            dest: process.cwd() + '/' + config.dest
          });
          setTimeout(function () {
            logWorker.send(logger._chalk(config.name + '::build finished', 'cyan'));
            logWorker.send('done');
            logWorker.on('message', function () {
              resolve(bundle);
            });
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
