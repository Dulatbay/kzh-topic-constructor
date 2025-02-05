import {ReactNode, useEffect, useState} from "react";
import {BaseNode, IconText, NodeType, Stack, Text, TitledContainer} from "../utills/parser/types.ts";
import {SelectedNodeContext} from "./hooks/context.ts";
import {isCenteredContainer, isIconText, isStackNode, isTitledContainer} from "../utills/parser/Parser.tsx";

interface SelectedNodeProviderProps {
    children: ReactNode;
}

export const SelectedNodeProvider = ({children}: SelectedNodeProviderProps) => {
    const [selectedNodeData, setSelectedNodeData] = useState<BaseNode | null>(null);
    const [fullData, setFullData] = useState<BaseNode | null>(null);
    const [isSaved, setIsSaved] = useState(localStorage.getItem("isSaved") ? !(localStorage.getItem("isSaved") === "false") : true);
    const [isDeletable, setIsDeletable] = useState(false);
    const [isAvailableToAdd, setIsAvailableToAdd] = useState(false);

    useEffect(() => {
        if (selectedNodeData) {
            const findNodeById = (node: BaseNode, depth: number): BaseNode | null => {
                if (node.id === selectedNodeData.id) {
                    setIsDeletable(depth == 1)
                    setIsAvailableToAdd(node.nodeType == NodeType.STACK)
                    return node;
                }
                if (isStackNode(node)) {
                    for (const child of node.children) {
                        const found = findNodeById(child, 1);
                        if (found) {
                            return found;
                        }
                    }
                }
                if (isCenteredContainer(node)) {
                    return findNodeById(node.childNode, depth + 1);
                }
                if (isIconText(node)) {
                    return findNodeById(node.text, depth + 1);
                }
                if (isTitledContainer(node)) {
                    const byContent = findNodeById(node.content, depth + 1);
                    if (byContent) return byContent;
                    return findNodeById(node.titleText, depth + 1);
                }
                return null;
            };
            if (fullData) {
                const found = findNodeById(fullData, 0);
                setSelectedNodeData(found);
                return;
            }
        }
        setIsAvailableToAdd(false)
        setSelectedNodeData(null)
        setIsDeletable(false)
    }, [setSelectedNodeData, fullData, selectedNodeData]);

    const handleIsSaved = (isSaved: boolean) => {
        setIsSaved(isSaved)
        localStorage.setItem("isSaved", isSaved + "")
    }

    const updateSelectedNodeProperty = <T extends keyof (BaseNode & Stack & TitledContainer & Text & IconText)>(
        key: T,
        value: unknown
    ) => {
        if (!selectedNodeData || !fullData) return;

        const updatedNode = {...selectedNodeData, [key]: value};
        setSelectedNodeData(updatedNode);

        const updateNodeInTree = (node: BaseNode): BaseNode => {
            if (node.id === selectedNodeData.id) {
                return updatedNode;
            }
            if (isStackNode(node)) {
                return {
                    ...node,
                    children: node.children.map(updateNodeInTree),
                } as BaseNode;
            }
            if (isCenteredContainer(node)) {
                return {
                    ...node,
                    childNode: updateNodeInTree(node.childNode),
                } as BaseNode;
            }
            if (isIconText(node)) {
                return {
                    ...node,
                    text: updateNodeInTree(node.text),
                } as BaseNode;
            }
            if (isTitledContainer(node)) {
                return {
                    ...node,
                    titleText: updateNodeInTree(node.titleText),
                    content: updateNodeInTree(node.content),
                } as BaseNode;
            }
            return node;
        };

        setFullData(updateNodeInTree(fullData));
        handleIsSaved(false);
    };

    useEffect(() => {
        if (fullData) {
            localStorage.setItem("fullData", JSON.stringify(fullData));
        } else {
            setSelectedNodeData(null);
            localStorage.removeItem("fullData");
        }
    }, [fullData]);

    const deleteNodeById = (id: string, node: BaseNode | null): BaseNode | null => {
        if (!node) return null;

        if (isStackNode(node)) {
            return node.id === id ? null : {
                ...node,
                children: node.children
                    .filter((child) => child.id !== id)
                    .map((child) => deleteNodeById(id, child)),
            } as BaseNode;
        }

        if (isCenteredContainer(node)) {
            return node.id === id ? null : {
                ...node,
            } as BaseNode;
        }

        if (isIconText(node)) {
            return node.id === id ? null : {...node} as BaseNode;
        }

        if (isTitledContainer(node)) {
            return node.id === id ? null : {
                ...node,
                content: node.content.id === id ? null : deleteNodeById(id, node.content),
            } as BaseNode;
        }

        return node.id === id ? null : node;
    };

    const handleDeleteNode = () => {
        if (!selectedNodeData || !fullData) return;

        const updatedData = deleteNodeById(selectedNodeData.id, fullData);

        setFullData(updatedData);
        setSelectedNodeData(null);
        handleIsSaved(false);
    };

    const addNodeToSelectedStack = (newNode: BaseNode) => {
        if (!selectedNodeData || !fullData) return;
        const updateNodeInTree = (node: BaseNode): BaseNode => {
            if (node.id === selectedNodeData.id) {
                if (isStackNode(node)) {
                    return {
                        ...node,
                        children: node.children && node.children.length > 0 ? [...node.children, newNode] : [newNode],
                    } as Stack;
                }
            }
            if (isStackNode(node)) {
                return {
                    ...node,
                    children: node.children.map(updateNodeInTree),
                } as BaseNode;
            }
            if (isCenteredContainer(node)) {
                return {
                    ...node,
                    childNode: updateNodeInTree(node.childNode),
                } as BaseNode;
            }
            if (isIconText(node)) {
                return {
                    ...node,
                    text: updateNodeInTree(node.text),
                } as BaseNode;
            }
            if (isTitledContainer(node)) {
                return {
                    ...node,
                    titleText: updateNodeInTree(node.titleText),
                    content: updateNodeInTree(node.content),
                } as BaseNode;
            }
            return node;
        };

        setFullData(updateNodeInTree(fullData));
        handleIsSaved(false);
    };

    const saveFullData = () => {
        if (!fullData) return;

        fetch("your-api-endpoint", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(fullData),
        })
            .then((res) => res.json())
            .then(() => {
                console.log("Данные успешно сохранены");
                handleIsSaved(true);
            })
            .catch((err) => console.error("Ошибка при сохранении", err));
    };

    return (
        <SelectedNodeContext.Provider
            value={{
                setFullData,
                selectedNodeData,
                setSelectedNodeData,
                fullData,
                handleIsSaved,
                isSaved,
                isAvailableToAdd,
                addNodeToSelectedStack,
                updateSelectedNodeProperty,
                saveFullData,
                handleDeleteNode,
                isDeletable
            }}
        >
            {children}
        </SelectedNodeContext.Provider>
    );
};


