import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import KanbanColumn from './components/KanbanColumn';
import AddTaskModal from './components/AddTaskModal';
import TaskCard from './components/TaskCard';

const API_URL = 'https://kanbandemo.onrender.com/tasks';

// Fetch all tasks from the API
const fetchTasks = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tasks = await response.json();
        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return []; // Return empty array on error
    }
};

// Create a new task via API
const createTask = async (task) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newTask = await response.json();
        return newTask;
    } catch (error) {
        console.error('Error creating task:', error);
        throw error; // Re-throw to handle in component
    }
};

// Update task (PUT)
const editTask = async (taskId, updatedData) => {
    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error editing task:', error);
        throw error;
    }
};

// Delete task
const deleteTask = async (taskId) => {
    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
};

// Update a task's status via API
const updateTaskStatus = async (taskId, newStatus) => {
    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'PATCH', // Use PATCH to update only the status
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const updatedTask = await response.json();
        return updatedTask;
    } catch (error) {
        console.error(`Error updating task ${taskId} status to ${newStatus}:`, error);
        throw error; // Re-throw to handle in component
    }
};

const columns = [
    {
        id: 'todo',
        title: 'To Do',
    },
    {
        id: 'in-progress',
        title: 'In Progress',
    },
    {
        id: 'done',
        title: 'Done',
    },
];

// --- Main App Component ---
const App = () => {
    const [tasks, setTasks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeId, setActiveId] = useState(null); // State to track the active dragged item ID
    const [editingTask, setEditingTask] = useState(null); // to track edit mode
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500); // Delay in ms

        return () => {
            clearTimeout(handler); // Cleanup previous timer on change
        };
    }, [searchQuery]);

    const handleEditTask = async (updatedTaskData) => {
        try {
            const updated = await editTask(editingTask.id, updatedTaskData);
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            setEditingTask(null);
            setIsModalOpen(false);
        } catch (err) {
            setError('Failed to edit task.');
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(taskId);
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
        } catch (err) {
            setError('Failed to delete task.');
        }
    };

    // Fetch tasks on component mount
    useEffect(() => {
        const loadTasks = async () => {
            setLoading(true);
            setError(null);
            const fetchedTasks = await fetchTasks();
            setTasks(fetchedTasks);
            setLoading(false);
        };
        loadTasks();
    }, []); // Empty dependency array means this runs once on mount

    // Handle adding a new task
    const handleAddTask = async (newTaskData) => {
        try {
            const addedTask = await createTask(newTaskData);
            setTasks([...tasks, addedTask]); // Add the new task to the state
        } catch (err) {
            setError('Failed to add task.');
            console.error('Error adding task:', err);
        }
    };

    const onDragStart = (e) => {
        setActiveId(e.active.id);
    };

    // Handle drag end event (This remains in App to update the main tasks state)
    const handleDragEnd = async (event) => {
        console.log(event);
        const { active, over } = event;

        if (!over) return;

        const draggedTaskId = active.id;

        const overType = over.data?.current?.type || 'Task';
        const overId = over.id;

        let targetStatus;

        if (overType === 'Column') {
            targetStatus = overId; // Dropped on the column directly
        } else if (overType === 'Task') {
            // Find the task being dropped on, and use its status
            const overTask = tasks.find((task) => task.id === overId);
            targetStatus = overTask?.status;
        }

        const validStatuses = ['todo', 'in-progress', 'done'];
        if (!targetStatus || !validStatuses.includes(targetStatus)) return;

        const draggedTask = tasks.find((task) => task.id === draggedTaskId);
        if (!draggedTask || draggedTask.status === targetStatus) return;

        const originalStatus = draggedTask.status;

        setTasks((prev) =>
            prev.map((task) =>
                task.id === draggedTaskId ? { ...task, status: targetStatus } : task
            )
        );

        try {
            await updateTaskStatus(draggedTaskId, targetStatus);
        } catch (err) {
            console.error('Failed to update task:', err);
            setError('Failed to update task status.');
            // Rollback
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === draggedTaskId ? { ...task, status: originalStatus } : task
                )
            );
        }
        setActiveId(null);
    };

    const renderTaskItem = (item, listeners, attributes, isDragging) => {
        if (!item) return null;
        return (
            <TaskCard
                key={item.id}
                task={item}
                listeners={listeners}
                attributes={attributes}
                isDragging={isDragging}
                onEdit={(task) => {
                    setEditingTask(task);
                    setIsModalOpen(true);
                }}
                onDelete={handleDeleteTask}
            />
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-xl">
                Loading tasks...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-red-600">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 h-screen flex flex-col">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-500">
                Task Management Dashboard
            </h1>
            <div className="flex items-center justify-end mb-6">
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-green text-white font-semibold rounded-md shadow-md hover:bg-green-700 transition duration-200 self-center border-1 border-white"
                >
                    Add New Task
                </button>
                <div className="flex justify-center ms-4">
                    <input
                        type="text"
                        placeholder="Search tasks by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border border-gray-300 rounded-md px-4 py-2 w-full max-w-md"
                    />
                </div>
            </div>

            {/* DndContext provides the drag and drop context */}
            <DndContext
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
                onDragStart={onDragStart}
            >
                <div className="flex flex-1 gap-4">
                    {/* Render the columns dynamically */}
                    {columns.map((column) => {
                        const filteredTasks = tasks
                            .filter((task) => task.status === column.id)
                            .filter((task) =>
                                task.title.toLowerCase().includes(debouncedQuery.toLowerCase())
                            );

                        return (
                            <KanbanColumn
                                key={column.id}
                                id={column.id}
                                title={column.title}
                                tasks={filteredTasks}
                                activeId={activeId}
                                renderTaskItem={renderTaskItem}
                            />
                        );
                    })}
                </div>

                <DragOverlay>
                    {activeId ? (
                        <TaskCard task={tasks.find((t) => t.id === activeId)} isDragging={true} />
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Add Task Modal */}
            <AddTaskModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                }}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                isEditing={!!editingTask}
                initialData={editingTask}
            />
        </div>
    );
};

export default App;
