'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProfilePropType = undefined;

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactWaypoint = require('react-waypoint');

var _reactWaypoint2 = _interopRequireDefault(_reactWaypoint);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// [300, 250], [[300, 250], 'fluid'], ['fluid]
var AD_SIZE_TYPE = _propTypes2.default.arrayOf(_propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.number), _propTypes2.default.string, _propTypes2.default.number]));

/*
[
  [
    [1300,0],
    [[1, 1], [970, 90]],
  ],
  [
    [1300, 0],
    [300, 250],
  ],
  [
    [1300, 0],
    'fluid',
  ],
]
 */
var MULTI_SIZE_TYPE = _propTypes2.default.arrayOf(_propTypes2.default.arrayOf(AD_SIZE_TYPE));

var ProfilePropType = exports.ProfilePropType = _propTypes2.default.shape({
  path: _propTypes2.default.string,
  name: _propTypes2.default.string,
  size: AD_SIZE_TYPE,
  multiSize: MULTI_SIZE_TYPE,
  multiSizeHandler: _propTypes2.default.func,
  waitingFor: _propTypes2.default.string,
  hideOnInitial: _propTypes2.default.bool
});

var AdSlot = function (_Component) {
  (0, _inherits3.default)(AdSlot, _Component);

  function AdSlot(props) {
    (0, _classCallCheck3.default)(this, AdSlot);

    var _this = (0, _possibleConstructorReturn3.default)(this, (AdSlot.__proto__ || (0, _getPrototypeOf2.default)(AdSlot)).call(this, props));

    _this.handleResize = function () {
      _this.props.profile.multiSizeHandler(_this);
    };

    _this.initSlot = function () {
      var slotId = _this.slotId;
      var _this$props = _this.props,
          profile = _this$props.profile,
          targetValue = _this$props.targetValue,
          lazyLoading = _this$props.lazyLoading;


      googletag.cmd.push(function () {
        if (profile.multiSize) {
          var size = profile.multiSize.map(function (item) {
            return item[1];
          });
          var mapping = googletag.sizeMapping();

          for (var i = 0; i < profile.multiSize.length; i += 1) {
            mapping.addSize(profile.multiSize[i][0], profile.multiSize[i][1]);
          }

          mapping = mapping.build();

          _this.slot = googletag.defineSlot(profile.path, size, slotId).defineSizeMapping(mapping).addService(googletag.pubads());
        } else if (profile.outOfPage) {
          _this.slot = googletag.defineOutOfPageSlot(profile.path, slotId).addService(googletag.pubads());
        } else {
          _this.slot = googletag.defineSlot(profile.path, profile.size, slotId).addService(googletag.pubads());
        }

        if (profile.targetKey && targetValue) {
          _this.slot.setTargeting(profile.targetKey, targetValue);
        }

        googletag.display(slotId);

        if (!lazyLoading) {
          _this.refresh();
        }
      });
    };

    _this.refresh = function () {
      var profile = _this.props.profile;


      if (!profile || _this.refreshed) {
        return;
      }

      if (_this.slot === null) {
        setTimeout(_this.refresh, 100);

        return;
      }

      _this.refreshed = true;
      _this.context.addUnRefreshedAdCount();
      _this.context.addAdSlot(_this.slot);

      if (profile.waitingFor) {
        if (_this.context.getIsComponentMounted(profile.waitingFor)) {
          _this.context.refreshAds();
        }
      } else {
        _this.context.refreshAds();
      }
    };

    _this.slot = null;
    _this.slotId = null;
    _this.refreshed = false;
    _this.timeoutId = null;
    return _this;
  }

  (0, _createClass3.default)(AdSlot, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      if (!this.slotId && this.props.profile) {
        this.slotId = this.props.profile.name ? 'div-gpt-ad-' + this.props.profile.name + '-' + this.context.getAdCount() : 'div-gpt-ad-' + this.context.getAdCount();
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      var _props = this.props,
          profile = _props.profile,
          asyncInit = _props.asyncInit;


      if (!profile.path) {
        return;
      }

      if (asyncInit > 0) {
        this.timeoutId = setTimeout(function () {
          _this2.initSlot();
        }, asyncInit);
      } else {
        this.initSlot();
      }

      if (profile.multiSize && typeof window !== 'undefined') {
        window.addEventListener('resize', this.handleResize);
      }
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      // Due to props unable and won't change
      return false;
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      var _this3 = this;

      if (!this.slot) {
        return;
      }

      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      googletag.cmd.push(function () {
        googletag.pubads().clear([_this3.slot]);
      });

      if (this.props.profile.multiSize && typeof window !== 'undefined') {
        window.removeEventListener('resize', this.handleResize);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      if (!this.slotId) {
        return null;
      }

      var _props2 = this.props,
          profile = _props2.profile,
          lazyLoading = _props2.lazyLoading,
          lazyLoadingTopOffset = _props2.lazyLoadingTopOffset,
          lazyLoadingBottomOffset = _props2.lazyLoadingBottomOffset,
          className = _props2.className;

      var adStyles = {};
      var adClassNames = profile.className || className;

      if (profile.hideOnInitial) {
        adStyles.display = 'none';
      }

      if (lazyLoading) {
        return _react2.default.createElement(
          _reactWaypoint2.default,
          {
            key: 'waypoint=' + this.slotId,
            onEnter: this.refresh,
            topOffset: lazyLoadingTopOffset,
            bottomOffset: lazyLoadingBottomOffset
          },
          _react2.default.createElement(
            'div',
            { id: this.slotId + '-container', style: adStyles, className: adClassNames },
            _react2.default.createElement('div', { id: this.slotId })
          )
        );
      }

      return _react2.default.createElement(
        'div',
        { id: this.slotId + '-container', style: adStyles, className: adClassNames },
        _react2.default.createElement('div', { id: this.slotId })
      );
    }
  }]);
  return AdSlot;
}(_react.Component);

AdSlot.propTypes = {
  profile: ProfilePropType.isRequired,
  className: _propTypes2.default.string,
  asyncInit: _propTypes2.default.number,
  lazyLoading: _propTypes2.default.bool,
  lazyLoadingTopOffset: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string]),
  lazyLoadingBottomOffset: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string]),
  targetValue: _propTypes2.default.arrayOf(_propTypes2.default.string) // for DFP key-value pair
};
AdSlot.contextTypes = {
  getAdCount: _propTypes2.default.func,
  getIsComponentMounted: _propTypes2.default.func,
  addUnRefreshedAdCount: _propTypes2.default.func,
  addAdSlot: _propTypes2.default.func,
  refreshAds: _propTypes2.default.func,
  setIsSlotAdReady: _propTypes2.default.func
};
AdSlot.defaultProps = {
  asyncInit: 0,
  lazyLoading: true,
  lazyLoadingTopOffset: undefined,
  lazyLoadingBottomOffset: undefined,
  className: undefined,
  targetValue: undefined
};
exports.default = AdSlot;