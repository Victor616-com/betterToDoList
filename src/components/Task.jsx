import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DeleteIcon from "./DeleteIcon";

const Task = ({ task, darkenedColor, taskBorder, deleteTask, updateTask, dragIcon }) => {
    const [hoveredTaskId, setHoveredTaskId] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const textareaRef = useRef(null);
    const taskRef = useRef(null);
    const [taskHeight, setTaskHeight] = useState(null);

    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
        disabled: editMode,
    });

    useEffect(() => {
        if (isDragging && taskRef.current) {
            setTaskHeight(taskRef.current.offsetHeight);
        }
    }, [isDragging]);

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    const toggleEditMode = (e) => {
        e.stopPropagation();
        setEditMode((prev) => !prev);
        setHoveredTaskId(null);
    };

    useEffect(() => {
        if (editMode) {
            const handleInput = () => {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            };

            const textarea = textareaRef.current;
            textarea.addEventListener('input', handleInput);

            handleInput();

            return () => {
                textarea.removeEventListener('input', handleInput);
            };
        }
    }, [editMode]);

    if (isDragging) {
        return <div ref={setNodeRef} className="task-placeholder" style={{ style, height: taskHeight }}>Dragging</div>;
    }

    if (editMode) {
        return (
            <div
                ref={setNodeRef}
                className="task"
                style={{
                    ...style,
                    backgroundColor: darkenedColor,
                    borderColor: taskBorder,
                    borderWidth: 2,
                    borderStyle: 'solid',
                }}
            >
                <textarea
                    ref={textareaRef}
                    value={task.content}
                    style={{ overflow: 'hidden', resize: 'none', backgroundColor: darkenedColor, border: 'none' }}
                    autoFocus
                    placeholder="Task content here"
                    onBlur={toggleEditMode}
                    onKeyDown={e => {
                        if (e.key === "Enter") toggleEditMode();
                    }}
                    onFocus={(e) => e.target.select()}
                    onChange={e => updateTask(task.id, e.target.value)}
                ></textarea>
            </div>
        );
    }

    return (
        <div
            ref={taskRef}
            className="task"
            style={{
                ...style,
                backgroundColor: darkenedColor,
                borderColor: taskBorder,
                borderWidth: 2,
                borderStyle: 'solid',
            }}
            onMouseEnter={() => setHoveredTaskId(task.id)}
            onMouseLeave={() => setHoveredTaskId(null)}
            onClick={toggleEditMode}
        >
            <div className="drag-task-wrapper">
                <img
                    {...attributes}
                    {...listeners}
                    className="drag-icon"
                    src={dragIcon}
                    style={{
                        opacity: hoveredTaskId === task.id ? 1 : 0,
                        transition: 'opacity 0.2s ease-in-out'
                    }}
                />
                <p>{task.content}</p>
            </div>

            <button
                className="delete-task-btn"
                style={{
                    opacity: hoveredTaskId === task.id ? 1 : 0,
                    transition: 'opacity 0.2s ease-in-out'
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                }}
            >
                <DeleteIcon />
            </button>
        </div>
    );
};

export default Task;
