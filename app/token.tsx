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
      const tokenValue = response.data.token;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(tokenValue);
        alert("Token copied to clipboard!");
      } else {
        // 如果浏览器不支持 Clipboard API，则使用 document.execCommand('copy') 方法
        const tempInput = document.createElement("input");
        tempInput.style.position = "fixed";
        tempInput.style.opacity = "0";
        tempInput.value = tokenValue;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        alert("Token copied to clipboard!");
      }
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
