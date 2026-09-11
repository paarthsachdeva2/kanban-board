import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    DndContext,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";

import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import api from "../services/api";


// ==================== COLUMNS ====================

const columns = [
    {
        id: "todo",
        title: "TODO"
    },
    {
        id: "in-progress",
        title: "IN PROGRESS"
    },
    {
        id: "done",
        title: "DONE"
    }
];


// ==================== TASK CARD ====================

function TaskCard({ task, onDelete, onEdit }) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({
        id: task._id
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,

        padding: "15px",
        marginBottom: "10px",

        background: "white",

        border: "1px solid #ddd",
        borderRadius: "8px",

        cursor: "grab"
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >

            <strong>
                {task.title}
            </strong>

            {task.description && (
                <p>
                    {task.description}
                </p>
            )}

            <small>
                Priority: {task.priority}
            </small>

            <div style={{ marginTop: "10px" }}>

                <button
                    onPointerDown={(e) =>
                        e.stopPropagation()
                    }
                    onClick={() =>
                        onEdit(task)
                    }
                    style={{
                        marginRight: "8px"
                    }}
                >
                    Edit
                </button>

                <button
                    onPointerDown={(e) =>
                        e.stopPropagation()
                    }
                    onClick={() =>
                        onDelete(task._id)
                    }
                >
                    Delete
                </button>

            </div>

        </div>
    );
}


// ==================== BOARD PAGE ====================

