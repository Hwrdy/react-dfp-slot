import { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';

export default class DFPProvider extends Component {
  static childContextTypes = {
    getAdCount: PropTypes.func,
    getIsAdReady: PropTypes.func,
    setIsAdReady: PropTypes.func,
    getComponentMounted: PropTypes.func,
    setComponentMounted: PropTypes.func,
    addAdSlot: PropTypes.func,
    addUnRefreshedAdCount: PropTypes.func,
    refreshAds: PropTypes.func,
    clearAdSlots: PropTypes.func,
  };

  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]).isRequired,
    collapseEmptyDivs: PropTypes.bool,
    onSlotRenderEnded: PropTypes.func,
  };

  static defaultProps = {
    collapseEmptyDivs: false,
    onSlotRenderEnded: undefined,
  };

  static InitGPT(collapseEmptyDivs = false) {
    googletag.cmd.push(() => {
      googletag.pubads().disableInitialLoad();
      googletag.pubads().enableAsyncRendering();
      googletag.pubads().enableSingleRequest();

      if (collapseEmptyDivs) {
        googletag.pubads().collapseEmptyDivs();
      }

      googletag.enableServices();
    });
  }

  constructor(props) {
    super(props);

    this.adCount = 0;
    this.unRefreshedAdCount = 0;
    this.isGPTInitialized = false;
    this.adSlots = [];
    this.adState = {};
    this.mountedComponents = {};
  }

  getChildContext() {
    return {
      getAdCount: this.getAdCount,
      getIsAdReady: this.getIsAdReady,
      setIsAdReady: this.setIsAdReady,
      getComponentMounted: this.getComponentMounted,
      setComponentMounted: this.setComponentMounted,
      addAdSlot: this.addAdSlot,
      addUnRefreshedAdCount: this.addUnRefreshedAdCount,
      refreshAds: this.refreshAds,
      clearAdSlots: this.clearAdSlots,
    };
  }

  componentWillMount() {
    if (typeof window !== 'undefined' && !this.isGPTInitialized) {
      this.constructor.InitGPT(this.props.collapseEmptyDivs);
    }
  }

  componentDidMount() {
    const { onSlotRenderEnded } = this.props;

    if (googletag && onSlotRenderEnded) {
      googletag.cmd.push(() => {
        googletag.pubads().addEventListener('slotRenderEnded', event => {
          onSlotRenderEnded(this, event);
        });
      });
    }
  }

  getAdCount = () => {
    this.adCount = this.adCount + 1;

    return this.adCount;
  }

  getIsAdReady = adType => this.adState[`type-${adType}`];

  setIsAdReady = (adType = undefined, isReady = false) => {
    if (adType) {
      this.adState[`type-${adType}`] = isReady;
    }
  };

  getComponentMounted = componentName => componentName && this.mountedComponents[componentName];

  setComponentMounted = (componentName, isMounted) => {
    if (componentName) {
      this.mountedComponents[componentName] = isMounted;
    }
  };

  addUnRefreshedAdCount = () => {
    this.unRefreshedAdCount = this.unRefreshedAdCount + 1;
  };

  addAdSlot = slot => {
    this.adSlots.push(slot);
  };

  addUnRefreshedAdCount = () => {
    this.unRefreshedAdCount = this.unRefreshedAdCount + 1;
  };

  refreshAds = debounce(() => {
    let result = false;

    if (googletag && this.unRefreshedAdCount > 0) {
      if (this.unRefreshedAdCount === this.adSlots.length) {
        this.unRefreshedAdCount = 0;

        result = googletag.cmd.push(() => {
          googletag.pubads().refresh(this.adSlots);
        });

        this.adSlots = [];
      } else {
        setTimeout(this.refreshAds, 100);
      }
    }

    return result;
  }, 100);

  clearAdSlots = () => {
    if (googletag) {
      let result = false;

      googletag.cmd.push(() => {
        result = googletag.pubads().clear(this.adSlots);
      });

      this.unRefreshedAdCount = 0;
      this.adSlots = [];

      return result;
    }

    return false;
  };

  render() {
    return this.props.children;
  }
}
