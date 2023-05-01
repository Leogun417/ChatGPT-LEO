import React, { useState } from "react";
import axios from "axios";
import { getHeaders } from "./requests";

export default function TokenPage() {
  const [inputValue, setInputValue] = useState("");
  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "/api/gentoken",
        { hours: inputValue },
        {
          headers: getHeaders(),
        },
      );
      alert(response.data.token);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
