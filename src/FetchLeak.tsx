import React, { useState, useEffect, useRef } from 'react';

function FetchLeak({ fixed = false }) {
  const [data, setData] = useState('Loading...');
  const fetchCount = useRef(0);
  const requestLog = useRef({ responses: [] });

  useEffect(() => {
    console.log(`${fixed ? 'Fixed' : 'Leaky'} Fetch component mounted`);

    let isMounted = true;
    let controller;

    const fetchData = async () => {
      try {
        controller = new AbortController();
        const signal = controller.signal;

        // Use a stable API that returns consistent data
        const response = await fetch(
          'https://httpbin.org/delay/5',
          {
            signal: fixed ? signal : undefined,
            // Add some extra headers to simulate a more complex request
            headers: {
              'X-Custom-Header': `Request-${fetchCount.current}`,
              'Cache-Control': 'no-cache'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();

        if (isMounted) {
          fetchCount.current++;

          // In the leaky version, we store the entire response
          if (!fixed) {
            // Store the full response, creating memory pressure
            requestLog.current.responses.push({
              id: fetchCount.current,
              fullResponse: result,
              // Create some additional memory pressure
              largeData: new Array(10000).fill(`Extra data for request ${fetchCount.current}`)
            });

            // Continue fetching if in leaky mode
            setTimeout(() => {
              if (isMounted) fetchData();
            }, 2000);
          } else {
            // In fixed version, only store minimal info
            requestLog.current.responses.push({
              id: fetchCount.current,
              title: result.url
            });

            // Limit stored responses in fixed version
            if (requestLog.current.responses.length > 3) {
              requestLog.current.responses.shift();
            }
          }

          setData(result.url);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
        } else if (isMounted) {
          console.error('Fetch error:', error);
          setData('Error fetching data');
        }
      }
    };

    // Start initial fetch
    fetchData();

    return () => {
      console.log(`${fixed ? 'Fixed' : 'Leaky'} Fetch component unmounted`);
      isMounted = false;

      // Abort any ongoing fetch in the fixed version
      if (controller) {
        controller.abort();
      }

      // Clear stored data in fixed version
      if (fixed) {
        requestLog.current.responses = [];
      }
    };
  }, [fixed]);

  // Calculate estimated memory usage
  const estimatedMemoryMB = fixed
    ? (requestLog.current.responses.length * 0.01).toFixed(1)
    : (requestLog.current.responses.length * 0.5).toFixed(1);

  return (
    <div className="demo-component">
      <h3>{fixed ? 'Fixed' : 'Leaky'} Fetch Request</h3>
      <p>Fetched Data: {data}</p>
      <p>Responses in memory: {requestLog.current.responses.length} (~{estimatedMemoryMB}MB)
        {!fixed && requestLog.current.responses.length > 0 && " and growing!"}
      </p>
      <p className="explanation">
        {fixed ? (
          "✅ This version uses AbortController, checks mount status, and limits stored data"
        ) : (
          "❌ PROBLEM: Continuously fetches data, stores full responses, and continues after unmount"
        )}
      </p>
      <p className="hint">Try unmounting during loading or after a few responses</p>
    </div>
  );
}

export default FetchLeak;
