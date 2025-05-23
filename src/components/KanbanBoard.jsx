import { useEffect, useMemo, useState } from "react";
import PlusIcon from "./PlusIcon";
import Column from "./Column";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import Task from "./Task";

const KanbanBoard = () => {
    const [columns, setColumns] = useState(() => {
        const savedColumns = localStorage.getItem("columns");
        return savedColumns ? JSON.parse(savedColumns) : [];
    });
    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem("tasks");
        return savedTasks ? JSON.parse(savedTasks) : [];
    });

    const colors = ["#7C00FE", "#F5014F", "#27CA86", "#FFAF01", "#0188FF", "#E14942"];
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
    const [activeColumn, setActiveColumn] = useState(null);
    const [activeTask, setActiveTask] = useState(null);

    function createNewColumn() {
        const columnToAdd = {
            id: generateID(),
            title: `Column ${columns.length + 1}`,
            newTitle: '',
            bgColor: generateColor()
        };
        setColumns([...columns, columnToAdd]);
    }

    function generateID() {
        return Math.floor(Math.random() * 10001);
    }

    function generateColor() {
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Morten: Callback function to change the specific columns background color
    const changeBgColor = (id, newColor) => {
        setColumns(columns.map(column => 
            column.id === id ? { ...column, bgColor: newColor } : column
        ));
    };

    function onDragStart(event) {
        const { active } = event;
        if (active.data.current?.type === "Column") {
            setActiveColumn(active.data.current.column);
            return;
        } 
        if (active.data.current?.type === "Task") {
            setActiveTask(active.data.current.task);
            return;
        }
    }

    function onDragEnd(event) {
        const { active, over } = event;
        if (!over) {
            // Reset active column and task if no valid drop target
            setActiveColumn(null);
            setActiveTask(null);
            return;
        }

        if (active.id !== over.id) {
            if (active.data.current?.type === "Column") {
                const oldIndex = columns.findIndex(col => col.id === active.id);
                const newIndex = columns.findIndex(col => col.id === over.id);
                setColumns(arrayMove(columns, oldIndex, newIndex));
                setActiveColumn(null);
            } else if (active.data.current?.type === "Task") {
                const oldIndex = tasks.findIndex(task => task.id === active.id);
                const newIndex = tasks.findIndex(task => task.id === over.id);
                setTasks(arrayMove(tasks, oldIndex, newIndex));
                setActiveTask(null);
            }
        } else {
            setActiveColumn(null);
            setActiveTask(null);
        }
    }

    function createTask(columnId) {
        const newTask = {
            id: generateID(),
            columnId,
            content: `Task ${tasks.length + 1}`,
        };
        setTasks([...tasks, newTask]);
    }

    function deleteTask(id) {
        setTasks(tasks.filter(task => task.id !== id));
    }

    function updateTask(id, content) {
        setTasks(tasks.map(task => {
            if (task.id !== id) return task;
            return { ...task, content };
        }));
    }

    // Save columns to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("columns", JSON.stringify(columns));
    }, [columns]);

    // Save tasks to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    return (
        <div className="app-content-wrapper">
            <DndContext onDragStart={onDragStart} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={columnsId} strategy={verticalListSortingStrategy}>

                    <div className="columns-wrapper">
                       
                        {columns.map((column) => (
                            
                            <Column
                                key={column.id}
                                column={column}
                                setColumns={setColumns}
                                columns={columns}
                                createTask={createTask}
                                tasks={tasks.filter(task => task.columnId === column.id)}
                                deleteTask={deleteTask}
                                updateTask={updateTask}
                                colors={colors}
                                // Morten: changeBgColor callback function transferred to child as prop
                                changeBgColor={changeBgColor} 
                            />
                        ))}
                    </div>
                </SortableContext>
                <div className="add-column-wrapper">
                    <button className="add-column" onClick={createNewColumn}><PlusIcon /> Add Column</button>
                </div>
                {createPortal(
                    <DragOverlay>
                        {activeColumn && (
                            <Column 
                                column={activeColumn} 
                                tasks={tasks.filter((task) => task.columnId === activeColumn.id)} 
                                createTask={createTask} 
                            />
                        )}
                        {activeTask && <Task task={activeTask} />}
                    </DragOverlay>, document.body
                )}
            </DndContext>
        </div>
    );
}

export default KanbanBoard;
