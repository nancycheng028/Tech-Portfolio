/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

// This code is loaded into example-page.html, see the `npm watchify-example` script.
// Remember that you will *not* be able to use Node APIs like `fs` in the web browser.

import assert from "assert";
import { Puzzle } from "./puzzle";
// import only the types from 'canvas', not the implementations
import type {
    Canvas,
    CanvasRenderingContext2D as NodeCanvasRenderingContext2D,
} from "canvas";

/**
 * Either: a CanvasRenderingContext2D in the web browser,
 *      or a NodeCanvasRenderingContext2D in Node (for testing)
 */
type WebOrNodeCanvasRenderingContext2D =
    | CanvasRenderingContext2D
    | NodeCanvasRenderingContext2D;

/**
 * Either: a HTMLCanvasElement representing a `<canvas>` on the web page,
 *      or a Canvas representing a canvas in Node (for testing)
 */
type WebOrNodeCanvas = Omit<HTMLCanvasElement | Canvas, "getContext"> & {
    getContext(contextId: "2d"): WebOrNodeCanvasRenderingContext2D | null;
};

export const NUM_ROWS = 10;
export const NUM_COLS = 10;

// categorical colors from
// https://github.com/d3/d3-scale-chromatic/tree/v2.0.0#schemeCategory10
export const COLORS: Array<string> = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
];

// semitransparent versions of those colors
const BACKGROUNDS = COLORS.map((color) => color + "60");

/**
 * Draw a black square filled with a given color.
 *
 * @param canvas canvas to draw on
 * @param x x position of center of box
 * @param y y position of center of box
 * @param color color to fill the box with
 */
function drawBox(
    canvas: WebOrNodeCanvas,
    x: number,
    y: number,
    color: string
): void {
    const BOX_SIZE = Math.min(canvas.width, canvas.height) / NUM_COLS;
    const context = canvas.getContext("2d");
    assert(context, "unable to get canvas drawing context");

    // save original context settings before we translate and change colors
    context.save();

    // translate the coordinate system of the drawing context:
    //   the origin of `context` will now be (x,y)
    context.translate(x, y);

    // draw the outer outline box centered on the origin (which is now (x,y))
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.strokeRect(-BOX_SIZE / 2, -BOX_SIZE / 2, BOX_SIZE, BOX_SIZE);

    // fill with the given color
    context.fillStyle = color;
    context.fillRect(-BOX_SIZE / 2, -BOX_SIZE / 2, BOX_SIZE, BOX_SIZE);

    // reset the origin and styles back to defaults
    context.restore();
}

/**
 * Draw a star with the specified color centered at the given (x,y) coordinates.
 *
 * @param canvas canvas to draw on
 * @param x x position of center of star
 * @param y y position of center of star
 * @param color color to fill the star with
 */
export function drawStar(
    canvas: WebOrNodeCanvas,
    x: number,
    y: number,
    color: string
): void {
    const BOX_SIZE = Math.min(canvas.width, canvas.height) / NUM_COLS;
    const context = canvas.getContext("2d");
    assert(context, "unable to get canvas drawing context");

    // save original context settings before we translate and change colors
    context.save();

    // translate the coordinate system of the drawing context:
    //   the origin of `context` will now be (x,y)
    context.translate(x, y);

    // draw the star centered on the origin (which is now (x,y))
    context.fillStyle = color;
    context.beginPath();
    const centerFactor = 2;
    context.moveTo(0, -BOX_SIZE / centerFactor);

    const topPointFactor = 6; // controls how pointy the top points of the star are
    const bottomPointFactor = 3; // controls how pointy the bottom points of the star are
    const bottomCloseFactor = 5; // controls how close together the bottom points of the star are

    context.lineTo(BOX_SIZE / topPointFactor, -BOX_SIZE / topPointFactor);
    context.lineTo(BOX_SIZE / centerFactor, -BOX_SIZE / topPointFactor);
    context.lineTo(
        BOX_SIZE / bottomPointFactor,
        BOX_SIZE / (centerFactor * topPointFactor)
    );
    context.lineTo((2 * BOX_SIZE) / bottomCloseFactor, BOX_SIZE / centerFactor);
    context.lineTo(0, BOX_SIZE / bottomPointFactor);
    context.lineTo(
        (-2 * BOX_SIZE) / bottomCloseFactor,
        BOX_SIZE / centerFactor
    );
    context.lineTo(
        -BOX_SIZE / bottomPointFactor,
        BOX_SIZE / (centerFactor * topPointFactor)
    );
    context.lineTo(-BOX_SIZE / centerFactor, -BOX_SIZE / topPointFactor);
    context.lineTo(-BOX_SIZE / topPointFactor, -BOX_SIZE / topPointFactor);
    context.closePath();
    context.fill();

    // reset the origin and styles back to defaults
    context.restore();
}

/**
 * Draw a board of stars and boxes on the canvas.
 *
 * @param canvas canvas element to draw on
 * @param puzzle puzzle to draw
 */
export function drawBoard(canvas: WebOrNodeCanvas, puzzle: Puzzle): void {
    const BOX_SIZE = Math.min(canvas.width, canvas.height) / NUM_COLS;
    const context = canvas.getContext("2d");
    assert(context, "unable to get canvas drawing context");

    // clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw boxes and stars for each cell in the board
    let colorIndex = 0;
    for (const region of puzzle.getRegions()) {
        for (const coordinate of region) {
            // compute the coordinates of the center of the box
            const halfOffset = 1 / 2;
            const boxCenterY = (coordinate.x + halfOffset) * BOX_SIZE;
            const boxCenterX = (coordinate.y + halfOffset) * BOX_SIZE;

            // draw the box
            const color = BACKGROUNDS[colorIndex];
            assert(color, "missing color");
            drawBox(canvas, boxCenterX, boxCenterY, color);
        }
        colorIndex++;
    }
    for (let row = 0; row < puzzle.rows; row++) {
        for (let col = 0; col < puzzle.cols; col++) {
            if (!puzzle.hasStarAt(row, col)) {
                continue;
            }
            // get pseudorandom color for star dependent only on row and col
            const color = COLORS[(row + col) % COLORS.length];
            assert(color, "missing color");
            const halfOffset = 1 / 2;
            const boxCornerY = (row + halfOffset) * BOX_SIZE;
            const boxCornerX = (col + halfOffset) * BOX_SIZE;
            drawStar(canvas, boxCornerX, boxCornerY, color);
        }
    }
}

/**
 * Print a message by appending it to an HTML element.
 *
 * @param outputArea HTML element that should display the message
 * @param message message to display
 */
export function printOutput(outputArea: HTMLElement, message: string): void {
    // append the message to the output area
    outputArea.innerText += message + "\n";

    // scroll the output area so that what we just printed is visible
    outputArea.scrollTop = outputArea.scrollHeight;
}
