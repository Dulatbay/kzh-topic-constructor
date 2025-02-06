import React, {forwardRef} from 'react';
import {BaseProps, CenteredContainer} from '../types';
import {getStylesFromBaseNode} from "../lib";
import {Parser} from "../Parser.tsx";

interface Props extends BaseProps {
    obj: CenteredContainer;
}

const CenteredContainerNode = forwardRef<HTMLDivElement, Props>(({obj, onClick, isSelected}, ref) => {
    const style: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...(getStylesFromBaseNode(obj)),
    };

    const borderStyle = isSelected ? "!border-4 !border-solid !border-blue-500" : "border-2 border-transparent";
    const bg = obj.cut ? '!opacity-40' : '';

    return (
        <div ref={ref} style={style} onClick={onClick} className={`${borderStyle} ${bg}`}>
            {Parser({obj: obj.childNode})}
        </div>
    );
});

CenteredContainerNode.displayName = "CenteredContainerNode";

export default CenteredContainerNode;
