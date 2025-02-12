import {BaseNode} from "../utills/parser/types";
import {useState} from "react";
import {useSelectedNode} from "../context/hooks/context";
import {Link} from "react-router-dom";
import TreeNode from "./TreeNode";
import {isCenteredContainer, isIconText, isStackNode, isTitledContainer} from "../utills/parser/Parser";

interface InfoBarProps {
    obj?: BaseNode;
    handleReset: () => void;
}

const InfoBar = ({obj, handleReset}: InfoBarProps) => {
    const {isSaved, saveFullData, selectedNodeData, setSelectedNodeData, apiResponse} = useSelectedNode();
    const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({});

    const toggleNode = (id: string) => {
        setExpandedNodes((prev) => ({...prev, [id]: !prev[id]}));
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

    return (
        <div className="min-w-[400px] bg-[#0a0a0a] border-gray-200 p-4 h-screen overflow-y-auto">
            <Link to={"/"} className="block text-white mb-4">{`<- На главную`}</Link>
            <h1 className={"font-bold text-xl"}> <span className={"font-medium text-sm text-gray-400"}>Текущий топик - </span> {apiResponse && apiResponse.current.topicName}</h1>
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

            {obj ? (
                <TreeNode
                    node={obj}
                    expandedNodes={expandedNodes}
                    toggleNode={toggleNode}
                    handleClick={handleClick}
                    getChildren={getChildren}
                    parentIsStack={false}
                    isRoot={true}
                />
            ) : (
                <p className="text-white">No data</p>
            )}
        </div>
    );
};

export default InfoBar;
