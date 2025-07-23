import { useLayoutEffect, useRef, useState } from "react";
import * as d3Force from "d3-force";
import * as d3Selection from "d3-selection";
import * as d3Drag from "d3-drag";
import type { AnalyzeBookResult, GraphNode, GraphLink } from "@/types";

export default function CharacterGraph({
    graphData,
}: {
    graphData: AnalyzeBookResult["graphData"];
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const updateDimensions = () => {
            setDimensions({
                width: containerRef.current!.clientWidth,
                height: containerRef.current!.clientHeight,
            });
        };

        updateDimensions();

        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    useLayoutEffect(() => {
        if (
            !svgRef.current ||
            !graphData?.nodes?.length ||
            !dimensions.width ||
            !dimensions.height
        )
            return;

        const nodes: GraphNode[] = graphData.nodes.map((n) => ({ ...n }));
        const links: GraphLink[] = graphData.links.map((l) => ({ ...l }));

        const svg = d3Selection.select(svgRef.current);
        svg.selectAll("*").remove();

        svg
            .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        const degreeMap = new Map<string, number>();
        nodes.forEach((node) => degreeMap.set(node.id, 0));
        links.forEach(({ source, target }) => {
            const s = typeof source === "string" ? source : source.id;
            const t = typeof target === "string" ? target : target.id;
            degreeMap.set(s, (degreeMap.get(s) || 0) + 1);
            degreeMap.set(t, (degreeMap.get(t) || 0) + 1);
        });

        const radiusScale = (degree: number) => 8 + Math.min(degree * 3, 20);

        const simulation = d3Force
            .forceSimulation<GraphNode>(nodes)
            .force(
                "link",
                d3Force
                    .forceLink<GraphNode, GraphLink>(links)
                    .id((d) => d.id)
                    .distance(150)
                    .strength(1)
            )
            .force("charge", d3Force.forceManyBody().strength(-500))
            // .force(
            //     "center",
            //     d3Force.forceCenter(dimensions.width / 2, dimensions.height / 2)
            // )
            .force(
                "collide",
                d3Force
                    .forceCollide<GraphNode>()
                    .radius((d) => radiusScale(degreeMap.get(d.id) || 0) + 5)
            );

        const link = svg
            .append("g")
            .attr("stroke", "#ccc")
            .attr("stroke-opacity", 0.7)
            .selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .attr("stroke-width", 1.5);

        const tooltip = d3Selection
            .select(containerRef.current)
            .append("div")
            .style("position", "absolute")
            .style("padding", "6px 10px")
            .style("background", "rgba(0,0,0,0.85)")
            .style("color", "#fff")
            .style("border-radius", "6px")
            .style("pointer-events", "none")
            .style("font-size", "13px")
            .style("opacity", "0")
            .style("transition", "opacity 0.3s ease");

        const node = svg
            .append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("r", (d) => radiusScale(degreeMap.get(d.id) || 0))
            .attr("fill", "#1e40af") // Tailwind blue-900
            .style("cursor", "grab")
            .on("mouseenter", (_event, d) => {
                tooltip.style("opacity", "1").html(`<strong>${d.id}</strong>`);
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("left", event.pageX + 15 + "px")
                    .style("top", event.pageY + 15 + "px");
            })
            .on("mouseleave", () => {
                tooltip.style("opacity", "0");
            });

        node.call(
            d3Drag
                .drag<SVGCircleElement, GraphNode>()
                .on("start", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                    d3Selection.select(event.sourceEvent.target).style("cursor", "grabbing");
                })
                .on("drag", (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                    d3Selection.select(event.sourceEvent.target).style("cursor", "grab");
                })
        );

        const label = svg
            .append("g")
            .selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .text((d) => d.id)
            .attr("font-size", 13)
            .attr("fill", "#000")
            .attr("dx", 10)
            .attr("dy", "0.35em")
            .style("pointer-events", "none")
            .style("user-select", "none");

        simulation.on("tick", () => {
            link
                .attr("x1", (d) =>
                    typeof d.source === "string" ? 0 : (d.source as GraphNode).x!
                )
                .attr("y1", (d) =>
                    typeof d.source === "string" ? 0 : (d.source as GraphNode).y!
                )
                .attr("x2", (d) =>
                    typeof d.target === "string" ? 0 : (d.target as GraphNode).x!
                )
                .attr("y2", (d) =>
                    typeof d.target === "string" ? 0 : (d.target as GraphNode).y!
                );

            node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
            label.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
        });

        return () => {
            simulation.stop();
            tooltip.remove();
        };
    }, [graphData, dimensions]);


    return (
        <div
            ref={containerRef}
            className="w-full h-full rounded border border-gray-300 bg-white relative"
        >
            <svg width="100%" height="600" ref={svgRef} className="mx-auto block" />
            <div className="text-xs text-gray-500 text-center absolute bottom-2 left-0 right-0 pointer-events-none select-none">
                Powered by Groq LLM & D3 Visualization
            </div>
        </div>
    );
}