// LeakyComponent.js - with exaggerated memory impact
import React, { useState, useEffect, useRef } from "react";

function LeakyComponent() {
  const [data, setData] = useState([]);
  // Create a ref to hold a massive amount of data
  const leakyArray = useRef([]);

  useEffect(() => {
    console.log("Leaky Component mounted");

    // Create a function that generates large objects
    const generateLargeObject = (id) => {
      // Create an object with a large string (approximately 1MB)
      const largeString = new Array(250000)
        .fill(`Large string ${id}`)
        .join(" ");
      return {
        id,
        value: `Item ${id}`,
        largeData: largeString,
        nestedData: {
          moreData: new Array(1000)
            .fill(0)
            .map((_, i) => ({ index: i, data: `Data point ${i}` })),
        },
      };
    };

    // Generate a few visible items
    const visibleItems = Array(10)
      .fill()
      .map((_, i) => ({ id: i, value: `Item ${i}` }));
    setData(visibleItems);

    // But store many large objects in memory (creating ~10MB of data each time)
    const generateLargeDataSet = () => {
      const newBatch = Array(10)
        .fill()
        .map((_, i) => generateLargeObject(leakyArray.current.length + i));
      leakyArray.current = [...leakyArray.current, ...newBatch];
      console.log(
        `Leaky array now has ${leakyArray.current.length
        } large objects (~${Math.round(leakyArray.current.length / 10)}MB)`
      );
    };

    // Generate initial batch
    generateLargeDataSet();

    // Keep adding data periodically to simulate a growing memory leak
    const dataGenerationInterval = setInterval(() => {
      generateLargeDataSet();
    }, 2000);

    // Create circular references with DOM
    const mainElement = document.querySelector("main") || document.body;
    if (mainElement) {
      // Store a reference to our component data in the DOM
      mainElement._leakyComponentData = {
        component: "LeakyComponent",
        ref: leakyArray,
        circular: {}, // Will create circular reference
      };

      // Create circular reference
      mainElement._leakyComponentData.circular.parent =
        mainElement._leakyComponentData;
    }

    return () => {
      console.log("Leaky Component unmounted, but references remain!");
      clearInterval(dataGenerationInterval);
      // We're not removing the DOM reference
      // The leaky array ref persists in memory
    };
  }, []);

  return (
    <div className="demo-component">
      <h3>Leaky Component</h3>
      <p>
        Displaying {data.length} items (storing {leakyArray.current.length}{" "}
        large objects in memory)
      </p>
      <p>
        Memory usage: ~{Math.round(leakyArray.current.length / 10)}MB and
        growing!
      </p>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.value}</li>
        ))}
      </ul>
      <p className="explanation">
        ❌ PROBLEM: This component creates large objects (~1MB each) every 2
        seconds, stores them in a ref, creates circular references, and doesn't
        clean up intervals
      </p>
    </div>
  );
}

export default LeakyComponent;