function BoardPage() {

    const { boardId } = useParams();

    const navigate = useNavigate();


    // ==================== STATE ====================

    const [tasks, setTasks] = useState([]);

    const [title, setTitle] = useState("");

    const [description, setDescription] =
        useState("");

    const [priority, setPriority] =
        useState("medium");

    const [status, setStatus] =
        useState("todo");

    const [editingTask, setEditingTask] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // ==================== DRAG SENSOR ====================

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5
            }
        })
    );


    // ==================== FETCH TASKS ====================

    useEffect(() => {

        const fetchTasks = async () => {

            try {

                const response =
                    await api.get(
                        `/tasks/board/${boardId}`
                    );

                setTasks(
                    response.data.tasks
                );

            } catch (err) {

                setError(
                    err.response?.data?.message ||
                    "Failed to load tasks"
                );

            } finally {

                setLoading(false);

            }
        };

        fetchTasks();

    }, [boardId]);


    // ==================== CREATE TASK ====================

    const createTask = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (!title.trim()) {
            return;
        }

        try {

            const columnTasks =
                tasks.filter(
                    (task) =>
                        task.status === status
                );

            const response =
                await api.post(
                    "/tasks",
                    {
                        title,
                        description,
                        boardId,
                        status,
                        priority,
                        order: columnTasks.length
                    }
                );

            setTasks([
                ...tasks,
                response.data.task
            ]);

            setTitle("");
            setDescription("");
            setPriority("medium");
            setStatus("todo");

            setSuccess(
                "Task created successfully"
            );

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to create task"
            );

        }
    };


    // ==================== EDIT TASK ====================

    const editTask = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (!editingTask.title.trim()) {
            return;
        }

        try {

            const response =
                await api.put(
                    `/tasks/${editingTask._id}`,
                    {
                        title:
                            editingTask.title,

                        description:
                            editingTask.description,

                        priority:
                            editingTask.priority,

                        status:
                            editingTask.status
                    }
                );

            setTasks(
                tasks.map((task) =>
                    task._id === editingTask._id
                        ? response.data.task
                        : task
                )
            );

            setEditingTask(null);

            setSuccess(
                "Task updated successfully"
            );

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to update task"
            );

        }
    };


    // ==================== DELETE TASK ====================

    const deleteTask = async (taskId) => {

        setError("");
        setSuccess("");

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this task?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(
                `/tasks/${taskId}`
            );

            setTasks(
                tasks.filter(
                    (task) =>
                        task._id !== taskId
                )
            );

            setSuccess(
                "Task deleted successfully"
            );

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to delete task"
            );

        }
    };


    // ==================== GET COLUMN TASKS ====================

    const getColumnTasks = (columnId) => {

        return tasks
            .filter(
                (task) =>
                    task.status === columnId
            )
            .sort(
                (a, b) =>
                    a.order - b.order
            );
    };


    // ==================== FIND TASK COLUMN ====================

    const findColumn = (taskId) => {

        const task =
            tasks.find(
                (item) =>
                    item._id === taskId
            );

        return task?.status;
    };


    // ==================== DRAG & DROP ====================

    const handleDragEnd = async (event) => {

        const {
            active,
            over
        } = event;

        if (!over) {
            return;
        }

        if (active.id === over.id) {
            return;
        }

        const activeColumn =
            findColumn(active.id);

        const overColumn =
            columns.some(
                (column) =>
                    column.id === over.id
            )
                ? over.id
                : findColumn(over.id);

        if (
            !activeColumn ||
            !overColumn
        ) {
            return;
        }


        // Save old state
        // so we can rollback if API fails

        const oldTasks = [...tasks];


        try {

            // ====================
            // SAME COLUMN
            // ====================

            if (
                activeColumn ===
                overColumn
            ) {

                const columnTasks =
                    getColumnTasks(
                        activeColumn
                    );

                const oldIndex =
                    columnTasks.findIndex(
                        (task) =>
                            task._id === active.id
                    );

                let newIndex;

                if (
                    columns.some(
                        (column) =>
                            column.id === over.id
                    )
                ) {

                    newIndex =
                        columnTasks.length - 1;

                } else {

                    newIndex =
                        columnTasks.findIndex(
                            (task) =>
                                task._id ===
                                over.id
                        );
                }


                if (
                    oldIndex === newIndex ||
                    newIndex < 0
                ) {
                    return;
                }


                const reordered =
                    arrayMove(
                        columnTasks,
                        oldIndex,
                        newIndex
                    );


                const updatedTasks =
                    tasks.map(
                        (task) => {

                            const index =
                                reordered.findIndex(
                                    (item) =>
                                        item._id ===
                                        task._id
                                );

                            if (index !== -1) {

                                return {
                                    ...task,
                                    order: index
                                };

                            }

                            return task;

                        }
                    );


                // Optimistic UI

                setTasks(
                    updatedTasks
                );


                // Save every new order

                for (
                    let i = 0;
                    i < reordered.length;
                    i++
                ) {

                    await api.put(
                        `/tasks/${reordered[i]._id}`,
                        {
                            order: i,
                            status:
                                activeColumn
                        }
                    );

                }

            }


            // ====================
            // DIFFERENT COLUMN
            // ====================

            else {

                const destinationTasks =
                    getColumnTasks(
                        overColumn
                    );

                const newOrder =
                    destinationTasks.length;


                const updatedTasks =
                    tasks.map(
                        (task) => {

                            if (
                                task._id ===
                                active.id
                            ) {

                                return {
                                    ...task,

                                    status:
                                        overColumn,

                                    order:
                                        newOrder
                                };

                            }

                            return task;

                        }
                    );


                // Optimistic UI

                setTasks(
                    updatedTasks
                );


                // Save to MongoDB

                await api.put(
                    `/tasks/${active.id}`,
                    {
                        status:
                            overColumn,

                        order:
                            newOrder
                    }
                );

            }

        } catch (err) {

            // Rollback if API fails

            setTasks(
                oldTasks
            );

            setError(
                "Failed to save drag and drop. Changes rolled back."
            );

        }
    };


    // ==================== LOADING ====================

    if (loading) {

        return (
            <div
                style={{
                    padding: "40px"
                }}
            >
                <h2>
                    Loading board...
                </h2>
            </div>
        );

    }


    // ==================== UI ====================

    return (

        <div
            style={{
                padding: "30px"
            }}
        >

            {/* BACK BUTTON */}

            <button
                onClick={() =>
                    navigate(-1)
                }
            >
                ← Back
            </button>


            <h1>
                Kanban Board
            </h1>


            {/* ERROR */}

            {error && (

                <p
                    style={{
                        color: "red"
                    }}
                >
                    {error}
                </p>

            )}


            {/* SUCCESS */}

            {success && (

                <p
                    style={{
                        color: "green"
                    }}
                >
                    {success}
                </p>

            )}


            {/* ====================
                EDIT TASK FORM
            ==================== */}

            {editingTask && (

                <form
                    onSubmit={editTask}
                    style={{
                        marginBottom: "25px",
                        padding: "20px",
                        border:
                            "1px solid #ddd",
                        borderRadius: "10px"
                    }}
                >

                    <h3>
                        Edit Task
                    </h3>


                    <input
                        value={
                            editingTask.title
                        }
                        onChange={(e) =>
                            setEditingTask({
                                ...editingTask,

                                title:
                                    e.target.value
                            })
                        }
                        placeholder="Task title"
                        required
                    />


                    <input
                        value={
                            editingTask.description ||
                            ""
                        }
                        onChange={(e) =>
                            setEditingTask({
                                ...editingTask,

                                description:
                                    e.target.value
                            })
                        }
                        placeholder="Description"
                    />


                    <select
                        value={
                            editingTask.priority
                        }
                        onChange={(e) =>
                            setEditingTask({
                                ...editingTask,

                                priority:
                                    e.target.value
                            })
                        }
                    >

                        <option value="low">
                            Low
                        </option>

                        <option value="medium">
                            Medium
                        </option>

                        <option value="high">
                            High
                        </option>

                    </select>


                    <select
                        value={
                            editingTask.status
                        }
                        onChange={(e) =>
                            setEditingTask({
                                ...editingTask,

                                status:
                                    e.target.value
                            })
                        }
                    >

                        <option value="todo">
                            TODO
                        </option>

                        <option value="in-progress">
                            IN PROGRESS
                        </option>

                        <option value="done">
                            DONE
                        </option>

                    </select>


                    <button
                        type="submit"
                    >
                        Save Changes
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            setEditingTask(null)
                        }
                    >
                        Cancel
                    </button>

                </form>

            )}


            {/* ====================
                CREATE TASK FORM
            ==================== */}

            <form
                onSubmit={createTask}
                style={{
                    marginBottom: "30px"
                }}
            >

                <h3>
                    Create New Task
                </h3>


                <input
                    placeholder="Task title"
                    value={title}
                    onChange={(e) =>
                        setTitle(
                            e.target.value
                        )
                    }
                    required
                />


                <input
                    placeholder="Description"
                    value={description}
                    onChange={(e) =>
                        setDescription(
                            e.target.value
                        )
                    }
                />


                <select
                    value={priority}
                    onChange={(e) =>
                        setPriority(
                            e.target.value
                        )
                    }
                >

                    <option value="low">
                        Low
                    </option>

                    <option value="medium">
                        Medium
                    </option>

                    <option value="high">
                        High
                    </option>

                </select>


                <select
                    value={status}
                    onChange={(e) =>
                        setStatus(
                            e.target.value
                        )
                    }
                >

                    <option value="todo">
                        TODO
                    </option>

                    <option value="in-progress">
                        IN PROGRESS
                    </option>

                    <option value="done">
                        DONE
                    </option>

                </select>


                <button
                    type="submit"
                >
                    Add Task
                </button>

            </form>


            {/* ====================
                KANBAN BOARD
            ==================== */}

            <DndContext
                sensors={sensors}
                collisionDetection={
                    closestCorners
                }
                onDragEnd={
                    handleDragEnd
                }
            >

                <div
                    style={{
                        display: "grid",

                        gridTemplateColumns:
                            "repeat(3, 1fr)",

                        gap: "20px",

                        alignItems:
                            "start"
                    }}
                >

                    {columns.map(
                        (column) => {

                            const columnTasks =
                                getColumnTasks(
                                    column.id
                                );

                            return (

                                <div
                                    key={column.id}
                                    style={{
                                        background:
                                            "#f4f5f7",

                                        padding:
                                            "20px",

                                        borderRadius:
                                            "10px",

                                        minHeight:
                                            "400px"
                                    }}
                                >

                                    <h2>
                                        {column.title}
                                    </h2>


                                    <SortableContext
                                        items={
                                            columnTasks.map(
                                                (task) =>
                                                    task._id
                                            )
                                        }
                                        strategy={
                                            verticalListSortingStrategy
                                        }
                                    >

                                        {columnTasks.map(
                                            (task) => (

                                                <TaskCard
                                                    key={
                                                        task._id
                                                    }

                                                    task={
                                                        task
                                                    }

                                                    onDelete={
                                                        deleteTask
                                                    }

                                                    onEdit={
                                                        (
                                                            task
                                                        ) =>
                                                            setEditingTask(
                                                                {
                                                                    ...task
                                                                }
                                                            )
                                                    }
                                                />

                                            )
                                        )}

                                    </SortableContext>

                                </div>

                            );

                        }
                    )}

                </div>

            </DndContext>

        </div>

    );
}

export default BoardPage;