/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

// This file runs in Node.js, see the `npm server` script.
// Remember that you will *not* be able to use DOM APIs in Node, only in the web browser.

import assert from "assert";
import fs from "fs";
import { Puzzle } from "./puzzle";
import express, { Application } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import { Server } from "https";
import { parsePuzzle } from "./Parser";

export class WebServer {
    private readonly app: Application;
    private closeFunction: ((after: () => void) => void) | null = null;

    public constructor(public readonly port: number) {
        this.app = express();
        this.app.use(express.json());

        this.app.use((request, response, next) => {
            // allow requests from web pages hosted anywhere
            response.set("Access-Control-Allow-Origin", "*");
            next();
        });

        /**
         * Handle a request for /puzzle/fileName
         * such that an empty puzzle with the puzzleString representation is sent back
         */
        this.app.get(
            "/emptyPuzzle/:fileName",
            asyncHandler(async (req, res) => {
                const fileName = req.params["fileName"];
                if (fileName === undefined) {
                    res.status(StatusCodes.BAD_REQUEST).send(
                        "fileName not found"
                    );
                    res.send();
                    return;
                }
                // read the puzzleString from the file and catch any errors
                let puzzleString;
                try {
                    puzzleString = await fs.promises.readFile(
                        `puzzles/${fileName}.starb`,
                        "utf8"
                    );
                } catch (err) {
                    console.error(err);
                    res.status(StatusCodes.NOT_FOUND).send("File not found");
                    res.send();
                    return;
                }
                const puzzle = Puzzle.fromString(puzzleString);
                const puzzleStringToSend = puzzle.getParseableBlankPuzzle();
                console.log("Request recieved for " + fileName);
                res.status(StatusCodes.OK).send(puzzleStringToSend);
            })
        );
    }

    /**
     * Start this server.
     *
     * @returns (a promise that) resolves when the server is listening
     *
     * @throws an error if the server has already been started
     */
    public start(): Promise<void> {
        if (this.closeFunction !== null) {
            throw new Error("Server has already been started");
        }
        return new Promise((resolve) => {
            const newListener = this.app.listen(this.port, () => {
                console.log(`Server started on port ${this.port}`);
            });
            this.closeFunction = (after: () => void) =>
                newListener.close(after);
            resolve();
        });
    }

    /**
     * Stop this server.
     *
     * @returns a promise that resolves when the server is stopped
     * @throws an error if the server has not been started yet
     */
    public stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.closeFunction === null) {
                reject(new Error("Server has not been started yet"));
            } else {
                this.closeFunction(() => {
                    console.log(`Server stopped on port ${this.port}`);
                    this.closeFunction = null;
                    resolve();
                });
            }
        });
    }
}

/**
 * Start a server that serves puzzles from the `puzzles` directory
 * on localhost:8789.
 */
async function main(): Promise<void> {
    const port = 8789;
    const server = new WebServer(port);
    await server.start();
}

if (require.main === module) {
    void main();
}
