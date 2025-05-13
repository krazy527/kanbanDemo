import React from 'react';
import { CSS } from '@dnd-kit/utilities';

const TaskCard = ({ task, listeners, attributes, isDragging, onEdit, onDelete }) => {
    const style = {
        transform: attributes?.style?.transform || listeners?.style?.transform || undefined,
        transition: attributes?.style?.transition || listeners?.style?.transition || undefined,
        opacity: isDragging ? 1 : 1,
        // cursor: 'grab',
    };

    return (
        <div
            style={style}
            className="bg-white p-4 mb-3 rounded-md shadow-sm border border-gray-200 flex items-center justify-between cursor-pointer"
            onClick={(e) => {
                e.stopPropagation(); // Prevent interfering with drag
                onEdit?.(task);
            }}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{task.title}</h3>
                    {task.description && (
                        <p className="text-gray-600 text-xs mt-1">{task.description}</p>
                    )}
                </div>
            </div>
            <div className="drag-handle" {...listeners} {...attributes}>
                <span className="cursor-grab text-black">⠿</span>
            </div>
        </div>
    );
};

export default TaskCard;
