// Track ongoing fetch requests
const ongoingRequests = new Set();

const originalFetch = window.fetch;
window.fetch = (...args) => {
  const controller = new AbortController();
  const signal = controller.signal;

  const request = originalFetch(...args, { signal });

  ongoingRequests.add({
    url: args[0],
    timestamp: Date.now(),
    stack: new Error().stack
  });

  request.finally(() => {
    ongoingRequests.delete(request);
  });

  return request;
};

// Utility to check ongoing requests
function checkOngoingRequests() {
  console.group('Ongoing Fetch Requests');
  console.table(Array.from(ongoingRequests).map(req => ({
    url: req.url,
    duration: `${(Date.now() - req.timestamp) / 1000}s`
  })));

  if (ongoingRequests.size > 0) {
    console.warn('Potential Fetch Leaks Detected');
    ongoingRequests.forEach(req => {
      console.log('Request Stack Trace:', req.stack);
    });
  }
  console.groupEnd();
}
