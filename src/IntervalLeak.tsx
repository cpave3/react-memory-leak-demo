// IntervalLeak.js
import React, { useState, useEffect } from "react";

function IntervalLeak({ fixed = false }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(`${fixed ? "Fixed" : "Leaky"} Interval component mounted`);

    // Set up interval that updates state
    const intervalId = setInterval(() => {
      console.log(`${fixed ? "Fixed" : "Leaky"} Interval tick: ${count}`);
      setCount((prev) => prev + 1);
    }, 1000);

    // Memory leak: Missing cleanup in the leaky version
    if (fixed) {
      return () => {
        console.log("Fixed Interval component unmounted, clearing interval");
        clearInterval(intervalId);
      };
    }

    return () => {
      console.log(
        "Leaky Interval component unmounted, but interval continues!"
      );
      // No clearInterval here - this causes a memory leak
    };
  }, []); // Note: using [] deps but referencing count - another subtle issue

  return (
    <div className="demo-component">
      <h3>{fixed ? "Fixed" : "Leaky"} Interval Counter</h3>
      <p>Count: {count}</p>
      <p className="explanation">
        {fixed
          ? "✅ This version properly clears the interval on unmount"
          : "❌ PROBLEM: This component creates an interval but doesn't clear it on unmount"}
      </p>
    </div>
  );
}

export default IntervalLeak;
