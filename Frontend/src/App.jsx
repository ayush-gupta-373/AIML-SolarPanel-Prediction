
import { useState } from "react";

function App() {
  const [message, setMessage] = useState("Click the button to test Express");
  const [loading, setLoading] = useState(false);

  async function testExpress() {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/");
      const data = await response.json();

      setMessage(data.message);
    } catch (error) {
      setMessage("Could not connect to Express. Check whether it is running.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>SolarAI</h1>
      <p>React Frontend → Express Backend</p>

      <button onClick={testExpress} disabled={loading}>
        {loading ? "Connecting..." : "Test Express Connection"}
      </button>
      
<button onClick={testPrediction}>
  Test Solar Prediction API
</button>

      <h3>{message}</h3>
    </div>
  );


async function testPrediction() {
  try {
    const response = await fetch(
      "http://localhost:5000/api/predict",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          temperature: 30,
          solar_irradiance: 800
        })
      }
    );

    const data = await response.json();
    console.log("Prediction response:", data);

    if (!response.ok) {
      throw new Error(data.error || "Prediction request failed");
    }

    setMessage(JSON.stringify(data));
  } catch (error) {
    setMessage(error.message);
  }
}
}
export default App;