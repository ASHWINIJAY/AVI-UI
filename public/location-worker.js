// Runs even when tab is inactive or minimized
setInterval(() => {
  postMessage("tick");
}, 15 * 60 * 1000); // every 5 minutes
