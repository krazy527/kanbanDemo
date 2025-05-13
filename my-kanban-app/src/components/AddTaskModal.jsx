import React, { useState, useEffect } from 'react';

const AddTaskModal = ({
    isOpen,
    onClose,
    onAddTask,
    onEditTask,
    onDeleteTask,
    isEditing,
    initialData,
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('todo'); // Default status

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description);
            setStatus(initialData.status);
        } else {
            setTitle('');
            setDescription('');
            setStatus('todo');
        }
    }, [initialData]);

    const handleSubmit = () => {
        const task = { title, description, status: status };
        isEditing ? onEditTask(task) : onAddTask(task);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#000000d0] flex items-center justify-center">
            <div className="bg-black p-6 rounded shadow-md w-96 border-white-100 border-1">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        {isEditing ? 'Edit Task' : 'Add Task'}
                    </h2>
                    <div className="flex ml-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTask?.(initialData.id);
                            }}
                            className="text-red-500 hover:text-red-700 text-[8px]"
                            title="Delete Task"
                        >
                            Delete
                        </button>
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-500 text-sm font-bold mb-2">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-white-500 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="description"
                        className="block text-gray-500 text-sm font-bold mb-2"
                    >
                        Description (Optional)
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="3"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-white-500 leading-tight focus:outline-none focus:shadow-outline"
                    ></textarea>
                </div>

                <div className="mb-4">
                    <label htmlFor="status" className="block text-gray-500 text-sm font-bold mb-2">
                        Status
                    </label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-white-300 px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        {isEditing ? 'Update' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTaskModal;
