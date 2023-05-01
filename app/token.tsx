import React, { useState } from "react";
import axios from "axios";
import { getHeaders } from "./requests";

const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );

const copyToClipboard = async (text) => {
  try {
    if (!text) return;
    if (isMobile) {
      const tempInput = document.createElement("input");
      tempInput.style.position = "absolute";
      tempInput.style.left = "-1000px";
      tempInput.style.top = "-1000px";
      tempInput.value = text;
      document.body.appendChild(tempInput);
      const range = document.createRange();
      range.selectNodeContents(tempInput);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      tempInput.setSelectionRange(0, 99999); // 移动端必须手动选中文本
      document.execCommand("copy");
      document.body.removeChild(tempInput);
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const tempInput = document.createElement("input");
      tempInput.style.position = "fixed";
      tempInput.style.opacity = "0";
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
    }
    alert("Text copied to clipboard!");
  } catch (error) {
    console.error(error);
  }
};

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
      copyToClipboard(tokenValue);
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
