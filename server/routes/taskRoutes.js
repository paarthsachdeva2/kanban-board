import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
    createTask,
    getTasks,
    updateTask,
    deleteTask
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", authMiddleware, createTask);

router.get(
    "/board/:boardId",
    authMiddleware,
    getTasks
);

router.put(
    "/:taskId",
    authMiddleware,
    updateTask
);

router.delete(
    "/:taskId",
    authMiddleware,
    deleteTask
);

export default router;