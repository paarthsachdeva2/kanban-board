import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    createWorkspace,
    getWorkspaces,
    updateWorkspace,
    deleteWorkspace
} from "../controllers/workspaceController.js";

const router = express.Router();

router.post("/", authMiddleware, createWorkspace);

router.get("/", authMiddleware, getWorkspaces);

router.put("/:workspaceId", authMiddleware, updateWorkspace);

router.delete("/:workspaceId", authMiddleware, deleteWorkspace);

export default router;