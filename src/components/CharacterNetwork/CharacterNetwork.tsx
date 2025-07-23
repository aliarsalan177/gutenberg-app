import type { CharacterNetworkProps } from "@/types";

type CharacterLine = {
    id: string;
    total: number;
    partners: { name: string; count: number }[];
};

export default function CharacterNetwork({ nodes, links }: CharacterNetworkProps) {
    if (!nodes?.length || !links?.length) {
        return (
            <div className="max-w-4xl mx-auto px-6 pb-10">
                <h2 className="text-xl font-semibold mb-4">🔗 Character Network</h2>
                <p className="text-gray-500 text-sm">No character data available.</p>
            </div>
        );
    }

    const interactionMap: Record<string, { [partner: string]: number }> = {};

    for (const link of links) {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;

        if (!interactionMap[sourceId]) interactionMap[sourceId] = {};
        if (!interactionMap[targetId]) interactionMap[targetId] = {};

        interactionMap[sourceId][targetId] = (interactionMap[sourceId][targetId] || 0) + 1;
        interactionMap[targetId][sourceId] = (interactionMap[targetId][sourceId] || 0) + 1;
    }

    const characterLines: CharacterLine[] = nodes.map((node) => {
        const interactions = interactionMap[node.id];
        if (!interactions) return null;

        const sortedPartners = Object.entries(interactions)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        const total = sortedPartners.reduce((sum, p) => sum + p.count, 0);

        return {
            id: node.id,
            total,
            partners: sortedPartners,
        };
    }).filter(Boolean) as CharacterLine[];

    return (
        <div className="max-w-4xl mx-auto px-6 pb-10">
            <h2 className="text-xl font-semibold mb-4">🔗 Character Network</h2>
            <ul className="text-sm text-gray-800 space-y-1 list-none">
                {characterLines.map((char) => (
                    <li key={char.id} className="whitespace-pre-wrap">
                        - {char.id} ({char.total}):{" "}
                        {char.partners.map((p, i) => (
                            <span key={p.name}>
                                {p.name} ({p.count})
                                {i < char.partners.length - 1 ? ", " : ""}
                            </span>
                        ))}
                    </li>
                ))}
            </ul>
        </div>
    );
}