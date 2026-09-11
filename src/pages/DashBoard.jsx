import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
    const [workspaces, setWorkspaces] = useState([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { logout } = useAuth();
    const navigate = useNavigate();

    const fetchWorkspaces = async () => {
        try {
            const response = await api.get("/workspaces");
            setWorkspaces(response.data.workspaces);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load workspaces"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const createWorkspace = async (e) => {
        e.preventDefault();

        if (!name.trim()) return;

        try {
            const response = await api.post("/workspaces", {
                name
            });

            setWorkspaces([
                ...workspaces,
                response.data.workspace
            ]);

            setName("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to create workspace"
            );
        }
    };

    const deleteWorkspace = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this workspace?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/workspaces/${id}`);

            setWorkspaces(
                workspaces.filter(
                    (workspace) => workspace._id !== id
                )
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete workspace"
            );
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="dashboard">

            <div className="dashboard-header">
                <div>
                    <h1>My Workspaces</h1>
                    <p>Manage your projects and collaborate with your team.</p>
                </div>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>

            {error && (
                <div className="error">
                    {error}
                </div>
            )}

            <form
                onSubmit={createWorkspace}
                className="workspace-form"
            >
                <input
                    type="text"
                    placeholder="Enter workspace name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <button type="submit">
                    + Create Workspace
                </button>
            </form>

            <h2>Your Workspaces</h2>

            {loading ? (
                <p>Loading workspaces...</p>
            ) : workspaces.length === 0 ? (
                <div className="workspace-card">
                    <h3>No workspaces yet</h3>
                    <p>
                        Create your first workspace to start managing
                        your Kanban boards.
                    </p>
                </div>
            ) : (
                <div className="workspace-grid">
                    {workspaces.map((workspace) => (
                        <div
                            className="workspace-card"
                            key={workspace._id}
                        >
                            <h2>{workspace.name}</h2>

                            <p>
                                Workspace for organizing your boards
                                and tasks.
                            </p>

                            <div className="task-actions">
                                <button
                                    onClick={() =>
                                        navigate(
                                            `/workspace/${workspace._id}`
                                        )
                                    }
                                >
                                    Open Workspace
                                </button>

                                <button
                                    onClick={() =>
                                        deleteWorkspace(
                                            workspace._id
                                        )
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

export default Dashboard;