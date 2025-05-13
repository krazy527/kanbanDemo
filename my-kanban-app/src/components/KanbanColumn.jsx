import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'; // Import SortableContext

// Import SortableItem component
import SortableItem from './SortableItem';

// Kanban Column Component (conceptually DroppableSection)
// Now accepts renderTaskItem and activeId props
const KanbanColumn = ({ id, title, tasks, renderTaskItem, activeId }) => {
  const { setNodeRef } = useDroppable({
    id: id,
    data: {
      type: 'Column',
      status: id, // Use the id as the status value
    },
  });

  // Get the IDs of the tasks in this column for SortableContext
  const taskIds = tasks.map(task => task.id);

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-100 p-4 rounded-md flex-1 min-w-[280px] max-w-[400px] flex flex-col h-full"
    >
      <h2 className={`text-lg font-bold mb-4 ${id === 'todo' ? 'text-blue-600' : id === 'in-progress' ? 'text-yellow-600' : 'text-green-600'}`}>
        {title} ({tasks.length})
      </h2>
      <div className="flex-grow overflow-y-auto pr-2"> {/* Added overflow for scrolling */}
        {/* SortableContext makes the items within this column sortable */}
        {/* Although intra-column sorting isn't required, SortableContext is needed
            if useSortable is used for the items, which is a common pattern with dnd-kit.
            We'll use SortableItem which uses useSortable internally. */}
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            // Render SortableItem for each task
            <SortableItem key={task.id} id={task.id}>
              {/* Use a render prop to pass listeners/attributes to the item renderer */}
              {({ listeners, attributes }) =>
                renderTaskItem(task, listeners, attributes, task.id === activeId)
              }
            </SortableItem>
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;