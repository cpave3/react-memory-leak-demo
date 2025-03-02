// EventListenerLeak.js - with exaggerated memory impact
import React, { useState, useEffect, useRef } from "react";

function EventListenerLeak({ fixed = false }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const memoryLog = useRef({ events: [] });

  useEffect(() => {
    console.log(`${fixed ? "Fixed" : "Leaky"} EventListener component mounted`);

    // Create a closure over a large data structure
    const largeData = new Array(100000).fill(0).map((_, i) => ({
      id: i,
      value: `Event data ${i}`,
      timestamp: Date.now(),
    }));

    // Define resize handler that captures the large data in its closure
    const handleResize = () => {
      console.log(`${fixed ? "Fixed" : "Leaky"} Window resize detected`);

      // Generate a large string based on the event and large data
      const eventRecord = {
        width: window.innerWidth,
        height: window.innerHeight,
        timestamp: Date.now(),
        // Create ~200KB of data per event
        details: new Array(50000)
          .fill(`Resize to ${window.innerWidth}x${window.innerHeight}`)
          .join(" "),
      };

      // In the leaky version, we keep growing this array
      memoryLog.current.events.push(eventRecord);

      // Access the large data to ensure it's captured in the closure
      console.log(
        `Total logged events: ${memoryLog.current.events.length}, Large data entries: ${largeData.length}`
      );

      setWindowWidth(window.innerWidth);

      // In the fixed version, limit the stored events
      if (fixed && memoryLog.current.events.length > 3) {
        memoryLog.current.events.shift();
      }
    };

    // Add multiple event listeners to exaggerate the issue
    const events = ["resize", "mousemove", "scroll"];

    events.forEach((eventType) => {
      window.addEventListener(eventType, handleResize, { passive: true });
    });

    // Memory leak: Missing cleanup in the leaky version
    if (fixed) {
      return () => {
        console.log(
          "Fixed EventListener component unmounted, removing event listeners"
        );
        events.forEach((eventType) => {
          window.removeEventListener(eventType, handleResize);
        });
        memoryLog.current.events = []; // Clear stored data
      };
    }

    return () => {
      console.log(
        "Leaky EventListener component unmounted, but listeners remain!"
      );
      // No removeEventListener - this causes a memory leak
    };
  }, [fixed]);

  const estimatedMemoryMB = (memoryLog.current.events.length * 0.2).toFixed(1);

  return (
    <div className="demo-component">
      <h3>{fixed ? "Fixed" : "Leaky"} Event Listener</h3>
      <p>Window width: {windowWidth}px</p>
      <p>
        Events captured: {memoryLog.current.events.length} (~{estimatedMemoryMB}
        MB)
      </p>
      <p className="explanation">
        {fixed
          ? "✅ This version properly removes multiple event listeners and limits stored data"
          : "❌ PROBLEM: Adds multiple event listeners with closures over large data (~10MB) and captures ~200KB per event"}
      </p>
      <p className="hint">
        Move your mouse, scroll, or resize the window to see memory growth
      </p>
    </div>
  );
}

export default EventListenerLeak;
