import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function analyzeIssue(imageUrl: string, description: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            isCivicIssue: {
              type: SchemaType.BOOLEAN,
              description: "True if the image and description describe a genuine public civic issue (e.g. pothole, broken streetlight, garbage). False if it is a selfie, screenshot, indoor home issue, spam, or irrelevant.",
            },
            confidenceScore: {
              type: SchemaType.NUMBER,
              description: "A score from 0 to 100 representing how confident you are in your analysis.",
            },
            reasoning: {
              type: SchemaType.STRING,
              description: "A short, 1-2 sentence explanation of your decision.",
            },
            category: {
              type: SchemaType.STRING,
              description: "The category of the issue. Must be exactly one of: 'Roads & Infrastructure', 'Sanitation & Waste', 'Water & Sewage', 'Electrical & Lighting', 'Public Safety', 'Other'. If not a civic issue, use 'Other'.",
            },
            severity: {
              type: SchemaType.STRING,
              description: "The severity of the issue. Must be exactly one of: 'Low', 'Medium', 'High', 'Critical'. E.g. an open manhole on a busy street is Critical. A small pothole is Medium. If not a civic issue, use 'Low'.",
            },
            department: {
              type: SchemaType.STRING,
              description: "The municipal department responsible for this issue. E.g. 'Public Works', 'Sanitation Dept', 'Water Board', 'Electricity Board', 'Police/Safety'.",
            }
          },
          required: ["isCivicIssue", "confidenceScore", "reasoning", "category", "severity", "department"],
        },
      }
    });

    // Fetch the image and convert it to base64 for Gemini
    const imageResp = await fetch(imageUrl);
    const imageArrayBuffer = await imageResp.arrayBuffer();
    const imageBase64 = Buffer.from(imageArrayBuffer).toString('base64');
    const mimeType = imageResp.headers.get("content-type") || "image/jpeg";

    const prompt = `You are CORA, the Civic Operations & Resolution Assistant.
Analyze the following public civic issue reported by a citizen.

Citizen's Description: "${description}"

Determine if this is a valid public civic issue, categorize it, assign severity, and route to the correct department. Return strictly valid JSON matching the schema.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType
        }
      }
    ]);

    const text = result.response.text();
    return JSON.parse(text);

  } catch (error) {
    console.error("CORA Analysis failed:", error);
    throw new Error("AI Analysis failed. Please try again later.");
  }
}

export async function verifyResolution(
  originalImageUrl: string,
  resolvedImageUrl: string,
  description: string
) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash", 
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            isFixed: {
              type: SchemaType.BOOLEAN,
              description: "True if the issue described is successfully resolved/fixed in the second image AND both images show the same physical location. False if they show different locations, if the issue is still present, or if it is unresolvable.",
            },
            confidenceScore: {
              type: SchemaType.NUMBER,
              description: "A score from 0 to 100 on how confident you are in this verification.",
            },
            reasoning: {
              type: SchemaType.STRING,
              description: "A detailed 2-3 sentence analysis comparing key landmarks, pavement layout, walls, or trees in both photos to justify if it is indeed fixed and at the same location.",
            }
          },
          required: ["isFixed", "confidenceScore", "reasoning"],
        }
      }
    });

    // Fetch and base64 encode the original image
    const origResp = await fetch(originalImageUrl);
    const origBytes = await origResp.arrayBuffer();
    const origBase64 = Buffer.from(origBytes).toString("base64");
    const origMime = origResp.headers.get("content-type") || "image/jpeg";

    // Fetch and base64 encode the resolved image
    const resResp = await fetch(resolvedImageUrl);
    const resBytes = await resResp.arrayBuffer();
    const resBase64 = Buffer.from(resBytes).toString("base64");
    const resMime = resResp.headers.get("content-type") || "image/jpeg";

    const prompt = `You are CORA, the Civic Operations & Resolution Assistant.
Compare these two images to verify if the reported civic issue has been successfully resolved.

Citizen's Original Issue Description: "${description}"

We have provided two images:
1. The first image is the original issue reported (Before).
2. The second image is the resolution proof uploaded by the authority (After).

Perform a strict visual check. Ensure they represent the same location (compare buildings, streets, trees, or landmarks) and verify if the issue has been successfully fixed.
Return strictly valid JSON matching the schema.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: origBase64,
          mimeType: origMime
        }
      },
      {
        inlineData: {
          data: resBase64,
          mimeType: resMime
        }
      }
    ]);

    const text = result.response.text();
    return JSON.parse(text);

  } catch (error) {
    console.error("CORA Resolution Verification failed:", error);
    throw new Error("AI Resolution Verification failed. Please try again later.");
  }
}
