import type { AnalyzeBookResult } from "@/types";
import { useMutation } from "@tanstack/react-query";

const GUTENBERG_TEXT_URL = (bookId: string) =>
    `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;

const GUTENBERG_META_URL = (bookId: string) =>
    `https://www.gutenberg.org/ebooks/${bookId}`;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;


export const analyzeBook = async (bookId: string): Promise<AnalyzeBookResult> => {
    const [textRes, metaRes] = await Promise.all([
        fetch(GUTENBERG_TEXT_URL(bookId)),
        fetch(GUTENBERG_META_URL(bookId)),
    ]);

    const prompt = await textRes.text();
    const metaHtml = await metaRes.text();

    const title = metaHtml.match(/<title>(.*?)<\/title>/)?.[1] || "";
    const author = metaHtml.match(/<meta name="author" content="(.*?)"/)?.[1] || "";

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
                    content: `Analyze the following book and identify the key characters. Then, return a JSON object with "nodes", "sampleQuotes" and "links" for character interactions in the following format:

{
  "nodes": [{ "id": "Character Name" }],
  "links": [{ "source": "Character A", "target": "Character B" }],
  "sampleQuotes": [
    {
      "character": "Character Name",
      "line": "Quote text"
    }
  ]
}

Book Content:
${prompt.slice(0, 12000)}
`,
                },
            ],
            temperature: 0.2,
        }),
    });

    const { choices } = await llmRes.json();
    const content = choices?.[0]?.message?.content || "";

    const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (!match) throw new Error("Failed to extract JSON from LLM response");


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