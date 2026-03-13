const {
  BedrockRuntimeClient,
  InvokeModelCommand
} = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION
});


async function analyzeSceneWithNova(objects) {

  try {

    if (!objects || objects.length === 0) {
      return "Path clear.";
    }

    const prompt = `
You are assisting a blind person.

Detected objects: ${objects.join(", ")}

Provide ONE short navigation instruction.
Maximum 12 words.
Focus on safety.
`;

    const command = new InvokeModelCommand({
      modelId: "amazon.nova-lite-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ]
      })
    });

    const response = await client.send(command);

    const result = JSON.parse(
      new TextDecoder().decode(response.body)
    );

    const text =
      result?.output?.message?.content?.[0]?.text;

    if (!text) {
      return null;
    }

    return text;

  } catch (error) {

    console.error("Nova error:", error);

    return null;

  }

}

module.exports = { analyzeSceneWithNova };