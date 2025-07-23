import type { AnalyzeBookResult } from "@/types";

export default function SampleQuotes({ quotes }: { quotes: AnalyzeBookResult['sampleQuotes'] }) {

    return (
        <div className="max-w-4xl">
            <h2 className="text-xl font-semibold mb-4">🎭 Sample Dialogues, Sentiment & Context</h2>
            <ul className="list-none space-y-4 text-sm text-gray-700">
                {quotes.map((q, i) => (
                    <li
                        key={i}
                        className="bg-white shadow p-4 rounded border-l-4 border-blue-500"
                    >
                        <div className="text-gray-900 font-semibold">{q.character}</div>
                        <div className="italic text-gray-800 mt-1 mb-2">"{q.line}"</div>

                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                Sentiment: {q.sentiment}
                            </span>
                            <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                                Context: {q.context}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}