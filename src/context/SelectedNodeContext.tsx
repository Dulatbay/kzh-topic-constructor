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

function observeAndApply(node: BaseNode | Stack | CenteredContainer | IconText | TitledContainer, updateNodeInTree: (node: BaseNode) => BaseNode) {
    if (isStackNode(node) && node.children && node.children.length > 0) {
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
    const [isCutCleared, setIsCutCleared] = useState(false);
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
    const updateSelectedNodeProperty = useCallback(<T extends keyof (BaseNode & Stack & TitledContainer & Text & IconText)>(key: T, value: unknown) => {
        if (!selectedNodeData || !fullData) return;

        const updatedNode = {...selectedNodeData, [key]: value};
        setSelectedNodeData(updatedNode);

        const updateNodeInTree = (node: BaseNode): BaseNode => {
            if (node.id === selectedNodeData.id) {
                return updatedNode;
            }
            return observeAndApply(node, updateNodeInTree);
        };

        handleSetFullData(updateNodeInTree(fullData));
        handleIsSaved(false);
    }, [fullData, handleSetFullData, selectedNodeData]);
    const moveNodeUpDown = useCallback((direction: "up" | "down") => {
        if (!selectedNodeData || !fullData) return;

        const updateNodeInTree = (node: BaseNode): BaseNode => {
            if (isStackNode(node)) {
                const index = node.children.findIndex(child => child.id === selectedNodeData.id);

                if (index !== -1) {
                    const newIndex = direction === "up" ? index - 1 : index + 1;

                    if (newIndex < 0 || newIndex >= node.children.length) return node;

                    const newChildren = [...node.children];
                    const [movedNode] = newChildren.splice(index, 1);
                    newChildren.splice(newIndex, 0, movedNode);

                    return {...node, children: newChildren} as Stack;
                }
            }
            return observeAndApply(node, updateNodeInTree);
        };

        const updatedTree = updateNodeInTree(fullData);
        handleSetFullData(updatedTree);
    }, [fullData, handleSetFullData, selectedNodeData]);
    const moveNodeToHigherLevel = useCallback((direction: "up" | "down") => {
        if (!selectedNodeData || !fullData) return;

        let foundParent: Stack | null = null;
        let foundNode: BaseNode | null = null;

        const removeNodeFromParent = (node: BaseNode): BaseNode | null => {
            if (isStackNode(node)) {
                const newChildren = node.children.filter(
                    (child) => child.id !== selectedNodeData.id
                );

                if (newChildren.length !== node.children.length) {
                    foundParent = node;
                    foundNode = selectedNodeData;
                    return {...node, children: newChildren} as Stack;
                }

                return {
                    ...node,
                    children: node.children
                        .map((child) => removeNodeFromParent(child))
                        .filter(Boolean) as BaseNode[],
                } as Stack;
            }

            if (isCenteredContainer(node) && isStackNode(node.childNode)) {
                return {
                    ...node,
                    childNode: removeNodeFromParent(node.childNode),
                } as CenteredContainer;
            }

            if (isTitledContainer(node) && isStackNode(node.content)) {
                return {
                    ...node,
                    content: removeNodeFromParent(node.content),
                } as TitledContainer;
            }

            return node;
        };

        const addNodeToNewParent = (node: BaseNode): BaseNode => {
            if (direction === "up" && foundParent && node !== foundParent && isStackNode(node)) {
                return {
                    ...node,
                    children: [foundNode, ...node.children],
                } as Stack;
            }

            if (direction === "down") {
                const findDeepestStack = (n: BaseNode): Stack | null => {
                    if (isStackNode(n)) return n;
                    if (isCenteredContainer(n)) return findDeepestStack(n.childNode);
                    if (isTitledContainer(n)) return findDeepestStack(n.content);
                    return null;
                };

                const deepestStack = findDeepestStack(node);
                if (deepestStack) {
                    return {
                        ...deepestStack,
                        children: [...deepestStack.children, foundNode],
                    } as Stack;
                }
            }

            return observeAndApply(node, addNodeToNewParent);
        };


        let updatedTree = removeNodeFromParent(fullData);
        if (!foundParent || !foundNode) return;

        updatedTree = addNodeToNewParent(updatedTree!);
        handleSetFullData(updatedTree);
    }, [fullData, handleSetFullData, selectedNodeData]);

    useEffect(() => {
        if (selectedNodeData) {
            const findNodeById = (node: BaseNode, depth: number): BaseNode | null => {
                if (node.id === selectedNodeData.id) {
                    setIsChildOfStack(depth == 1)
                    setIsAvailableToAdd(node.nodeType == NodeType.STACK)
                    return node;
                }
                if (isStackNode(node) && node.children && node.children.length > 0) {
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
            if (isCutCleared && selectedNodeData) {
                localStorage.setItem("copiedNode", JSON.stringify(selectedNodeData));
                updateSelectedNodeProperty("cut", true);
                setIsCutCleared(false);
            }
            localStorage.setItem("fullData", JSON.stringify(fullData));
        } else {
            setSelectedNodeData(null);
            localStorage.removeItem("fullData");
        }
    }, [fullData, isCutCleared, selectedNodeData, updateSelectedNodeProperty]);
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

                const resetCutFlag = (node: BaseNode): BaseNode => {
                    const updatedNode = {...node};

                    if (updatedNode.cut) {
                        updatedNode.cut = false;
                    }

                    if (isStackNode(node)) {
                        return {
                            ...updatedNode,
                            children: node.children.map(resetCutFlag),
                        } as Stack;
                    }
                    if (isCenteredContainer(node)) {
                        return {
                            ...updatedNode,
                            childNode: resetCutFlag(node.childNode),
                        } as BaseNode;
                    }
                    if (isIconText(node)) {
                        return {
                            ...updatedNode,
                            text: resetCutFlag(node.text),
                        } as BaseNode;
                    }
                    if (isTitledContainer(node)) {
                        return {
                            ...updatedNode,
                            titleText: resetCutFlag(node.titleText),
                            content: resetCutFlag(node.content),
                        } as BaseNode;
                    }

                    return updatedNode;
                };

                if (fullData) {
                    const updatedFullData = resetCutFlag(fullData);
                    setFullData(updatedFullData);
                    setIsCutCleared(true);
                }
            } else if (event.ctrlKey && event.shiftKey && event.key === "ArrowUp") {
                moveNodeToHigherLevel("up");
            } else if (event.ctrlKey && event.shiftKey && event.key === "ArrowDown") {
                moveNodeToHigherLevel("down");
            } else if (event.ctrlKey && event.key === "ArrowUp") {
                moveNodeUpDown("up");
            } else if (event.ctrlKey && event.key === "ArrowDown") {
                moveNodeUpDown("down");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [undo, redo, handleDeleteNode, undoStack, handleCopy, selectedNodeData, isChildOfStack, fullData, moveNodeUpDown, moveNodeToHigherLevel]);

    const handleSetApiResponse = (apiResponse: TopicDetailResponse) => {
        localStorage.setItem("apiResponse", JSON.stringify(apiResponse));
        setApiResponse(apiResponse);
    }

    const handleIsSaved = (isSaved: boolean) => {
        setIsSaved(isSaved)
        localStorage.setItem("isSaved", isSaved + "")
    }


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
            return observeAndApply(node, updateNodeInTree);
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
                moveNodeUpDown
            }}
        >
            {children}
        </SelectedNodeContext.Provider>
    );
};


