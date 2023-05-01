import React, { useState } from "react";
import axios from "axios";
import { getHeaders } from "./requests";

export default function TokenPage() {
  const [inputValue, setInputValue] = useState("");
  const [tokenValue, setTokenValue] = useState(""); // 新增

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
      setTokenValue(tokenValue); // 更新 tokenValue 的值
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
      {tokenValue && <p>Token Value: {tokenValue}</p>}{" "}
      {/* 根据 tokenValue 是否有值来渲染展示 */}
    </div>
  );
}
