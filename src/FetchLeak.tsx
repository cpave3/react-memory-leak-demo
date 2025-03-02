// FetchLeak.js - with exaggerated memory impact
import React, { useState, useEffect, useRef } from "react";

// Simulate slow API call that returns large data
const fetchLargeData = () =>
  new Promise((resolve) =>
    setTimeout(() => {
      // Create ~5MB of data
      const largeResponse = {
        timestamp: Date.now(),
        data: "Fetched data at " + new Date().toLocaleTimeString(),
        details: new Array(1250000).fill("Large response data").join(" "),
        records: Array(10000)
          .fill(0)
          .map((_, i) => ({
            id: i,
            value: `Record ${i}`,
            metadata: `Metadata for record ${i} with timestamp ${Date.now()}`,
          })),
      };
      resolve(largeResponse);
    }, 3000)
  );

// Version that accepts abort signal
const fetchLargeDataWithAbort = (signal) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      // Create ~5MB of data, same as above
      const largeResponse = {
        timestamp: Date.now(),
        data: "Fetched data at " + new Date().toLocaleTimeString(),
        details: new Array(1250000).fill("Large response data").join(" "),
        records: Array(10000)
          .fill(0)
          .map((_, i) => ({
            id: i,
            value: `Record ${i}`,
            metadata: `Metadata for record ${i} with timestamp ${Date.now()}`,
          })),
      };
      resolve(largeResponse);
    }, 3000);

    // Handle abort signal
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      });
    }
  });

function FetchLeak({ fixed = false }) {
  const [data, setData] = useState("Loading...");
  const requestLog = useRef({ responses: [] });

  useEffect(() => {
    console.log(`${fixed ? "Fixed" : "Leaky"} Fetch component mounted`);

    let isMounted = true;
    let controller;

    // Function to start repeated fetches to exaggerate memory usage
    const startFetching = () => {
      const loadData = async () => {
        if (fixed) {
          // Using AbortController in the fixed version
          controller = new AbortController();
          try {
            console.log("Fixed Fetch: Starting fetch request");
            const result = await fetchLargeDataWithAbort(controller.signal);

            // Prevent state update after unmount
            if (isMounted) {
              console.log("Fixed Fetch: Setting data after successful fetch");
              setData(result.data);

              // Store only basic info about the response
              requestLog.current.responses.push({
                time: new Date().toLocaleTimeString(),
                status: "success",
                dataSize: "~5MB",
              });

              // Limit stored responses in the fixed version
              if (requestLog.current.responses.length > 2) {
                requestLog.current.responses.shift();
              }
            }
          } catch (error) {
            if (error.name === "AbortError") {
              console.log("Fixed Fetch: Request was aborted");
            } else if (isMounted) {
              console.log("Fixed Fetch: Error occurred");
              setData("Error fetching data");
            }
          }
        } else {
          // No abort mechanism in the leaky version
          try {
            console.log("Leaky Fetch: Starting fetch request");
            const result = await fetchLargeData();

            // Memory leak: No check if component is still mounted
            console.log("Leaky Fetch: Setting data regardless of mount status");
            setData(result.data);

            // Store the entire response in memory
            requestLog.current.responses.push(result); // Store ~5MB per request
            console.log(
              `Leaky Fetch: Stored ${requestLog.current.responses.length} responses in memory`
            );

            // Continue fetching every few seconds to exaggerate the leak
            setTimeout(startFetching, 5000);
          } catch (error) {
            console.log("Leaky Fetch: Error occurred");
            setData("Error fetching data");
          }
        }
      };

      loadData();
    };

    // Start the initial fetch
    startFetching();

    return () => {
      console.log(`${fixed ? "Fixed" : "Leaky"} Fetch component unmounted`);
      if (fixed) {
        console.log(
          "Fixed Fetch: Cleaning up - aborting fetch and setting isMounted flag"
        );
        isMounted = false;
        if (controller) controller.abort();
        requestLog.current.responses = []; // Clear stored data
      } else {
        console.log(
          "Leaky Fetch: Unmounted but fetch continues and may update state!"
        );
        // No cleanup - fetches will continue and memory keeps growing
      }
    };
  }, [fixed]);

  // Calculate estimated memory usage based on responses
  const estimatedMemoryMB = fixed
    ? (requestLog.current.responses.length * 0.01).toFixed(1) // Fixed stores minimal data
    : (requestLog.current.responses.length * 5).toFixed(1); // Leaky stores ~5MB per response

  return (
    <div className="demo-component">
      <h3>{fixed ? "Fixed" : "Leaky"} Fetch Request</h3>
      <p>Data: {data}</p>
      <p>
        Responses in memory: {requestLog.current.responses.length} (~
        {estimatedMemoryMB}MB)
        {!fixed && requestLog.current.responses.length > 0 && " and growing!"}
      </p>
      <p className="explanation">
        {fixed
          ? "✅ This version uses AbortController, checks mount status, and limits stored data"
          : "❌ PROBLEM: Continuously fetches large data (~5MB per response), stores all responses, and continues after unmount"}
      </p>
      <p className="hint">
        Try unmounting during loading or after a few responses have accumulated
      </p>
    </div>
  );
}

export default FetchLeak;
