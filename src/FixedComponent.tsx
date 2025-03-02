// FixedComponent.js
import React, { useState, useEffect } from "react";

function FixedComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    console.log("Fixed Component mounted");

    // Only create and store what we need
    const newItems = Array(10)
      .fill()
      .map((_, i) => ({ id: i, value: `Item ${i}` }));
    setData(newItems);

    // No global/document references

    return () => {
      console.log("Fixed Component unmounted and properly cleaned up");
      // All local variables are garbage collected automatically
    };
  }, []);

  return (
    <div className="demo-component">
      <h3>Fixed Component</h3>
      <p>Displaying {data.length} items (only storing what we need)</p>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.value}</li>
        ))}
      </ul>
      <p className="explanation">
        ✅ This component only creates and stores the data it needs to display,
        and doesn't create any references that persist after unmounting
      </p>
    </div>
  );
}

export default FixedComponent;
