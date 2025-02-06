import React, {ReactNode, forwardRef} from 'react';
import {BaseProps, Stack} from "../types";
import {getAlignItemsValue, getJustifyContent, getFlexWrap, getStylesFromBaseNode} from "../lib";

interface Props extends BaseProps {
    obj: Stack;
    children: ReactNode;
}

const StackNode = forwardRef<HTMLDivElement, Props>(({obj, children, onClick, isSelected}, ref) => {
    const style: React.CSSProperties = {
        display: 'flex',
        flexDirection: obj.vertical ? 'column' : 'row',
        ...(getStylesFromBaseNode(obj)),
        ...(obj.flexWrap && {flexWrap: getFlexWrap(obj.flexWrap)}),
        ...(obj.justifyContent && {justifyContent: getJustifyContent(obj.justifyContent)}),
        ...(obj.alignItems && {alignItems: getAlignItemsValue(obj.alignItems)}),
        ...(obj.gap && {gap: `${obj.gap}px`}),
    };

    const borderStyle = isSelected ? "!border-2 !border-blue-500" : "border-2 border-transparent";
    const bg = obj.cut ? '!opacity-40' : '';

    return (
        <div ref={ref} style={style} className={`${borderStyle} ${bg}`} onClick={onClick}>
            {children}
        </div>
    );
});

StackNode.displayName = "StackNode";

export default StackNode;
