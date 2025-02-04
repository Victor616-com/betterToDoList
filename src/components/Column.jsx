import { useMemo, useState } from "react";
import DeleteIcon from "./DeleteIcon";
import EditIcon from "./EditIcon";
import dragIcon from "../assets/drag.svg"
import { horizontalListSortingStrategy, rectSwappingStrategy, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PlusIcon from "./PlusIcon";
import Task from "./Task";

const darkenColor = (color, amount) => {
    let usePound = false;

    if (color[0] === "#") {
        color = color.slice(1);
        usePound = true;
    }

    const num = parseInt(color, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    return (usePound ? "#" : "") + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

const Column = ({ column, setColumns, columns, tasks, createTask, deleteTask,  updateTask }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(column.newTitle || column.title);
    const tasksIds = useMemo(() => {
        return tasks.map(task => task.id)
    }, [tasks])
    

    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column: {...column, title: newTitle },
        },
        
    });

    const style = {
        
        
        transform: CSS.Transform.toString(transform),
    };

    if (isDragging) {
        return <div ref={setNodeRef} className="column-placeholder"></div>
    }
    const handleDeleteColumn = (indexToRemove) => {
        const updatedColumns = columns.filter((col) => col.id !== indexToRemove)
                                     .map((col, idx) => ({ ...col, title: `Column ${idx + 1}` }));
        setColumns(updatedColumns);
    };

    const handleTitleChange = (event) => {
        setNewTitle(event.target.value);
    };

    const handleTitleSave = () => {
        if (newTitle !== '') {
            const updatedColumns = columns.map((col) =>
                col.id === column.id ? { ...col, title: newTitle } : col
            );
            setColumns(updatedColumns);
            setIsEditing(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleTitleSave();
        }
    }

    const darkenedColor = darkenColor(column.bgColor, -12); // Adjust the amount to control darkness
    const taskBorder = darkenColor(column.bgColor, -15);

    


    return (
        <div 
            ref={setNodeRef}
            className="column" 
            style={{  backgroundColor: column.bgColor }}>
            <div  className="column-title" style={{ backgroundColor: darkenedColor }}>
                <div className="drag-tite-wrapper">
                    <img {...attributes} {...listeners} className="drag-icon" src={dragIcon}></img>
                    {isEditing ? (
                        <input
                            type="text"
                            value={newTitle}
                            onChange={handleTitleChange}
                            onBlur={handleTitleSave}
                            onKeyDown={handleKeyDown}
                            onFocus={(e) => e.target.select()}
                            autoFocus
                        />
                    ) : (
                        <h3 onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
                            {newTitle && newTitle !== column.title ? newTitle : column.title}
                        </h3>
                    )}
                </div>
                
                <div className="edit-delete-wrapper">
                    <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}><EditIcon /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteColumn(column.id); }}><DeleteIcon /></button>
                </div>
            </div>
            <div className="column-content">
                <SortableContext items={tasksIds} strategy={verticalListSortingStrategy} >
                    {tasks.map((task) => (
                        
                        <Task 
                            key={task.id} 
                            task={task} 
                            darkenedColor={darkenedColor} 
                            taskBorder={taskBorder} 
                            DeleteIcon={DeleteIcon} 
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                            dragIcon={dragIcon}/>
                    ))}
                </SortableContext>
                
                
            </div>
            <div className="add-task">
                <button className="add-task-btn" onClick={() => {
                    createTask(column.id);
                }}>
                    <PlusIcon /> Add Task
                </button>
            </div>
        </div>
    );
}

export default Column;
