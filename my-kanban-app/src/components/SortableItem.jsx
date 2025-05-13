import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// A wrapper component that uses useSortable and provides its props via render prop
const SortableItem = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    // Note: zIndex and opacity for the *dragged* item are handled by DragOverlay.
    // This style applies to the original item's placeholder.
    opacity: isDragging ? 0 : 1, // Hide the original item when dragging
  };

  // Pass the ref, style, listeners, and attributes to the child component
  // The child component (TaskCard) will receive these via the render prop
  return (
    <div ref={setNodeRef} style={style}>
      {/* Render prop pattern: call children function with dnd props */}
      {children({ listeners, attributes, isDragging })}
    </div>
  );
};

export default SortableItem;