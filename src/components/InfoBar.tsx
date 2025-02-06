import {BaseNode} from "../utills/parser/types.ts";
import {useState} from "react";
import {FaChevronDown, FaChevronRight} from "react-icons/fa";
import {isCenteredContainer, isIconText, isStackNode, isTextNode, isTitledContainer} from "../utills/parser/Parser.tsx";
import {useSelectedNode} from "../context/hooks/context.ts";
import {Link} from "react-router-dom";

const InfoBar = ({obj, handleReset}: { obj?: BaseNode, handleReset: () => void }) => {
    const {isSaved, saveFullData, selectedNodeData, setSelectedNodeData} = useSelectedNode();
    const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({});

    const toggleNode = (id: string) => {
        setExpandedNodes((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleClick = (node: BaseNode) => {
        setSelectedNodeData(node);
    };

    const getChildren = (node: BaseNode): BaseNode[] | null => {
        if (isStackNode(node)) return node.children;
        if (isTitledContainer(node)) return [node.titleText, node.content];
        if (isCenteredContainer(node)) return [node.childNode];
        if (isIconText(node)) return [node.text];
        return null;
    };

    const handleSave = () => {
        saveFullData();
    };

    const expandCurrentNode = () => {
        if (!selectedNodeData || !obj) return;

        const findAndExpandPath = (node: BaseNode, path: string[] = []): string[] | null => {
            if (node.id === selectedNodeData.id) return [...path, node.id];
            const children = getChildren(node);
            if (children) {
                for (const child of children) {
                    const result = findAndExpandPath(child, [...path, node.id]);
                    if (result) return result;
                }
            }
            return null;
        };

        const pathToSelected = findAndExpandPath(obj);

        if (pathToSelected) {
            const expandedMap = pathToSelected.reduce((acc, id) => {
                acc[id] = true;
                return acc;
            }, {} as { [key: string]: boolean });

            setExpandedNodes(expandedMap);
        }
    };

    const renderTree = (node: BaseNode): JSX.Element => {
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
                        expandedNodes[node.id] ? <FaChevronDown className="mr-2 text-gray-400"/> :
                            <FaChevronRight className="mr-2 text-gray-400"/>
                    ) : (
                        <span className="w-4"></span>
                    )}
                    <span className="text-white">[{displayName}]</span>
                </div>
                {hasChildren && expandedNodes[node.id] && (
                    <div className="pl-4 border-l border-gray-600">
                        {children!.map(renderTree)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-w-[400px] bg-[#0a0a0a] border-gray-200 p-4 h-screen overflow-y-auto">
            <Link to={"/"} className="block text-white mb-4">{`<- На главную`}</Link>

            <p className={`text-sm ${!isSaved ? "text-red-500" : "text-green-500"}`}>
                {!isSaved ? "Не сохранено" : "Сохранено"}
            </p>
            <button
                className="mt-4 w-full p-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-500 transition mb-8"
                onClick={handleSave}
            >
                Сохранить
            </button>
            <button
                className="mt-4 w-full p-3 bg-gray-600 text-white font-bold rounded hover:bg-gray-500 transition mb-8"
                onClick={handleReset}
            >
                По умолчанию
            </button>
            <button
                className="w-full p-3 bg-gray-600 text-white font-bold rounded hover:bg-gray-500 transition mb-4"
                onClick={expandCurrentNode}
                disabled={!selectedNodeData?.id}
            >
                Найти выбранный элемент
            </button>
            {obj ? renderTree(obj) : <p className="text-white">No data</p>}
        </div>
    );
};

export default InfoBar;
