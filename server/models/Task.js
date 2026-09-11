import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        board: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Board",
            required: true
        },

        status: {
            type: String,
            enum: ["todo", "in-progress", "done"],
            default: "todo"
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },

        assignee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        dueDate: {
            type: Date,
            default: null
        },

        order: {
            type: Number,
            default: 0
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;