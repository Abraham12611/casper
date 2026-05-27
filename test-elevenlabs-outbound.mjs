const apiKey = "sk_e8dbe397f8b81682f09b218fd8393b0dda1825cc22b81066";
const fromNumberId = "phnum_4901ksj3ph4dezqv3jwcqp0482s9";
const agentId = "agent_1501ksj0r4fkfkrb5zk74mbmdggb";
const toNumber = "+13855938037";

const dynamicVariables = {
  agency_name: "Lumina Search",
  agency_summary: "Lumina Search helps businesses achieve their goals through professional local SEO services.",
  agency_core_offer: "Architectural Local SEO Dominance",
  caller_name: "Abraham",
  company_name: "Lumina Search Demo",
  fit_reason: "some gaps in your local SEO presence",
  available_slots: "Tuesday 10:00 AM - 12:00 PM Pacific Time",
  available_slots_short: "Tuesday 10:00-12:00",
};

async function testCall() {
  console.log("Initiating outbound call request to ElevenLabs...");
  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/twilio/outbound-call",
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
          agent_phone_number_id: fromNumberId,
          to_number: toNumber,
          conversation_initiation_client_data: {
            dynamic_variables: dynamicVariables,
          },
        }),
      }
    );

    console.log("HTTP Status Code:", response.status);
    console.log("HTTP Headers:", JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

    const responseText = await response.text();
    console.log("Raw Response Body:");
    console.log(responseText);

    try {
      const data = JSON.parse(responseText);
      console.log("Parsed JSON:", JSON.stringify(data, null, 2));
    } catch (e) {
      console.log("Failed to parse response body as JSON.");
    }
  } catch (err) {
    console.error("Request Error:", err);
  }
}

testCall();
