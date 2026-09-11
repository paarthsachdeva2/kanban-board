import Board from "../models/Board.js";
import Workspace from "../models/Workspace.js";

// CREATE BOARD
export const createBoard = async (req, res) => {
    try {
        const { name, workspaceId } = req.body;

        if (!name || !workspaceId) {
            return res.status(400).json({
                message: "Board name and workspaceId are required"
            });
        }

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found"
            });
        }

        // Check if user is a member of workspace
        if (!workspace.members.some(
            member => member.toString() === req.user.toString()
        )) {
            return res.status(403).json({
                message: "You are not a member of this workspace"
            });
        }

        const board = await Board.create({
            name,
            workspace: workspaceId,
            createdBy: req.user
        });

        res.status(201).json({
            message: "Board created successfully",
            board
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// GET BOARDS OF A WORKSPACE
export const getBoards = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found"
            });
        }

        if (!workspace.members.some(
            member => member.toString() === req.user.toString()
        )) {
            return res.status(403).json({
                message: "You are not a member of this workspace"
            });
        }

        const boards = await Board.find({
            workspace: workspaceId
        });

        res.status(200).json({
            boards
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// UPDATE BOARD
export const updateBoard = async (req, res) => {
    try {
        const { boardId } = req.params;
        const { name } = req.body;

        const board = await Board.findById(boardId);

        if (!board) {
            return res.status(404).json({
                message: "Board not found"
            });
        }

        const workspace = await Workspace.findById(board.workspace);

        if (!workspace.members.some(
            member => member.toString() === req.user.toString()
        )) {
            return res.status(403).json({
                message: "You are not a member of this workspace"
            });
        }

        board.name = name || board.name;

        await board.save();

        res.status(200).json({
            message: "Board updated successfully",
            board
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// DELETE BOARD
export const deleteBoard = async (req, res) => {
    try {
        const { boardId } = req.params;

        const board = await Board.findById(boardId);

        if (!board) {
            return res.status(404).json({
                message: "Board not found"
            });
        }

        const workspace = await Workspace.findById(board.workspace);

        if (!workspace.members.some(
            member => member.toString() === req.user.toString()
        )) {
            return res.status(403).json({
                message: "You are not a member of this workspace"
            });
        }

        await Board.findByIdAndDelete(boardId);

        res.status(200).json({
            message: "Board deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};