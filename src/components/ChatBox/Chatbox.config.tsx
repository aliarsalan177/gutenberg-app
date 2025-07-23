import type { AnalyzeBookResult } from "@/types";
import { useMutation } from "@tanstack/react-query";

const GUTENBERG_TEXT_URL = (bookId: string) =>
    `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;

const GUTENBERG_META_URL = (bookId: string) =>
    `https://www.gutenberg.org/ebooks/${bookId}`;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const analyzeBook = async (
    bookId: string
): Promise<AnalyzeBookResult> => {
    const [textRes, metaRes] = await Promise.all([
        fetch(GUTENBERG_TEXT_URL(bookId)),
        fetch(GUTENBERG_META_URL(bookId)),
    ]);

    const prompt = await textRes.text();
    const metaHtml = await metaRes.text();

    const title = metaHtml.match(/<title>(.*?)<\/title>/)?.[1] || "";
    const author =
        metaHtml.match(/<meta name="author" content="(.*?)"/)?.[1] || "";

    const llmRes = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [
                {
                    role: "user",
                    content: `Analyze the following book and identify the key characters. Then, return a JSON object with "nodes", "sampleQuotes", "links", and a "characterNetwork" summary for interactions in the following format:

{
  "nodes": [{ "id": "Character Name" }],
  "links": [
    {
      "source": "Character A",
      "target": "Character B",
      "interactionType": "conflict | alliance | dialogue | mention"
    }
  ],
  "sampleQuotes": [
    {
      "character": "Character Name",
      "line": "Quote text",
      "sentiment": "Positive | Negative | Neutral",
      "context": "Brief description of what the quote is about or what is happening"
    }
  ],
  "characterNetwork": [
    "Character A (Total Interactions): Character B (N), Character C (N)..."
  ]
}

- "interactionType" should classify the relationship or exchange between characters (e.g. whether it’s a conflict, alliance, dialogue, or one simply mentions the other).
- "sentiment" reflects the emotional tone of the quote.
- "context" provides a short summary or explanation of the situation.
- "characterNetwork" should be a list of markdown-formatted lines like: 
  - **Romeo (45)**: Juliet (23), Mercutio (12), Friar (10)

Book Content:
${prompt.slice(0, 12000)}
`
                }
            ],
            temperature: 0.2,
        }),
    });

    const { choices } = await llmRes.json();
    const content = choices?.[0]?.message?.content || "";

    const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (!match) throw new Error("Somthing Went Wrong");

    const graphData = JSON.parse(match[1]);

    return {
        title,
        author,
        graphData,
        sampleQuotes: graphData?.sampleQuotes || [],
    };
};

export const useAnalyzeBookMutation = () =>
    useMutation({
        mutationFn: (bookId: string) => analyzeBook(bookId),
    });
