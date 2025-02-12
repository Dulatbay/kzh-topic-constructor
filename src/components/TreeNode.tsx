import { useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { BaseNode } from "../utills/parser/types";
import { isCenteredContainer, isIconText, isStackNode, isTextNode, isTitledContainer } from "../utills/parser/Parser";
import { useSelectedNode } from "../context/hooks/context";

interface TreeNodeProps {
    node: BaseNode;
    expandedNodes: { [key: string]: boolean };
    toggleNode: (id: string) => void;
    handleClick: (node: BaseNode) => void;
    getChildren: (node: BaseNode) => BaseNode[] | null;
    /** Если true – узел является прямым ребёнком стека, т.е. его можно перетаскивать */
    parentIsStack?: boolean;
    /** Если true, то узел является корневым и не должен быть draggable */
    isRoot?: boolean;
}

const TreeNode = ({
                      node,
                      expandedNodes,
                      toggleNode,
                      handleClick,
                      getChildren,
                      parentIsStack = false,
                      isRoot = false,
                  }: TreeNodeProps) => {
    const { selectedNodeData, moveNode } = useSelectedNode();
    const [isDragOver, setIsDragOver] = useState(false);

    let displayName = "Unknown Node";
    if (isStackNode(node)) displayName = "Stack";
    if (isTextNode(node)) displayName = "Text";
    if (isIconText(node)) displayName = "IconText";
    if (isTitledContainer(node)) displayName = "TitledContainer";
    if (isCenteredContainer(node)) displayName = "CenteredContainer";

    const children = getChildren(node);
    const hasChildren = children && children.length > 0;
    const isSelected = selectedNodeData?.id === node.id;
    const borderStyle = isSelected ? "border-2 border-blue-500 bg-gray-800" : "";

    // Узел можно перетаскивать только если он является прямым потомком стека и не является корневым.
    const isDraggable = parentIsStack && !isRoot;

    // --- Обработчики drag & drop ---
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isDraggable) return;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", node.id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isDraggable) return;
        e.preventDefault();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isDraggable) return;
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        if (!isDraggable) return;
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isDraggable) return;
        e.preventDefault();
        setIsDragOver(false);
        const draggedNodeId = e.dataTransfer.getData("text/plain");
        if (draggedNodeId && draggedNodeId !== node.id) {
            const boundingRect = e.currentTarget.getBoundingClientRect();
            const relativeY = e.clientY - boundingRect.top;
            const height = boundingRect.height;
            let dropPosition: "before" | "after" | "inside";
            if (relativeY < height * 0.33) {
                dropPosition = "before";
            } else if (relativeY > height * 0.66) {
                dropPosition = "after";
            } else {
                dropPosition = "inside";
            }
            console.log("Dropped", draggedNodeId, "on", node.id, "at", dropPosition);
            moveNode(draggedNodeId, node.id, dropPosition);
        }
    };
    // --- Конец обработчиков ---

    return (
        <div className="pl-4">
            <div
                className={`flex items-center cursor-pointer py-1 px-2 rounded ${borderStyle} ${isDragOver ? "bg-blue-500" : ""}`}
                onClick={() => {
                    handleClick(node);
                    toggleNode(node.id);
                }}
                draggable={isDraggable}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {hasChildren ? (
                    expandedNodes[node.id] ? (
                        <FaChevronDown className="mr-2 text-gray-400" />
                    ) : (
                        <FaChevronRight className="mr-2 text-gray-400" />
                    )
                ) : (
                    <span className="w-4"></span>
                )}
                <span className="text-white">[{displayName}]</span>
            </div>
            {hasChildren && expandedNodes[node.id] && (
                <div className="pl-4 border-l border-gray-600">
                    {children!.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            expandedNodes={expandedNodes}
                            toggleNode={toggleNode}
                            handleClick={handleClick}
                            getChildren={getChildren}
                            isRoot={false}
                            parentIsStack={isStackNode(node)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TreeNode;
