// EventListenerLeak.js
import React, { useState, useEffect } from "react";

function EventListenerLeak({ fixed = false }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    console.log(`${fixed ? "Fixed" : "Leaky"} EventListener component mounted`);

    // Define resize handler
    const handleResize = () => {
      console.log(`${fixed ? "Fixed" : "Leaky"} Window resize detected`);
      setWindowWidth(window.innerWidth);
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Memory leak: Missing cleanup in the leaky version
    if (fixed) {
      return () => {
        console.log(
          "Fixed EventListener component unmounted, removing event listener"
        );
        window.removeEventListener("resize", handleResize);
      };
    }

    return () => {
      console.log(
        "Leaky EventListener component unmounted, but listener remains!"
      );
      // No removeEventListener - this causes a memory leak
    };
  }, [fixed]);

  return (
    <div className="demo-component">
      <h3>{fixed ? "Fixed" : "Leaky"} Event Listener</h3>
      <p>Window width: {windowWidth}px</p>
      <p className="explanation">
        {fixed
          ? "✅ This version properly removes the event listener on unmount"
          : "❌ PROBLEM: This component adds a resize listener but doesn't remove it on unmount"}
      </p>
      <p className="hint">Try resizing your browser window after unmounting</p>
    </div>
  );
}

export default EventListenerLeak;
