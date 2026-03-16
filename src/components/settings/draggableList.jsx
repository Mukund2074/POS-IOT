import React, { useState, useEffect } from 'react';
import DragListView from 'react-drag-listview';

const DraggableListComponent = ({ list }) => {
    const [draggableList, setDraggableList] = useState(list);

    // Handle reordering the list after drag ends
    const onDragEnd = (fromIndex, toIndex) => {
        const updatedList = [...draggableList];
        
        // Remove the dragged item
        const [movedItem] = updatedList.splice(fromIndex, 1);

        // Insert it at the new index
        updatedList.splice(toIndex, 0, movedItem);
        
        // Update the state with the new list order
        setDraggableList(updatedList);
    };

    // Render each list item
    const renderListItem = (item, index) => (
        <div
            key={item.id}
            style={{
                padding: '10px',
                margin: '5px 0',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                border: '1px solid #ddd',
                cursor: 'move', // Indicating that the item is draggable
            }}
        >
            {item.name}
        </div>
    );

    // Re-initialize list if the parent prop changes
    useEffect(() => {
        setDraggableList(list);
    }, [list]);

    return (
        <div>
            <DragListView
                dragClass="dragging"  // Optional: class for dragging
                onDragEnd={onDragEnd}  // Callback for when the drag ends
                nodeSelector="div"  // Ensure that div elements inside DragListView are draggable
            >
                {draggableList.map((item, index) => (
                    <div key={item.id} index={index}>
                        {renderListItem(item, index)}
                    </div>
                ))}
            </DragListView>
        </div>
    );
};

export default DraggableListComponent;
