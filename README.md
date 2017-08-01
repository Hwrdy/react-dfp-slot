# react-dfp-slot


A React component library to execute Google DFP logic.


## Getting started

1. Install package

	```bash
	yarn add react-dfp-slot
	```
	
	or 
	
	```bash
	npm install react-dfp-slot
	```

2. Set the DFP provider

	```jsx
	// App.js
	import { DFPProvider } from 'react-dfp-slot';
	
	render() {
	  return (
	    <DFPProvider>
	  	   <section className={appClassName}>
	  	     ...
	  	   </section>
	    </DFPProvider>
	  );
	}
	
	```

3. Add AdSlot component with profile

	```jsx
	import { AdSlot } from 'react-dfp-slot';
	
	class SomeComponent extends Component {
	  ...
	  render() {
	    return (
	      <section className="some-component-main">
	        ...
	        <AdSlot
	          profile={{
	            path: '/1000000/adunit',
	            size: ['fluid'],
	            waitingFor: 'detail',
	            hideOnInitial: true,
	            className: 'native-style',
	          }}
	        />
	      </section>
	    );
	  }
	}
	```


## DFPProvider

### Child context

```jsx
  getChildContext() {
    return {
      getIsSlotAdReady: this.getIsSlotAdReady,
      setIsSlotAdReady: this.setIsSlotAdReady,
      getIsComponentMounted: this.getIsComponentMounted,
      setIsComponentMounted: this.setIsComponentMounted,
      refreshAds: this.refreshAds,
      clearAdSlots: this.clearAdSlots,
    };
  }
``` 

#### getIsSlotAdReady(slotName)
Get target slot is ready to display or not

- slotName (string): target slot name

#### setIsSlotAdReady(slotName, isReady)
Set target slot is ready to display or not

- slotName (string): target slot name
- isReady (bool)

#### getIsComponentMounted(complonentName)
Get target component is mounted or not

- componentName (string): target component name

#### setIsComponentMounted(complonentName, doRefreshAd)
Set target component is mounted or not

- componentName (string): target component name
- doRefreshAd (bool)

#### refreshAds()
Refresh all unrefreshed slots

#### clearAds()
Clear all unrefreshed slots

---

### Props
```jsx
propTypes: {   
  /**
   * Enables or disables collapsing of slot divs so that they don't
   * take up any space on the page when there is no ad content to display.
   */
  collapseEmptyDivs: ProTypes.bool,

  /**
   * Event handler for slotRenderEnded event.
   */
  onSlotRenderEnded: PropTypes.func,
},
```

#### onSlotRenderEnded(provider, event)

- provider: child context from DFPProvider
- event: [GPT event](https://developers.google.com/doubleclick-gpt/reference#googletageventsslotrenderendedevent)
	
	
```js
// example
handleSlotRenderEnded = (provider, event) => {
    const adElement = document.getElementById(`${event.slot.getSlotElementId()}-container`);
	
    switch (event.slot.getAdUnitPath()) {
      case AdProfiles.idleBannerCenter.path: {
        provider.setIsSlotAdReady(AdProfiles.idleBannerCenter.name, !event.isEmpty);
        break;
      }
      default:
        break;
    }
	
    if (event.isEmpty && adElement) {
      adElement.style.display = 'block';
    }
};
```


## AdSlot

### Props
```js
  // [300, 250], [[300, 250], 'fluid'], ['fluid]
  const SIZE_TYPE = PropTypes.arrayOf(
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
  
  
  const ProfilePropType = PropTypes.shape({
    path: PropTypes.string,           // DFP code
    name: PropTypes.string,           // slot name
    size: SIZE_TYPE,                  // slot size
    multiSize: MULTI_SIZE_TYPE,       // responsive size mapping
    multiSizeHandler: PropTypes.func, // responsive handler
    waitingFor: PropTypes.string,     // refresh ads after component didmount
    hideOnInitial: PropTypes.bool,    // set display: none; on initial
  });
  
  propTypes: {   
    // Profile data for slot
    profile: ProfilePropType.isRequired,
    
    // class name
    className: PropTypes.string,
    
    // Init slot after specific millisecond
    asyncInit: PropTypes.number,
    
    // use lazyLoading mode
    lazyLoading: PropTypes.bool,
    
    /**
     * `topOffset` can either be a number, in which case its a distance from the
     * top of the container in pixels, or a string value. Valid string values are
     * of the form "20px", which is parsed as pixels, or "20%", which is parsed
     * as a percentage of the height of the containing element.
     * For instance, if you pass "-20%", and the containing element is 100px tall,
     * then the waypoint will be triggered when it has been scrolled 20px beyond
     * the top of the containing element.
     */
    lazyLoadingTopOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    
    /**
     * `bottomOffset` is like `topOffset`, but for the bottom of the container.
     */
    lazyLoadingBottomOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    
    // DFP setTargeting
    targetValue: PropTypes.arrayOf(PropTypes.string),

  },
```
