import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Define models with fallback options
const MODELS = {
    PRIMARY: "gemini-1.5-flash",
    FALLBACK: "gemini-pro", // Fallback to a more stable model
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // Start with 1 second delay

// Helper function to wait
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to generate content with retries and fallback
async function generateWithRetry(
    chat: any,
    message: string,
    retryCount = 0,
    useFallbackModel = false
) {
    try {
        const result = await chat.sendMessage(message);
        return result.response.text();
    } catch (error: any) {
        console.error(
            `Attempt ${retryCount + 1} failed:`,
            error.message || error
        );

        // Check if it's an overload error
        const isOverloaded =
            error.message?.includes("overloaded") ||
            error.message?.includes("503") ||
            error.status === 503;

        // If we haven't reached max retries, try again with exponential backoff
        if (retryCount < MAX_RETRIES) {
            const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
            console.log(`Retrying in ${delay}ms...`);
            await wait(delay);
            return generateWithRetry(
                chat,
                message,
                retryCount + 1,
                useFallbackModel
            );
        }
        // If we've exhausted retries but haven't tried fallback model yet
        else if (!useFallbackModel) {
            console.log("Switching to fallback model...");
            // Create a new chat with the fallback model
            const fallbackModel = genAI.getGenerativeModel({
                model: MODELS.FALLBACK,
            });
            const fallbackChat = fallbackModel.startChat({
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.9,
                    topK: 40,
                },
            });

            // Try with the fallback model
            return generateWithRetry(fallbackChat, message, 0, true);
        }

        // If all else fails, throw the error
        throw error;
    }
}

// Function to generate responses in both languages
async function generateBilingualResponse(messages: any[], modelName: string) {
    const model = genAI.getGenerativeModel({ model: modelName });

    // System prompts for each language
    const englishSystemPrompt =
        "You are a Bible teacher and sermon helper. Provide Biblical references and practical applications in your responses. Use proper markdown formatting for your responses, such as # for headings, * for emphasis, and > for quotes.";
    const hiligaynonSystemPrompt =
        "Ikaw isa ka manugtudlo sang Bibliya kag manugbulig sa paghimo sang sermon. Sabta ang mga pamangkot sa Hiligaynon. Maghatag sang Biblical nga mga reference kag practical nga mga application. Gamiton mo ang markdown formatting para sa imo mga sabat, pareho sang # para sa headings, * para sa emphasis, kag > para sa quotes.";

    // Convert messages to Gemini's chat format
    const chatHistory = messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
    }));

    // Create two chat sessions - one for English, one for Hiligaynon
    const englishChat = model.startChat({
        generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
        },
    });

    const hiligaynonChat = model.startChat({
        generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
        },
    });

    // Process the chat history sequentially for both languages
    if (chatHistory.length > 1) {
        // Send all messages except the last one to build up the conversation
        for (let i = 0; i < chatHistory.length - 1; i++) {
            const msg = chatHistory[i];
            if (msg.role === "user") {
                // For the first user message, prepend the system prompt
                const englishMessageText =
                    i === 0
                        ? `${englishSystemPrompt}\n\nUser query: ${msg.parts[0].text}`
                        : msg.parts[0].text;
                const hiligaynonMessageText =
                    i === 0
                        ? `${hiligaynonSystemPrompt}\n\nUser query: ${msg.parts[0].text}`
                        : msg.parts[0].text;

                await englishChat.sendMessage(englishMessageText);
                await hiligaynonChat.sendMessage(hiligaynonMessageText);
            }
        }
    }

    // Get the last message (the new user message)
    const lastMessage = chatHistory[chatHistory.length - 1];

    // Prepare the final user messages with appropriate system prompts if needed
    let englishUserMessage = lastMessage.parts[0].text;
    let hiligaynonUserMessage = lastMessage.parts[0].text;

    if (chatHistory.length === 1) {
        englishUserMessage = `${englishSystemPrompt}\n\nUser query: ${englishUserMessage}`;
        hiligaynonUserMessage = `${hiligaynonSystemPrompt}\n\nUser query: ${hiligaynonUserMessage}`;
    }

    // Add explicit instruction for Hiligaynon response
    hiligaynonUserMessage = `Please respond in Hiligaynon to this request: ${hiligaynonUserMessage}`;

    // Generate both responses in parallel
    const [englishResponse, hiligaynonResponse] = await Promise.all([
        generateWithRetry(englishChat, englishUserMessage),
        generateWithRetry(hiligaynonChat, hiligaynonUserMessage),
    ]);

    return {
        english: englishResponse,
        hiligaynon: hiligaynonResponse,
    };
}

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Select the model based on current state
        const modelName = MODELS.PRIMARY;
        console.log(`Using model: ${modelName}`);

        // Generate responses in both languages
        const responses = await generateBilingualResponse(messages, modelName);

        // Return both responses
        return Response.json({
            role: "assistant",
            content: {
                english: responses.english,
                hiligaynon: responses.hiligaynon,
            },
            model: modelName,
        });
    } catch (error: any) {
        console.error("Error generating response:", error);

        // Provide a more helpful error message
        let errorMessage = "Failed to generate response";
        let errorDetails = String(error);

        if (error.message?.includes("overloaded")) {
            errorMessage =
                "The AI service is currently experiencing high demand";
            errorDetails = "Please try again in a few moments";
        }

        return Response.json(
            {
                error: errorMessage,
                details: errorDetails,
                suggestion:
                    "You can try again with a simpler question or try later when the service is less busy.",
            },
            { status: 500 }
        );
    }
}
