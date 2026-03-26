import { convertToModelMessages } from "ai";

const uiMessage = {
  id: "test",
  role: "user",
  content: "hello",
};

try {
  const result = convertToModelMessages([uiMessage]);
  console.log("Result type:", typeof result);
  console.log("Is array:", Array.isArray(result));
  console.log("Result:", JSON.stringify(result, null, 2));
} catch (e) {
  console.error("Error:", e);
}
