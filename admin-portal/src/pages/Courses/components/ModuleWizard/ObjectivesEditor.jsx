import React, { useState } from 'react';
import { GripVertical, X, Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableObjective = ({ id, objective, onRemove, onChange }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center gap-2 group ${isDragging ? 'opacity-50' : ''}`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="text-gray-600 hover:text-white cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical size={16} />
      </div>
      <input
        type="text"
        value={objective.text}
        onChange={(e) => onChange(id, e.target.value)}
        placeholder="e.g. Understand Routing"
        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff0064] transition-colors"
      />
      <button 
        type="button"
        onClick={() => onRemove(id)}
        className="text-gray-500 hover:text-red-400 p-2 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  );
};

const ObjectivesEditor = ({ objectives = [], onChange }) => {
  // We need objects with unique IDs for dnd-kit to work smoothly
  // Initialize with IDs if they are just strings
  const [items, setItems] = useState(() => 
    objectives.map((obj, i) => ({ id: `obj-${Date.now()}-${i}`, text: typeof obj === 'string' ? obj : obj }))
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Propagate change up
        onChange(newItems.map(i => i.text).filter(t => t.trim() !== ''));
        return newItems;
      });
    }
  };

  const handleChange = (id, newText) => {
    const newItems = items.map(item => item.id === id ? { ...item, text: newText } : item);
    setItems(newItems);
    onChange(newItems.map(i => i.text).filter(t => t.trim() !== ''));
  };

  const handleRemove = (id) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    onChange(newItems.map(i => i.text).filter(t => t.trim() !== ''));
  };

  const handleAdd = () => {
    const newItems = [...items, { id: `obj-${Date.now()}`, text: '' }];
    setItems(newItems);
    // Focus management could be added here
  };

  return (
    <div className="space-y-3">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={items.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((item) => (
              <SortableObjective 
                key={item.id} 
                id={item.id} 
                objective={item}
                onChange={handleChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-2 text-sm text-[#ff0064] hover:text-[#ff4ecd] font-medium transition-colors px-1 py-2"
      >
        <Plus size={16} />
        Add Objective
      </button>
    </div>
  );
};

export default ObjectivesEditor;
