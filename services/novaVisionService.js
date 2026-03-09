const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
});

async function analyzeSceneWithNova(objects, fallback) {

  try {

    const objectList = objects.map(o => o.name).join(", ");

    const prompt = `
You are an AI navigation assistant helping a blind person walk safely.

Detected objects:
${objectList}

Fallback navigation guidance:
${fallback}

Provide a short safe navigation instruction.

Rules:
Maximum 20 words.
Focus on safety.
If obstacle very close say STOP.

Return only instruction.
`;

    const command = new InvokeModelCommand({

      modelId: "amazon.nova-lite-v1:0",

      contentType: "application/json",
      accept: "application/json",

      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: prompt }]
          }
        ]
      })

    });

    const response = await client.send(command);

    const result = JSON.parse(
      new TextDecoder().decode(response.body)
    );

    return result.output.message.content[0].text;

  } catch (error) {

    console.log("Nova failed, using fallback");

    return fallback;

  }

}

module.exports = { analyzeSceneWithNova };