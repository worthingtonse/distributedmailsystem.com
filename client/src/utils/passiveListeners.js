// Passive Event Listeners Utility
// Add this to your main.jsx or create a separate utils file

/**
 * This utility adds passive event listeners to improve scrolling performance
 * Addresses Lighthouse warning: "Does not use passive listeners to improve scrolling performance"
 */

// Override addEventListener to make touch and wheel events passive by default
if (typeof window !== 'undefined') {
  // Store the original addEventListener
  const originalAddEventListener = EventTarget.prototype.addEventListener;

  // List of events that should be passive by default
  const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'mousewheel'];

  // Override addEventListener
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    // Check if this is a passive event and options is not explicitly set
    if (passiveEvents.includes(type)) {
      // If options is undefined or a boolean, convert to object with passive: true
      if (typeof options === 'boolean' || options === undefined) {
        options = {
          capture: typeof options === 'boolean' ? options : false,
          passive: true,
        };
      } 
      // If options is an object and passive is not explicitly set to false
      else if (typeof options === 'object' && options.passive !== false) {
        options.passive = true;
      }
    }

    // Call the original addEventListener with modified options
    return originalAddEventListener.call(this, type, listener, options);
  };
}

export default function setupPassiveListeners() {
  // This function can be called in main.jsx to ensure it's executed early
  console.log('Passive event listeners configured');
}