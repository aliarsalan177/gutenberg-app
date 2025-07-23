import React from "react";
import { useAnalyzeBookMutation } from "./Chatbox.config";
import CharacterGraph from "@/components/CharacterGraph";
import SampleQuotes from "@/components/SampleQuotes";

const Skeleton = ({ className = "" }) => (
    <div className={`animate-pulse bg-gray-300 rounded h-4 w-full ${className}`}
    />
);

export default function ChatBox() {
    const {
        mutate: submitBook,
        data,
        error,
        isPending,
    } = useAnalyzeBookMutation();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const bookId = formData.get("bookId")?.toString().trim();
        if (bookId) submitBook(bookId);
    };
    console.log(data);

    return (
        <>
            <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
                <h1 className="text-4xl font-bold text-center text-gray-800">
                    Character Interaction Visualizer
                </h1>

                <p className="text-center text-gray-500 max-w-2xl mx-auto text-sm">
                    Enter a <strong>Gutenberg Book ID</strong> to analyze its characters and relationships. For example, try <code className="bg-gray-100 px-1 rounded">1513</code> (Romeo and Juliet).
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row gap-4 items-center justify-center"
                >
                    <input
                        className="border border-gray-300 p-3 rounded w-full sm:w-auto flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        name="bookId"
                        defaultValue="1513"
                        placeholder="Enter Gutenberg Book ID (e.g., 1513)"
                    />
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isPending ? "Analyzing..." : "Visualize"}
                    </button>
                </form>

                {error && (
                    <div className="text-red-500 text-center">
                        {error instanceof Error ? error.message : "Unknown error"}
                    </div>
                )}

                {isPending ? (
                    <div className="space-y-2 animate-pulse">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </div>
                ) : (
                    data?.title && (
                        <div className="bg-gray-50 p-4 rounded shadow text-sm text-gray-700 space-y-1">
                            <div>
                                <strong className="font-medium">Title:</strong> {data.title}
                            </div>
                            <div>
                                <strong className="font-medium">Author:</strong> {data.author}
                            </div>
                        </div>
                    )
                )}
            </div>
            {!isPending && data?.sampleQuotes && (
                <SampleQuotes quotes={data.sampleQuotes} />
            )}
            <div className="w-full mx-auto">
                {isPending ? (
                    <Skeleton className="h-56 w-32" />
                ) : data?.graphData ? (
                    <CharacterGraph graphData={data.graphData} />
                ) : null}
            </div>
        </>
    );
}