// IntervalLeak.js - with exaggerated memory impact
import React, { useState, useEffect, useRef } from "react";

function IntervalLeak({ fixed = false }) {
  const [count, setCount] = useState(0);
  const memoryUsage = useRef({ dataPoints: [] });

  useEffect(() => {
    console.log(`${fixed ? "Fixed" : "Leaky"} Interval component mounted`);

    // Function to generate large data on each tick
    const generateLargeData = () => {
      // Create ~500KB of data each time
      const newData = new Array(125000)
        .fill(`Data point at count: ${count}`)
        .join(" ");

      if (!fixed) {
        // In leaky version, keep adding to array without bounds
        memoryUsage.current.dataPoints.push(newData);
        console.log(
          `Leaky Interval memory usage: ~${Math.round(
            memoryUsage.current.dataPoints.length * 0.5
          )}MB`
        );
      } else {
        // In fixed version, only keep the last 2 data points
        memoryUsage.current.dataPoints.push(newData);
        if (memoryUsage.current.dataPoints.length > 2) {
          memoryUsage.current.dataPoints.shift();
        }
        console.log(
          `Fixed Interval memory usage: ~${Math.round(
            memoryUsage.current.dataPoints.length * 0.5
          )}MB (limited)`
        );
      }
    };

    // Set up interval that updates state and generates large data
    const intervalId = setInterval(() => {
      console.log(`${fixed ? "Fixed" : "Leaky"} Interval tick: ${count}`);
      setCount((prev) => prev + 1);
      generateLargeData();
    }, 1000);

    // Memory leak: Missing cleanup in the leaky version
    if (fixed) {
      return () => {
        console.log(
          "Fixed Interval component unmounted, clearing interval and data"
        );
        clearInterval(intervalId);
        memoryUsage.current.dataPoints = []; // Clear data
      };
    }

    return () => {
      console.log(
        "Leaky Interval component unmounted, but interval continues!"
      );
      // No clearInterval here - this causes a memory leak
      // Data continues to accumulate
    };
  }, []); // Note: using [] deps but accessing count inside - this is intentional to show the issue

  return (
    <div className="demo-component">
      <h3>{fixed ? "Fixed" : "Leaky"} Interval Counter</h3>
      <p>Count: {count}</p>
      <p>
        Memory usage: ~{Math.round(memoryUsage.current.dataPoints.length * 0.5)}
        MB
        {!fixed && count > 0 && " and growing!"}
      </p>
      <p className="explanation">
        {fixed
          ? "✅ This version properly clears the interval on unmount and limits stored data"
          : "❌ PROBLEM: This component creates an interval, accumulates large data (~500KB) each second, and doesn't clean up"}
      </p>
    </div>
  );
}

export default IntervalLeak;
