import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
    createBoard,
    getBoards,
    updateBoard,
    deleteBoard
} from "../controllers/boardController.js";

const router = express.Router();

router.post("/", authMiddleware, createBoard);

router.get(
    "/workspace/:workspaceId",
    authMiddleware,
    getBoards
);

router.put(
    "/:boardId",
    authMiddleware,
    updateBoard
);

router.delete(
    "/:boardId",
    authMiddleware,
    deleteBoard
);

export default router;