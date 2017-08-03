import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Waypoint from 'react-waypoint';

// [300, 250], [[300, 250], 'fluid'], ['fluid]
const AD_SIZE_TYPE = PropTypes.arrayOf(
  PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.number), PropTypes.string, PropTypes.number]),
);

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
const MULTI_SIZE_TYPE = PropTypes.arrayOf(PropTypes.arrayOf(AD_SIZE_TYPE));

export const ProfilePropType = PropTypes.shape({
  path: PropTypes.string,
  name: PropTypes.string,
  size: AD_SIZE_TYPE,
  multiSize: MULTI_SIZE_TYPE,
  multiSizeHandler: PropTypes.func,
  waitingFor: PropTypes.string,
  hideOnInitial: PropTypes.bool,
});

export default class AdSlot extends Component {
  static propTypes = {
    profile: ProfilePropType.isRequired,
    className: PropTypes.string,
    asyncInit: PropTypes.number,
    lazyLoading: PropTypes.bool,
    lazyLoadingTopOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    lazyLoadingBottomOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    targetValue: PropTypes.arrayOf(PropTypes.string), // for DFP key-value pair
  };

  static contextTypes = {
    getAdCount: PropTypes.func,
    getIsComponentMounted: PropTypes.func,
    addUnRefreshedAdCount: PropTypes.func,
    addAdSlot: PropTypes.func,
    refreshAds: PropTypes.func,
    setIsSlotAdReady: PropTypes.func,
  };

  static defaultProps = {
    asyncInit: 0,
    lazyLoading: true,
    lazyLoadingTopOffset: undefined,
    lazyLoadingBottomOffset: undefined,
    className: undefined,
    targetValue: undefined,
  };

  constructor(props) {
    super(props);

    this.slot = null;
    this.slotId = null;
    this.refreshed = false;
    this.timeoutId = null;
  }

  componentWillMount() {
    if (!this.slotId) {
      this.slotId = this.props.profile.name ?
        `div-gpt-ad-${this.props.profile.name}-${this.context.getAdCount()}` :
        `div-gpt-ad-${this.context.getAdCount()}`;
    }
  }

  componentDidMount() {
    const { profile, asyncInit } = this.props;

    if (!profile.path) {
      return;
    }

    if (asyncInit > 0) {
      this.timeoutId = setTimeout(() => {
        this.initSlot();
      }, asyncInit);
    } else {
      this.initSlot();
    }

    if (profile.multiSize && typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize);
    }
  }

  shouldComponentUpdate() {
    // Due to props unable and won't change
    return false;
  }

  componentWillUnmount() {
    if (!this.slot) {
      return;
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    googletag.cmd.push(() => {
      googletag.pubads().clear([this.slot]);
    });

    if (this.props.profile.multiSize && typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
    }
  }

  handleResize = () => {
    this.props.profile.multiSizeHandler(this);
  };

  initSlot = () => {
    const { slotId } = this;
    const { profile, targetValue, lazyLoading } = this.props;

    googletag.cmd.push(() => {
      if (profile.multiSize) {
        const size = profile.multiSize.map(item => item[1]);
        let mapping = googletag.sizeMapping();

        for (let i = 0; i < profile.multiSize.length; i += 1) {
          mapping = mapping.addSize(profile.multiSize[i][0], profile.multiSize[i][1]);
        }

        mapping = mapping.build();

        this.slot = googletag
          .defineSlot(profile.path, size, slotId)
          .defineSizeMapping(mapping)
          .addService(googletag.pubads());
      } else {
        this.slot = googletag.defineSlot(profile.path, profile.size, slotId).addService(googletag.pubads());
      }

      if (profile.targetKey && targetValue) {
        this.slot.setTargeting(profile.targetKey, targetValue);
      }

      googletag.display(slotId);

      if (!lazyLoading) {
        this.refresh();
      }
    });
  };

  refresh = () => {
    const { profile } = this.props;

    if (!profile || this.refreshed) {
      return;
    }

    if (this.slot === null) {
      setTimeout(this.refresh, 100);

      return;
    }

    this.refreshed = true;
    this.context.addUnRefreshedAdCount();
    this.context.addAdSlot(this.slot);

    if (profile.waitingFor) {
      if (this.context.getIsComponentMounted(profile.waitingFor)) {
        this.context.refreshAds();
      }
    } else {
      this.context.refreshAds();
    }
  };

  render() {
    if (!this.slotId) {
      return null;
    }

    const { profile, lazyLoading, lazyLoadingTopOffset, lazyLoadingBottomOffset, className } = this.props;
    const adStyles = {};
    const adClassNames = profile.className || className || 'cnyes-dfp-banner';

    if (profile.hideOnInitial) {
      adStyles.display = 'none';
    }

    if (lazyLoading) {
      return (
        <Waypoint
          key={`waypoint=${this.slotId}`}
          onEnter={this.refresh}
          topOffset={lazyLoadingTopOffset}
          bottomOffset={lazyLoadingBottomOffset}
        >
          <div id={`${this.slotId}-container`} style={adStyles} className={adClassNames}>
            <div id={this.slotId} />
          </div>
        </Waypoint>
      );
    }

    return (
      <div id={`${this.slotId}-container`} style={adStyles} className={adClassNames}>
        <div id={this.slotId} />
      </div>
    );
  }
}
