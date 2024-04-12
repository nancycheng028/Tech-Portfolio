/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

// This test file runs in Node.js, see the `npm test` script.
// Remember that you will *not* be able to use DOM APIs in Node, only in the web browser.
// See the *Testing* section of the project handout for more advice.

import assert from "assert";
import { WebServer } from "../src/StarbServer";
import { StatusCodes } from "http-status-codes";
import { Puzzle } from "../src/puzzle";
import fs from "fs";

describe("server", function () {
    /**
     * Testing Partition:
     *
     * constructor, start:
     *      partition on if the server is successfully on the given port: yes, no
     *
     * /emptyPuzzle/:fileName:
     *      partition on the fileName: valid, invalid
     */
    it("should start the server on the given port", async function () {
        const server = new WebServer(8789);
        try {
            await server.start();
            assert.strictEqual(server.port, 8789);
        } catch (err) {
            // gracefully exit
            await server.stop();
            throw err;
        }
        await server.stop();
    });

    it("should return the empty puzzle with the puzzleString representation", async function () {
        this.timeout(5000);
        const server = new WebServer(8789);
        try {
            await server.start();
            const response = await fetch(
                "http://localhost:8789/emptyPuzzle/kd-1-1-1"
            );
            assert.strictEqual(response.status, StatusCodes.OK);
            const puzzleText = await response.text();
            const expectedString = await fs.promises.readFile(
                "./puzzles/kd-1-1-1.starb",
                "utf8"
            );
            const expected =
                Puzzle.fromString(expectedString).getParseableBlankPuzzle();
            
            assert.strictEqual(puzzleText, expected);
        } catch (err) {
            // gracefully exit
            await server.stop();
            throw err;
        }
        await server.stop();
    });

    it("should return 404 if the file is not found", async function () {
        this.timeout(5000);
        const server = new WebServer(8789);
        try {
            await server.start();
            const response = await fetch(
                "http://localhost:8789/emptyPuzzle/invalid"
            );
            assert.strictEqual(response.status, StatusCodes.NOT_FOUND);
        } catch (err) {
            // gracefully exit
            await server.stop();
            throw(err);
        }
        await server.stop();
    });
});
