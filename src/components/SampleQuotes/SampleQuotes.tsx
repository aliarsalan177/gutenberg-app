import type { AnalyzeBookResult } from "@/types";

export default function SampleQuotes({ quotes }: { quotes: AnalyzeBookResult['sampleQuotes'] }) {
    return (
        <div className="max-w-4xl mx-auto px-6 pb-16">
            <h2 className="text-xl font-semibold mb-4">🎭 Sample Dialogues & Sentiment</h2>
            <ul className="list-none space-y-3 text-sm text-gray-700">
                {quotes.map((q, i) => (
                    <li
                        key={i}
                        className="bg-white shadow p-3 rounded border-l-4 border-blue-500"
                    >
                        <div className="text-gray-900 font-medium">{q.character}</div>
                        <div className="italic">"{q.line}"</div>
                    </li>
                ))}
            </ul>
        </div>
    );
}