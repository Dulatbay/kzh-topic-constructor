import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { BaseNode } from "../utills/parser/types.ts";
import { isCenteredContainer, isIconText, isStackNode, isTextNode, isTitledContainer } from "../utills/parser/Parser.tsx";
import { useSelectedNode } from "../context/hooks/context.ts";

interface TreeNodeProps {
    node: BaseNode;
    expandedNodes: { [key: string]: boolean };
    toggleNode: (id: string) => void;
    handleClick: (node: BaseNode) => void;
    getChildren: (node: BaseNode) => BaseNode[] | null;
}

const TreeNode = ({ node, expandedNodes, toggleNode, handleClick, getChildren }: TreeNodeProps) => {
    const { selectedNodeData } = useSelectedNode();

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

    return (
        <div key={node.id} className="pl-4">
            <div
                className={`flex items-center cursor-pointer py-1 px-2 rounded ${borderStyle}`}
                onClick={() => {
                    handleClick(node);
                    toggleNode(node.id);
                }}
            >
                {hasChildren ? (
                    expandedNodes[node.id] ? <FaChevronDown className="mr-2 text-gray-400" /> : <FaChevronRight className="mr-2 text-gray-400" />
                ) : (
                    <span className="w-4"></span>
                )}
                <span className="text-white">[{displayName}]</span>
            </div>
            {hasChildren && expandedNodes[node.id] && (
                <div className="pl-4 border-l border-gray-600">{children!.map((child) => (
                    <TreeNode
                        key={child.id}
                        node={child}
                        expandedNodes={expandedNodes}
                        toggleNode={toggleNode}
                        handleClick={handleClick}
                        getChildren={getChildren}
                    />
                ))}</div>
            )}
        </div>
    );
};

export default TreeNode;
