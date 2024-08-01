const { useState, useEffect } = React;

const initialColumns = {
    backlog: {
        title: "Backlog",
        items: []
    },
    ready: {
        title: "Ready",
        items: ["Task 1", "Task 2", "Task 3"]
    },
    inprogress: {
        title: "In Progress",
        items: ["Task 4"]
    },
    finished: {
        title: "Finished",
        items: ["Task 5"]
    }
};

function KanbanBoard({ role }) {
    const [columns, setColumns] = useState(initialColumns);
    const [newCards, setNewCards] = useState({}); // Tracks new card input fields
    const [newItem, setNewItem] = useState("");

    useEffect(() => {
        const savedColumns = JSON.parse(localStorage.getItem("kanbanColumns"));
        if (savedColumns) {
            setColumns(savedColumns);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("kanbanColumns", JSON.stringify(columns));
    }, [columns]);

    const onDragStart = (event, item, sourceColumn) => {
        event.dataTransfer.setData("item", item);
        event.dataTransfer.setData("sourceColumn", sourceColumn);
    };

    const onDrop = (event, targetColumn) => {
        const item = event.dataTransfer.getData("item");
        const sourceColumn = event.dataTransfer.getData("sourceColumn");

        if (sourceColumn !== targetColumn) {
            setColumns((prevColumns) => {
                const sourceItems = [...prevColumns[sourceColumn].items].filter(i => i !== item);
                const targetItems = [...prevColumns[targetColumn].items, item];
                return {
                    ...prevColumns,
                    [sourceColumn]: { ...prevColumns[sourceColumn], items: sourceItems },
                    [targetColumn]: { ...prevColumns[targetColumn], items: targetItems }
                };
            });
        }
    };

    const onDragOver = (event) => {
        event.preventDefault();
    };

    const handleAddCard = (columnKey) => {
        if (!newItem.trim()) return;

        setColumns(prevColumns => {
            const updatedItems = [...prevColumns[columnKey].items, newItem];
            return {
                ...prevColumns,
                [columnKey]: { ...prevColumns[columnKey], items: updatedItems }
            };
        });

        setNewItem("");
        setNewCards({});
    };

    const handleSelectCard = (columnKey, fromColumn) => {
        const task = columns[fromColumn].items[0];
        if (task) {
            setColumns(prevColumns => {
                const sourceItems = [...prevColumns[fromColumn].items].filter(i => i !== task);
                const targetItems = [...prevColumns[columnKey].items, task];
                return {
                    ...prevColumns,
                    [fromColumn]: { ...prevColumns[fromColumn], items: sourceItems },
                    [columnKey]: { ...prevColumns[columnKey], items: targetItems }
                };
            });
        }
    };

    const canAddCard = role === 'admin';
    const canMoveCard = role === 'admin' || role === 'user';

    return (
        <div className="kanban-board">
            {Object.keys(columns).map((columnKey) => (
                <div
                    key={columnKey}
                    className="kanban-column"
                    onDragOver={onDragOver}
                    onDrop={(event) => canMoveCard && onDrop(event, columnKey)}
                >
                    <h2>{columns[columnKey].title}</h2>
                    {columns[columnKey].items.map((item, index) => (
                        <div
                            key={index}
                            className="kanban-item"
                            draggable={canMoveCard}
                            onDragStart={(event) => canMoveCard && onDragStart(event, item, columnKey)}
                        >
                            {item}
                        </div>
                    ))}
                    {canAddCard && newCards[columnKey] ? (
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onBlur={() => handleAddCard(columnKey)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleAddCard(columnKey);
                                }
                            }}
                            autoFocus
                        />
                    ) : (
                        canAddCard && <button onClick={() => setNewCards({ ...newCards, [columnKey]: true })}>Add Card</button>
                    )}
                </div>
            ))}
        </div>
    );
}

<React.StrictMode>
    <KanbanBoard role="admin" />
</React.StrictMode>