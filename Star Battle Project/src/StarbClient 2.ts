/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

// This code is loaded into starb-client.html, see the `npm compile` and
//   `npm watchify-client` scripts.
// Remember that you will *not* be able to use Node APIs like `fs` in the web browser.

import assert from "assert";
import { drawBoard, printOutput, COLORS, NUM_COLS, NUM_ROWS } from "./Drawing";
import { Puzzle } from "../src/puzzle";
import { Client } from "../src/client";
import { parsePuzzle } from "./Parser";

/**
 * Puzzle to request and play.
 * Project instructions: this constant is a [for now] requirement in the project spec.
 */
const PUZZLE = "kd-1-1-1";
const client = new Client();

/**
 * Main function for the client.
 *
 * Initializes the client and sets up the drawing canvas. Includes event listeners for when the user clicks on the canvas.
 */
async function main(): Promise<void> {
    // output area for printing
    const outputArea: HTMLElement =
        document.getElementById("outputArea") ??
        assert.fail("missing output area");
    // canvas for drawing
    const canvas: HTMLCanvasElement =
        (document.getElementById("canvas") as HTMLCanvasElement) ??
        assert.fail("missing drawing canvas");
    const BOX_SIZE = Math.min(canvas.width, canvas.height) / NUM_COLS;

    // set the initial board for the client
    const puzzle = await client.requestBlankPuzzle(PUZZLE);
    client.setCurrentPuzzle(puzzle);
    drawBoard(canvas, puzzle);

    // when the user clicks on the drawing canvas...
    canvas.addEventListener("click", (event: MouseEvent) => {
        const [clickX, clickY] = [event.offsetX, event.offsetY];
        // snap the click coordinates to the center of the nearest box
        const boxX = Math.floor(clickX / BOX_SIZE) * BOX_SIZE + BOX_SIZE / 2;
        const boxY = Math.floor(clickY / BOX_SIZE) * BOX_SIZE + BOX_SIZE / 2;

        // get row and col of box in puzzle (0-indexed from top-left)
        const row = Math.floor(boxY / BOX_SIZE);
        const col = Math.floor(boxX / BOX_SIZE);

        let puzzle: Puzzle =
            client.getCurrentPuzzle() ?? assert.fail("error getting board");

        if (puzzle.hasStarAt(row, col)) {
            puzzle = client.removeStarAt(row, col);
            drawBoard(canvas, puzzle);
            if (client.isSolved()) {
                printOutput(
                    outputArea,
                    `Yeah! You successfully solved the puzzle!`
                );
            }
        } else {
            puzzle = client.putStarAt(row, col);
            drawBoard(canvas, puzzle);
            if (client.isSolved()) {
                printOutput(
                    outputArea,
                    `Yeah! You successfully solved the puzzle!`
                );
            }
        }
    });

    if (client.isSolved()) {
        printOutput(outputArea, `Yeah! You successfully solved the puzzle!`);
    } else {
        printOutput(outputArea, `Keep going! You can do it!`);
    }
    // add initial instructions to the output area
    printOutput(outputArea, `Click on a box to draw a star inside of it`);
}

main().then().catch(console.error);
