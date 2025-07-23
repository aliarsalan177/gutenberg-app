
export type GraphLink = {
  source: string | GraphNode;
  target: string | GraphNode;
};

type SampleQuote = { character: string; line: string; sentiment: string, context: string; };

export type CharacterNetworkProps = {
    nodes: GraphNode[];
    links: GraphLink[];
};

export type GraphData = {
    nodes: GraphNode[];
    links: GraphLink[];
    sampleQuotes?: SampleQuote[];
};

export type GraphNode = {
  id: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
};

export type AnalyzeBookResult = {
    title: string;
    author: string;
    graphData: GraphData;
    sampleQuotes: SampleQuote[];
};

