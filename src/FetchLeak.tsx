// FetchLeak.js
import React, { useState, useEffect } from "react";

// Simulate slow API call
const fetchData = () =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({ data: "Fetched data at " + new Date().toLocaleTimeString() }),
      3000
    )
  );

// This is a more realistic fetch function that accepts a signal
const fetchDataWithAbort = (signal) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () =>
        resolve({ data: "Fetched data at " + new Date().toLocaleTimeString() }),
      3000
    );

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

  useEffect(() => {
    console.log(`${fixed ? "Fixed" : "Leaky"} Fetch component mounted`);

    let isMounted = true;
    let controller;

    const loadData = async () => {
      if (fixed) {
        // Using AbortController in the fixed version
        controller = new AbortController();
        try {
          // Use the version that accepts a signal
          const result = await fetchDataWithAbort(controller.signal);

          // Prevent state update after unmount
          if (isMounted) {
            console.log("Fixed Fetch: Setting data after successful fetch");
            setData(result.data);
          }
        } catch (error) {
          if (error.name === "AbortError") {
            console.log("Fixed Fetch: Request was aborted");
          } else {
            if (isMounted) {
              console.log("Fixed Fetch: Error occurred");
              setData("Error fetching data");
            }
          }
        }
      } else {
        // No abort mechanism in the leaky version
        try {
          const result = await fetchData();
          // Memory leak: No check if component is still mounted
          console.log("Leaky Fetch: Setting data regardless of mount status");
          setData(result.data); // This might run after unmount
        } catch (error) {
          console.log("Leaky Fetch: Error occurred");
          setData("Error fetching data"); // This might run after unmount
        }
      }
    };

    loadData();

    return () => {
      console.log(`${fixed ? "Fixed" : "Leaky"} Fetch component unmounted`);
      if (fixed) {
        console.log(
          "Fixed Fetch: Cleaning up - aborting fetch and setting isMounted flag"
        );
        isMounted = false;
        if (controller) controller.abort();
      } else {
        console.log(
          "Leaky Fetch: Unmounted but fetch continues and may update state!"
        );
        // No cleanup - this can cause memory leaks and errors
      }
    };
  }, [fixed]);

  return (
    <div className="demo-component">
      <h3>{fixed ? "Fixed" : "Leaky"} Fetch Request</h3>
      <p>Data: {data}</p>
      <p className="explanation">
        {fixed
          ? "✅ This version uses AbortController and checks if the component is mounted before updating state"
          : "❌ PROBLEM: This component starts a fetch but doesn't abort it or check mount status before updating state"}
      </p>
      <p className="hint">Try unmounting during the 3-second loading period</p>
    </div>
  );
}

export default FetchLeak;
