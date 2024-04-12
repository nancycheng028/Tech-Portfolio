import assert from "assert";
import { Client } from "../src/client";
import { WebServer } from "../src/StarbServer";
import fs from "fs";
import { Puzzle } from "../src/puzzle";
import { drawBoard, drawStar } from "../src/Drawing";
import type { Canvas, CanvasRenderingContext2D as NodeCanvasRenderingContext2D } from 'canvas';
import { createCanvas } from "canvas";
//import { JSDOM } from "jsdom";
/**
 * Either: a CanvasRenderingContext2D in the web browser,
 *      or a NodeCanvasRenderingContext2D in Node (for testing)
 */
type WebOrNodeCanvasRenderingContext2D = CanvasRenderingContext2D | NodeCanvasRenderingContext2D;

/**
 * Either: a HTMLCanvasElement representing a `<canvas>` on the web page,
 *      or a Canvas representing a canvas in Node (for testing)
 */
type WebOrNodeCanvas = Omit<HTMLCanvasElement | Canvas, 'getContext'> & {
    getContext(contextId: '2d'): WebOrNodeCanvasRenderingContext2D | null;
};

describe("drawBoard", function () {
    /**
     * Partition:
     * - partition on work correctly or not: yes, no
     * - partition on state of board: empty, not empty
     * - partition on things drawn: star, box
     */

    it("should draw the board correctly for an empty puzzle", function () {
        const puzzle = new Puzzle(10, 10, [], []);

        // Create a virtual DOM environment using jsdom
        //const dom = new JSDOM();

        // Create a mock canvas and 2D context
        const canvas = createCanvas(200, 200);
        const context = canvas.getContext("2d");

        // Call the drawBoard function
        drawBoard(canvas, puzzle);
        assert(context);
        const pixel = context.getImageData(0, 0, 1, 1).data;
        assert.deepStrictEqual([...pixel], [0, 0, 0, 0]);
    });
});