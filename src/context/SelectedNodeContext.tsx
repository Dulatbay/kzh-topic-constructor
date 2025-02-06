import {ReactNode, useCallback, useEffect, useState} from "react";
import {BaseNode, CenteredContainer, IconText, NodeType, Stack, Text, TitledContainer} from "../utills/parser/types.ts";
import {SelectedNodeContext} from "./hooks/context.ts";
import {isCenteredContainer, isIconText, isStackNode, isTitledContainer} from "../utills/parser/Parser.tsx";
import {useSetTopicContentMutation} from "../services/module/api.ts";
import {TopicDetailResponse} from "../services/module/types.ts";
import {toast} from "react-toastify";
import {v4 as uuidv4} from 'uuid';

interface SelectedNodeProviderProps {
    children: ReactNode;
}

function findAndObserveNode(node: BaseNode | Stack | CenteredContainer | IconText | TitledContainer, updateNodeInTree: (node: BaseNode) => BaseNode) {
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
}

export const SelectedNodeProvider = ({children}: SelectedNodeProviderProps) => {
    const [selectedNodeData, setSelectedNodeData] = useState<BaseNode | null>(null);
    const [fullData, setFullData] = useState<BaseNode | null>(null);
    const [apiResponse, setApiResponse] = useState<TopicDetailResponse | null>(localStorage.getItem("apiResponse") ? JSON.parse(localStorage.getItem("apiResponse")!) : null);
    const [isSaved, setIsSaved] = useState(localStorage.getItem("isSaved") ? !(localStorage.getItem("isSaved") === "false") : true);
    const [isChildOfStack, setIsChildOfStack] = useState(false);
    const [isAvailableToAdd, setIsAvailableToAdd] = useState(false);
    const [undoStack, setUndoStack] = useState<BaseNode[]>([]);
    const [redoStack, setRedoStack] = useState<BaseNode[]>([]);
    const [setTopicContent] = useSetTopicContentMutation();

    const undo = useCallback(() => {
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
    const handleSetFullData = useCallback((obj: BaseNode | null) => {
        if (obj && fullData)
            setUndoStack((prev) => [fullData!, ...prev]);
        else
            setUndoStack([])
        setRedoStack([]);
        setFullData(obj);
    }, [fullData]);
    const handleDeleteNode = useCallback(() => {
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

        if (!selectedNodeData || !fullData) {
            toast.error("No node selected to delete");
            return;
        }
        if (!isChildOfStack) {
            toast.error("Only strict child of stack node can be deleted");
            return;
        }
        const updatedData = deleteNodeById(selectedNodeData.id, fullData);

        handleSetFullData(updatedData);
        setSelectedNodeData(null);
        handleIsSaved(false);
    }, [fullData, handleSetFullData, isChildOfStack, selectedNodeData]);
    const handleCopy = useCallback(() => {
        const nodeToCopyString = localStorage.getItem("copiedNode");
        if (!nodeToCopyString || !fullData) {
            toast.error("No node selected to copy");
            return;
        }
        const nodeToCopy = JSON.parse(nodeToCopyString!) as BaseNode;

        const deepCopyNode = (node: BaseNode): BaseNode => {
            const newNode = {...node, id: uuidv4()};

            if (isStackNode(node)) {
                return {
                    ...newNode,
                    children: node.children.map(deepCopyNode),
                } as Stack;
            }

            if (isCenteredContainer(node)) {
                return {
                    ...newNode,
                    childNode: deepCopyNode(node.childNode),
                } as BaseNode;
            }

            if (isIconText(node)) {
                return {
                    ...newNode,
                    text: deepCopyNode(node.text),
                } as BaseNode;
            }

            if (isTitledContainer(node)) {
                return {
                    ...newNode,
                    titleText: deepCopyNode(node.titleText),
                    content: deepCopyNode(node.content),
                } as BaseNode;
            }

            return newNode;
        };

        const copiedNode = deepCopyNode(nodeToCopy);

        const addNodeToParentStack = (node: BaseNode): BaseNode => {
            if (isStackNode(node)) {
                const index = node.children.findIndex(child => child.id === nodeToCopy.id);
                if (index !== -1) {
                    console.log("SALAM")
                    return {
                        ...node,
                        children: [
                            ...node.children.slice(0, index + 1),
                            copiedNode,
                            ...node.children.slice(index + 1)
                        ],
                    } as Stack;
                } else {
                    return {
                        ...node,
                        children: node.children.map(addNodeToParentStack),
                    } as Stack;
                }
            }

            if (isCenteredContainer(node) && node.childNode) {
                return {
                    ...node,
                    childNode: addNodeToParentStack(node.childNode),
                } as BaseNode;
            }

            if (isTitledContainer(node)) {
                return {
                    ...node,
                    titleText: addNodeToParentStack(node.titleText),
                    content: addNodeToParentStack(node.content),
                } as BaseNode;
            }

            return node;
        };

        let updatedData = addNodeToParentStack(fullData);

        if (JSON.stringify(updatedData) === JSON.stringify(fullData)) {
            if (isStackNode(fullData)) {
                updatedData = {
                    ...fullData,
                    children: [...fullData.children, copiedNode],
                } as Stack;
            }
        }

        handleSetFullData(updatedData);
        handleIsSaved(false);
        toast.success("Node copied successfully!");
    }, [fullData, handleSetFullData]);


    useEffect(() => {
        if (selectedNodeData) {
            const findNodeById = (node: BaseNode, depth: number): BaseNode | null => {
                if (node.id === selectedNodeData.id) {
                    setIsChildOfStack(depth == 1)
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
        setIsChildOfStack(false)
    }, [setSelectedNodeData, fullData, selectedNodeData]);
    useEffect(() => {
        if (fullData) {
            localStorage.setItem("fullData", JSON.stringify(fullData));
        } else {
            setSelectedNodeData(null);
            localStorage.removeItem("fullData");
        }
    }, [fullData]);
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === "z") {
                undo();
            } else if (event.ctrlKey && event.shiftKey && event.key === "Z") {
                redo();
            } else if (event.key === 'Delete') {
                handleDeleteNode()
            } else if (event.ctrlKey && event.key === "c") {
                if (!isChildOfStack) {
                    toast.error("Only strict child of stack node can be copied");
                    return;
                }
                localStorage.setItem("copiedNode", JSON.stringify(selectedNodeData));
            } else if (event.ctrlKey && event.key === "v") {
                handleCopy()
            } else if (event.ctrlKey && event.key === "x") {
                if (!isChildOfStack) {
                    toast.error("Only strict child of stack node can be copied");
                    return;
                }
                localStorage.setItem("copiedNode", JSON.stringify(selectedNodeData));
                updateSelectedNodeProperty("cut", true)
                setSelectedNodeData(null)
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [undo, redo, handleDeleteNode, undoStack, handleCopy, selectedNodeData]);

    const handleSetApiResponse = (apiResponse: TopicDetailResponse) => {
        localStorage.setItem("apiResponse", JSON.stringify(apiResponse));
        setApiResponse(apiResponse);
    }

    const handleIsSaved = (isSaved: boolean) => {
        setIsSaved(isSaved)
        localStorage.setItem("isSaved", isSaved + "")
    }

    const updateSelectedNodeProperty = <T extends keyof (BaseNode & Stack & TitledContainer & Text & IconText)>(key: T, value: unknown) => {
        if (!selectedNodeData || !fullData) return;

        const updatedNode = {...selectedNodeData, [key]: value};
        setSelectedNodeData(updatedNode);

        const updateNodeInTree = (node: BaseNode): BaseNode => {
            if (node.id === selectedNodeData.id) {
                return updatedNode;
            }
            return findAndObserveNode(node, updateNodeInTree);
        };

        handleSetFullData(updateNodeInTree(fullData));
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
            return findAndObserveNode(node, updateNodeInTree);
        };

        handleSetFullData(updateNodeInTree(fullData));
        handleIsSaved(false);
    };

    const saveFullData = () => {
        if (!fullData || !apiResponse) return;
        toast.promise(setTopicContent({topicId: apiResponse.current.topicId, content: fullData}), {
            pending: "Saving...",
            success: "Saved successfully",
            error: "Failed to save",
        })
            .then(() => handleIsSaved(true));
    }

    const reset = () => {
        handleSetFullData(null)
        handleIsSaved(true)
        setSelectedNodeData(null)
        setIsChildOfStack(false)
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
                isDeletable: isChildOfStack,
                reset,
                setApiResponse: handleSetApiResponse,
            }}
        >
            {children}
        </SelectedNodeContext.Provider>
    );
};


