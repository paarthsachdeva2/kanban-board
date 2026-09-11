import Workspace from "../models/Workspace.js";

export const createWorkspace = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Workspace name is required"
            });
        }

        const workspace = await Workspace.create({
            name,
            owner: req.user,
            members: [req.user]
        });

        res.status(201).json({
            message: "Workspace created successfully",
            workspace
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


export const getWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({
            members: req.user
        });

        res.status(200).json({
            workspaces
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


export const updateWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { name } = req.body;

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found"
            });
        }

        if (workspace.owner.toString() !== req.user.toString()) {
            return res.status(403).json({
                message: "Only the owner can update this workspace"
            });
        }

        if (!name) {
            return res.status(400).json({
                message: "Workspace name is required"
            });
        }

        workspace.name = name;

        await workspace.save();

        res.status(200).json({
            message: "Workspace updated successfully",
            workspace
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


export const deleteWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found"
            });
        }

        if (workspace.owner.toString() !== req.user.toString()) {
            return res.status(403).json({
                message: "Only the owner can delete this workspace"
            });
        }

        await Workspace.findByIdAndDelete(workspaceId);

        res.status(200).json({
            message: "Workspace deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};