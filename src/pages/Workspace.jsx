import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function Workspace() {
    const { workspaceId } = useParams();
    const navigate = useNavigate();

    const [workspace, setWorkspace] = useState(null);
    const [boards, setBoards] = useState([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchData = async () => {
        try {
            const workspaceResponse = await api.get("/workspaces");

            const currentWorkspace =
                workspaceResponse.data.workspaces.find(
                    (item) => item._id === workspaceId
                );

            if (!currentWorkspace) {
                setError("Workspace not found");
                return;
            }

            setWorkspace(currentWorkspace);

            const boardResponse = await api.get(
                `/boards/workspace/${workspaceId}`
            );

            setBoards(boardResponse.data.boards);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load workspace"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [workspaceId]);

    const createBoard = async (e) => {
        e.preventDefault();

        if (!name.trim()) return;

        try {
            const response = await api.post("/boards", {
                name,
                workspaceId
            });

            setBoards([...boards, response.data.board]);
            setName("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to create board"
            );
        }
    };

    const deleteBoard = async (boardId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this board?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/boards/${boardId}`);

            setBoards(
                boards.filter(
                    (board) => board._id !== boardId
                )
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete board"
            );
        }
    };

    if (loading) {
        return (
            <div className="dashboard">
                <h2>Loading workspace...</h2>
            </div>
        );
    }

    return (
        <div className="dashboard">

            <button
                onClick={() => navigate("/dashboard")}
                style={{ marginBottom: "25px" }}
            >
                ← Back to Dashboard
            </button>

            <div className="dashboard-header">
                <div>
                    <h1>{workspace?.name}</h1>
                    <p>
                        Create and manage Kanban boards for this workspace.
                    </p>
                </div>
            </div>

            {error && (
                <div className="error">
                    {error}
                </div>
            )}

            <form
                onSubmit={createBoard}
                className="workspace-form"
            >
                <input
                    type="text"
                    placeholder="Enter board name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <button type="submit">
                    + Create Board
                </button>
            </form>

            <h2>Boards</h2>

            {boards.length === 0 ? (
                <div className="workspace-card">
                    <h3>No boards yet</h3>
                    <p>
                        Create your first board to start adding and
                        managing tasks.
                    </p>
                </div>
            ) : (
                <div className="workspace-grid">
                    {boards.map((board) => (
                        <div
                            className="board-card"
                            key={board._id}
                        >
                            <h2>{board.name}</h2>

                            <p>
                                Manage tasks using your Kanban board.
                            </p>

                            <div className="task-actions">
                                <button
                                    onClick={() =>
                                        navigate(
                                            `/board/${board._id}`
                                        )
                                    }
                                >
                                    Open Board
                                </button>

                                <button
                                    onClick={() =>
                                        deleteBoard(board._id)
                                    }
                                    style={{
                                        background: "#dc2626"
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Workspace;