// LeakyComponent.js
import React, { useState, useEffect, useRef } from "react";

function LeakyComponent() {
  const [data, setData] = useState([]);
  // This creates a large array on each render that's never cleaned up
  const leakyArray = useRef([]);

  useEffect(() => {
    console.log("Leaky Component mounted");

    // Simulate data coming in
    const newItems = Array(10000)
      .fill()
      .map((_, i) => ({ id: i, value: `Item ${i}` }));
    setData(newItems.slice(0, 10)); // Only display 10 items

    // But store all of them in a ref that persists even when component unmounts
    leakyArray.current = [...leakyArray.current, ...newItems];
    console.log(`Leaky array now has ${leakyArray.current.length} items`);

    // DOM reference leak
    const mainElement = document.querySelector("main");
    if (mainElement) {
      // Create a circular reference
      mainElement._leakyData = {
        component: "LeakyComponent",
        ref: leakyArray,
      };
    }

    return () => {
      console.log("Leaky Component unmounted, but references remain!");
      // The leakyArray ref still exists in memory
      // The mainElement._leakyData property still exists with a reference to leakyArray
    };
  }, []);

  return (
    <div className="demo-component">
      <h3>Leaky Component</h3>
      <p>
        Displaying {data.length} items (storing {leakyArray.current.length} in
        memory)
      </p>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.value}</li>
        ))}
      </ul>
      <p className="explanation">
        ❌ PROBLEM: This component creates a large array in a ref and creates
        circular references that aren't cleaned up when the component unmounts
      </p>
    </div>
  );
}

export default LeakyComponent;
