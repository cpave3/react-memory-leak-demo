// App.js
import React, { useEffect, useState } from "react";
import LeakyComponent from "./LeakyComponent";
import FixedComponent from "./FixedComponent";
import EventListenerLeak from "./EventListenerLeak";
import IntervalLeak from "./IntervalLeak";
import FetchLeak from "./FetchLeak";

type DemoType = "interval" | "event" | "fetch" | "component";

function App() {
  const [showLeaky, setShowLeaky] = useState(false);
  const [showFixed, setShowFixed] = useState(false);
  // read the demo type from the url param
  const [demoType, setDemoType] = useState<DemoType>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return (urlParams.get("demoType") || "interval") as DemoType;
  });

  useEffect(() => {
    // update the url param
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("demoType", demoType);
    window.history.replaceState(null, "", "?" + urlParams.toString());
  }, [demoType]);

  const toggleLeaky = () => setShowLeaky(!showLeaky);
  const toggleFixed = () => setShowFixed(!showFixed);

  const renderDemo = () => {
    switch (demoType) {
      case "interval":
        return showLeaky ? <IntervalLeak /> : null;
      case "event":
        return showLeaky ? <EventListenerLeak /> : null;
      case "fetch":
        return showLeaky ? <FetchLeak /> : null;
      default:
        return showLeaky ? <LeakyComponent /> : null;
    }
  };

  const renderFixed = () => {
    switch (demoType) {
      case "interval":
        return showFixed ? <IntervalLeak fixed={true} /> : null;
      case "event":
        return showFixed ? <EventListenerLeak fixed={true} /> : null;
      case "fetch":
        return showFixed ? <FetchLeak fixed={true} /> : null;
      default:
        return showFixed ? <FixedComponent /> : null;
    }
  };

  return (
    <div className="App">
      <h1>React Memory Leak Demos</h1>

      <div className="controls">
        <div className="selector">
          <h3>Select Demo Type:</h3>
          <select
            value={demoType}
            onChange={(e) => setDemoType(e.target.value)}
          >
            <option value="interval">Interval Leak</option>
            <option value="event">Event Listener Leak</option>
            <option value="fetch">Fetch Abort Leak</option>
            <option value="component">Leaky Component</option>
          </select>
        </div>

        <div className="buttons">
          <button onClick={toggleLeaky} className={showLeaky ? "active" : ""}>
            {showLeaky ? "Unmount Leaky Component" : "Mount Leaky Component"}
          </button>

          <button onClick={toggleFixed} className={showFixed ? "active" : ""}>
            {showFixed ? "Unmount Fixed Component" : "Mount Fixed Component"}
          </button>
        </div>
      </div>

      <div className="components">
        <div className="component-container">
          <h2>❌ Leaky Implementation</h2>
          <div className="component-wrapper">{renderDemo()}</div>
        </div>

        <div className="component-container">
          <h2>✅ Fixed Implementation</h2>
          <div className="component-wrapper">{renderFixed()}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
