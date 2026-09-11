import Task from "../models/Task.js";
import Board from "../models/Board.js";
import Workspace from "../models/Workspace.js";

const checkBoardAccess = async (boardId, userId) => {
    const board = await Board.findById(boardId);

    if (!board) {
        return { board: null, workspace: null };
    }

    const workspace = await Workspace.findById(board.workspace);

    if (!workspace) {
        return { board, workspace: null };
    }

    const hasAccess = workspace.members.some(
        member => member.toString() === userId.toString()
    );

    return { board, workspace, hasAccess };
};


// CREATE TASK
export const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            boardId,
            status,
            priority,
            assignee,
            dueDate,
            order
        } = req.body;

        if (!title || !boardId) {
            return res.status(400).json({
                message: "Title and boardId are required"
            });
        }

        const { board, workspace, hasAccess } =
            await checkBoardAccess(boardId, req.user);

        if (!board) {
            return res.status(404).json({
                message: "Board not found"
            });
        }

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found"
            });
        }

        if (!hasAccess) {
            return res.status(403).json({
                message: "You do not have access to this board"
            });
        }

        const task = await Task.create({
            title,
            description,
            board: boardId,
            status: status || "todo",
            priority: priority || "medium",
            assignee: assignee || null,
            dueDate: dueDate || null,
            order: order ?? 0,
            createdBy: req.user
        });

        res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// GET TASKS OF A BOARD
export const getTasks = async (req, res) => {
    try {
        const { boardId } = req.params;

        const { board, workspace, hasAccess } =
            await checkBoardAccess(boardId, req.user);

        if (!board) {
            return res.status(404).json({
                message: "Board not found"
            });
        }

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found"
            });
        }

        if (!hasAccess) {
            return res.status(403).json({
                message: "You do not have access to this board"
            });
        }

        const tasks = await Task.find({
            board: boardId
        })
            .populate("assignee", "name email")
            .sort({ status: 1, order: 1 });

        res.status(200).json({
            tasks
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// UPDATE TASK
export const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const { board, workspace, hasAccess } =
            await checkBoardAccess(task.board, req.user);

        if (!board || !workspace) {
            return res.status(404).json({
                message: "Board or workspace not found"
            });
        }

        if (!hasAccess) {
            return res.status(403).json({
                message: "You do not have access to this task"
            });
        }

        const allowedFields = [
            "title",
            "description",
            "status",
            "priority",
            "assignee",
            "dueDate",
            "order"
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                task[field] = req.body[field];
            }
        });

        await task.save();

        const updatedTask = await Task.findById(taskId)
            .populate("assignee", "name email");

        res.status(200).json({
            message: "Task updated successfully",
            task: updatedTask
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// DELETE TASK
export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const { board, workspace, hasAccess } =
            await checkBoardAccess(task.board, req.user);

        if (!board || !workspace) {
            return res.status(404).json({
                message: "Board or workspace not found"
            });
        }

        if (!hasAccess) {
            return res.status(403).json({
                message: "You do not have access to this task"
            });
        }

        await Task.findByIdAndDelete(taskId);

        res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};