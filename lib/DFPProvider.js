'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DFPProvider = function (_Component) {
  (0, _inherits3.default)(DFPProvider, _Component);
  (0, _createClass3.default)(DFPProvider, null, [{
    key: 'loadGPTAsync',
    value: function loadGPTAsync() {
      return new _promise2.default(function (resolve, reject) {
        window.googletag = window.googletag || {};
        window.googletag.cmd = window.googletag.cmd || [];

        var scriptTag = document.createElement('script');
        scriptTag.src = document.location.protocol + '//www.googletagservices.com/tag/js/gpt.js';
        scriptTag.async = true;
        scriptTag.type = 'text/javascript';
        scriptTag.onerror = function (errs) {
          reject(errs);
        };
        scriptTag.onload = function () {
          resolve(window.googletag);
        };
        document.getElementsByTagName('head')[0].appendChild(scriptTag);
      });
    }
  }, {
    key: 'InitGPT',
    value: function InitGPT() {
      var collapseEmptyDivs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      googletag.cmd.push(function () {
        googletag.pubads().disableInitialLoad();
        googletag.pubads().enableAsyncRendering();
        googletag.pubads().enableSingleRequest();

        if (collapseEmptyDivs) {
          googletag.pubads().collapseEmptyDivs();
        }

        googletag.enableServices();
      });
    }
  }]);

  function DFPProvider(props) {
    (0, _classCallCheck3.default)(this, DFPProvider);

    var _this = (0, _possibleConstructorReturn3.default)(this, (DFPProvider.__proto__ || (0, _getPrototypeOf2.default)(DFPProvider)).call(this, props));

    _this.getAdCount = function () {
      _this.adCount = _this.adCount + 1;

      return _this.adCount;
    };

    _this.getIsSlotAdReady = function (slotId) {
      return _this.renderEndedSlots['slot-' + slotId];
    };

    _this.setIsSlotAdReady = function () {
      var slotId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var isReady = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (slotId) {
        _this.renderEndedSlots['slot-' + slotId] = isReady;
      }
    };

    _this.getIsComponentMounted = function (componentName) {
      return componentName && _this.mountedComponents[componentName];
    };

    _this.setIsComponentMounted = function (componentName, isMounted) {
      var doRefreshAds = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (componentName) {
        _this.mountedComponents[componentName] = isMounted;

        if (doRefreshAds) {
          _this.refreshAds();
        }
      }
    };

    _this.addAdSlot = function (slot) {
      _this.adSlots.push(slot);
    };

    _this.addUnRefreshedAdCount = function () {
      _this.unRefreshedAdCount = _this.unRefreshedAdCount + 1;
    };

    _this.refreshAds = (0, _lodash2.default)(function () {
      var result = false;

      if (googletag && _this.unRefreshedAdCount > 0) {
        if (_this.unRefreshedAdCount === _this.adSlots.length) {
          _this.unRefreshedAdCount = 0;

          result = googletag.cmd.push(function () {
            googletag.pubads().refresh(_this.adSlots);
          });

          _this.adSlots = [];
        } else {
          setTimeout(_this.refreshAds, 100);
        }
      }

      return result;
    }, 100);

    _this.clearAdSlots = function () {
      if (googletag) {
        var result = false;

        googletag.cmd.push(function () {
          result = googletag.pubads().clear(_this.adSlots);
        });

        _this.unRefreshedAdCount = 0;
        _this.adSlots = [];

        return result;
      }

      return false;
    };

    _this.adCount = 0;
    _this.unRefreshedAdCount = 0;
    _this.isGPTInitialized = false;
    _this.adSlots = [];
    _this.renderEndedSlots = {};
    _this.mountedComponents = {};
    return _this;
  }

  (0, _createClass3.default)(DFPProvider, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        getAdCount: this.getAdCount,
        getIsSlotAdReady: this.getIsSlotAdReady,
        setIsSlotAdReady: this.setIsSlotAdReady,
        getIsComponentMounted: this.getIsComponentMounted,
        setIsComponentMounted: this.setIsComponentMounted,
        addAdSlot: this.addAdSlot,
        addUnRefreshedAdCount: this.addUnRefreshedAdCount,
        refreshAds: this.refreshAds,
        clearAdSlots: this.clearAdSlots
      };
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _this2 = this;

      if (typeof window !== 'undefined' && !this.isGPTInitialized) {
        if (this.props.loadGPT) {
          this.constructor.loadGPTAsync().then(function () {
            _this2.constructor.InitGPT(_this2.props.collapseEmptyDivs);
          });
        } else {
          this.constructor.InitGPT(this.props.collapseEmptyDivs);
        }
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this3 = this;

      var onSlotRenderEnded = this.props.onSlotRenderEnded;


      if (googletag && onSlotRenderEnded) {
        googletag.cmd.push(function () {
          googletag.pubads().addEventListener('slotRenderEnded', function (event) {
            onSlotRenderEnded(_this3, event);
          });
        });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return this.props.children;
    }
  }]);
  return DFPProvider;
}(_react.Component);

DFPProvider.childContextTypes = {
  getAdCount: _propTypes2.default.func,
  getIsSlotAdReady: _propTypes2.default.func,
  setIsSlotAdReady: _propTypes2.default.func,
  getIsComponentMounted: _propTypes2.default.func,
  setIsComponentMounted: _propTypes2.default.func,
  addAdSlot: _propTypes2.default.func,
  addUnRefreshedAdCount: _propTypes2.default.func,
  refreshAds: _propTypes2.default.func,
  clearAdSlots: _propTypes2.default.func
};
DFPProvider.propTypes = {
  children: _propTypes2.default.oneOfType([_propTypes2.default.node, _propTypes2.default.arrayOf(_propTypes2.default.node)]).isRequired,
  collapseEmptyDivs: _propTypes2.default.bool,
  onSlotRenderEnded: _propTypes2.default.func,
  loadGPT: _propTypes2.default.bool
};
DFPProvider.defaultProps = {
  collapseEmptyDivs: false,
  onSlotRenderEnded: undefined,
  loadGPT: true
};
exports.default = DFPProvider;