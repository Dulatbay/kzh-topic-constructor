import React from "react";
import {
    BaseNode,
    CenteredContainer,
    IconText as IconTextType,
    Link,
    NodeType,
    Stack,
    Text,
    TitledContainer,
} from "./types";
import StackNode from "./nodes/StackNode";
import {TextNode} from "./nodes/TextNode";
import {IconText} from "./nodes/IconText";
import {TitledContainerNode} from "./nodes/TitledContainerNode";
import CenteredContainerNode from "./nodes/CenteredContainerNode";
import {ArcherElement} from "react-archer";
import {useSelectedNode} from "../../context/hooks/context.ts";

export const isStackNode = (node: BaseNode): node is Stack => node?.nodeType === NodeType.STACK;
export const isTextNode = (node: BaseNode): node is Text => node?.nodeType === NodeType.TEXT;
export const isIconText = (node: BaseNode): node is IconTextType => node?.nodeType === NodeType.ICON_TEXT;
export const isTitledContainer = (node: BaseNode): node is TitledContainer => node?.nodeType === NodeType.TITLED_CONTAINER;
export const isCenteredContainer = (node: BaseNode): node is CenteredContainer => node?.nodeType === NodeType.CENTERED_CONTAINER;

/**
 * Renders the given BaseNode tree dynamically and connects elements using react-archer.
 */
export const Parser = ({obj}: { obj: BaseNode }): React.ReactNode => {
    const {selectedNodeData, setSelectedNodeData} = useSelectedNode();

    if (!obj) return;

    const handleClick = (e: React.MouseEvent, obj: BaseNode) => {
        e.stopPropagation(); // ✅ Останавливаем всплытие событий, чтобы родитель не перехватывал клик
        setSelectedNodeData(obj);
    };

    const renderChildren = (children: BaseNode[] | undefined) => {
        return children?.map((child) => <Parser key={child.id} obj={child}/>);
    };

    const isSelected = selectedNodeData?.id === obj.id;


    if (isStackNode(obj)) {
        return (
            <ArcherElement
                key={obj.id}
                id={obj.id}
                relations={
                    obj.links?.filter((l) => l.fromId === obj.id).map((link: Link) => ({
                        targetId: link.toId,
                        sourceAnchor: "bottom",
                        targetAnchor: "top",
                    })) || []
                }
            >
                <StackNode obj={obj}
                           isSelected={isSelected}
                           onClick={(e) => handleClick(e, obj)}>
                    {renderChildren(obj.children)}
                </StackNode>
            </ArcherElement>
        );
    }

    if (isTextNode(obj)) {
        return (
            <ArcherElement key={obj.id} id={obj.id}>
                <TextNode obj={obj} isSelected={isSelected}
                          onClick={(e) => handleClick(e, obj)}/>
            </ArcherElement>
        );
    }

    if (isIconText(obj)) {
        return (
            <ArcherElement key={obj.id} id={obj.id}>

                <IconText obj={obj} isSelected={isSelected}
                          onClick={(e) => handleClick(e, obj)}/>
            </ArcherElement>
        );
    }

    if (isTitledContainer(obj)) {
        return (
            <ArcherElement
                key={obj.id}
                id={obj.id}
                relations={
                    obj.links?.filter((l) => l.fromId === obj.id).map((link: Link) => ({
                        targetId: link.toId,
                        sourceAnchor: "bottom",
                        targetAnchor: "top",
                    })) || []
                }
            >

                <TitledContainerNode obj={obj} isSelected={isSelected}
                                     onClick={(e) => handleClick(e, obj)}/>
            </ArcherElement>
        );
    }

    if (isCenteredContainer(obj)) {
        return (
            <ArcherElement
                key={obj.id}
                id={obj.id}
                relations={
                    obj.links?.filter((l) => l.fromId === obj.id).map((link: Link) => ({
                        targetId: link.toId,
                        sourceAnchor: "bottom",
                        targetAnchor: "top",
                    })) || []
                }
            >
                <CenteredContainerNode obj={obj} isSelected={isSelected}
                                       onClick={(e) => handleClick(e, obj)}/>
            </ArcherElement>
        );
    }

    return <div key={obj.id}>Unknown Node Type</div>;
};
