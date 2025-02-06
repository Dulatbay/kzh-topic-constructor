import {ReactNode, useCallback, useEffect, useState} from "react";
import {BaseNode, IconText, NodeType, Stack, Text, TitledContainer} from "../utills/parser/types.ts";
import {SelectedNodeContext} from "./hooks/context.ts";
import {isCenteredContainer, isIconText, isStackNode, isTitledContainer} from "../utills/parser/Parser.tsx";
import {useSetTopicContentMutation} from "../services/module/api.ts";
import {TopicDetailResponse} from "../services/module/types.ts";

interface SelectedNodeProviderProps {
    children: ReactNode;
}

export const SelectedNodeProvider = ({children}: SelectedNodeProviderProps) => {
    const [selectedNodeData, setSelectedNodeData] = useState<BaseNode | null>(null);
    const [fullData, setFullData] = useState<BaseNode | null>(null);
    const [apiResponse, setApiResponse] = useState<TopicDetailResponse | null>(localStorage.getItem("apiResponse") ? JSON.parse(localStorage.getItem("apiResponse")!) : null);
    const [isSaved, setIsSaved] = useState(localStorage.getItem("isSaved") ? !(localStorage.getItem("isSaved") === "false") : true);
    const [isDeletable, setIsDeletable] = useState(false);
    const [isAvailableToAdd, setIsAvailableToAdd] = useState(false);
    const [undoStack, setUndoStack] = useState<BaseNode[]>([]);
    const [redoStack, setRedoStack] = useState<BaseNode[]>([]);
    const [setTopicContent] = useSetTopicContentMutation();


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
    useEffect(() => {
        if (fullData) {
            localStorage.setItem("fullData", JSON.stringify(fullData));
        } else {
            setSelectedNodeData(null);
            localStorage.removeItem("fullData");
        }
    }, [fullData]);

    const undo = useCallback(() => {
        console.log("SALAM",undoStack.length)
        if (undoStack.length > 1) {
            const prevState = undoStack[0];
            setUndoStack((prev) => prev.slice(1));
            setRedoStack((prev) => [fullData!, ...prev]);
            setFullData(prevState);
            handleIsSaved(undoStack.length == 2);
        }
    }, [undoStack, fullData]);

    const redo = useCallback(() => {
        if (redoStack.length > 0) {
            const nextState = redoStack[0];
            setRedoStack((prev) => prev.slice(1));
            setUndoStack((prev) => [fullData!, ...prev]);
            setFullData(nextState);
            handleIsSaved(false);
        }
    }, [redoStack, fullData]);
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === "z") {
                undo();
            } else if (event.ctrlKey && event.shiftKey && event.key === "Z") {
                redo();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [undo, redo]);

    const handleSetApiResponce = (apiResponse: TopicDetailResponse) => {
        localStorage.setItem("apiResponse", JSON.stringify(apiResponse));
        setApiResponse(apiResponse);
    }

    const handleSetFullData = (obj: BaseNode | null) => {
        if (obj && fullData)
            setUndoStack((prev) => [fullData!, ...prev]);
        else
            setUndoStack([])
        setRedoStack([]);
        setFullData(obj);
    };

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

        handleSetFullData(updateNodeInTree(fullData));
        handleIsSaved(false);
    };


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

        handleSetFullData(updatedData);
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

        handleSetFullData(updateNodeInTree(fullData));
        handleIsSaved(false);
    };

    const saveFullData = () => {
        if (!fullData || !apiResponse) return;

        setTopicContent({topicId: apiResponse.current.topicId, content: fullData})
            .then(() => handleIsSaved(true));
    }

    const reset = () => {
        handleSetFullData(null)
        handleIsSaved(true)
        setSelectedNodeData(null)
        setIsDeletable(false)
        setIsAvailableToAdd(false)
    }

    return (
        <SelectedNodeContext.Provider
            value={{
                setFullData: handleSetFullData,
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
                isDeletable,
                reset,
                setApiResponse: handleSetApiResponce,
            }}
        >
            {children}
        </SelectedNodeContext.Provider>
    );
};


