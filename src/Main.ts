import * as PIXI from 'pixi.js/dist/pixi.min.js'
import * as d3 from 'd3/dist/d3.min.js'
import * as _ from 'underscore/underscore-min.js'
import * as originalGraph from './philosophers.json'

export class Main {
    svg = null
    graph = {}
    readonly padding = 100
    width = 0
    height = 0
    sf = 1 // Scale factor for responsive svg
    readonly nodeRadius = 60
    scaledNodeRadius = 60

    constructor () {
        this.initSvg()
        this.normalizeCoords()
        this.drawGraph()

        this.initResizeEndCallback()
    }

    initResizeEndCallback() {
        var timer = 0;

        window.onresize = () => {
            if (timer > 0) {
                clearTimeout(timer);
            }

            timer = setTimeout(() => {
                console.log("Resize End")
                this.onResizeEnd()
            }, 300)
        }
    }

    initSvg () {
        this.graph = JSON.parse(JSON.stringify(originalGraph))
        const visualization = document.getElementById("visualization")

        this.width = visualization.clientWidth
        this.height = this.width

        // widthが1000と仮定してレイアウトする.
        // 実際のwidthに合わせるためにすべての座標に↓をかける.
        this.sf = this.width / 1000

        if (this.svg !== null) {
            this.svg.remove()
        }

        this.svg = d3.select("#visualization").append("svg")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr('width', this.width)
            .attr('height', this.height)
    }

    normalizeCoords() {
        for (let i=0; i<this.graph.nodes.length; i++) {
            this.graph.nodes[i].x *= this.sf
            this.graph.nodes[i].y *= this.sf
        }

        this.scaledNodeRadius = this.nodeRadius * this.sf
    }

    drawGraph() {
        const links = this.svg.append("g").attr("class", "links").selectAll("links")
        this.graph.links.forEach(l => {
            let src = this.graph.nodes[l.source]
            let tgt = this.graph.nodes[l.target]
            links.data([l])
                .enter()
                .append("line")
                .attr("class", "link")
                .attr("x1", src.x)
                .attr("y1", src.y)
                .attr("x2", tgt.x)
                .attr("y2", tgt.y)
                .style("stroke", "black")
        })

        const nodes = this.svg.append("g").attr("class", "nodes").selectAll("nodes")
            .data(this.graph.nodes)
            .enter()
            .append("a")
            .attr("target", "_blank")
            .attr("xlink:href", d => d.url)
            .append("g")
            .attr("class", "node")
            .style("transform-origin", d => `${d.x}px ${d.y}px`)

        nodes
            .append("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", this.scaledNodeRadius)
            .attr("fill", "white")
            .style("stroke", "black")

        nodes
            .append("text")
            .attr("x", d => d.x)
            .attr("y", d => d.y - this.scaledNodeRadius - (10 * this.sf))
            .attr("stroke", "black")
            .attr("text-anchor", "middle")
            .text(d => d.name)

        nodes.append("clipPath")
            .attr("id", (d, i) => `clipCircle${i}`)
            .append("circle")
            .attr("r", this.scaledNodeRadius - (10 * this.sf))
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)

        nodes
            .append("svg:image")
            .attr("x", d => d.x - this.scaledNodeRadius)
            .attr("y", d => d.y - this.scaledNodeRadius)
            .attr("width", this.scaledNodeRadius * 2)
            .attr("height", this.scaledNodeRadius * 2)
            .attr("xlink:href", d => d.img)
            .attr("clip-path", (d, i) => `url(#clipCircle${i})`)
    }

    onResizeEnd () {
        this.initSvg()
        this.normalizeCoords()
        this.drawGraph()
    }
}
