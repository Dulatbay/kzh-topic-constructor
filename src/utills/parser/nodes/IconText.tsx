import {BaseProps, IconText as IconTextType} from "../types";
import React, {forwardRef} from "react";
import {getStylesFromBaseNode} from "../lib";
import {Parser} from "../Parser.tsx";

interface Props extends BaseProps {
    obj: IconTextType;
}

export const IconText = forwardRef<HTMLDivElement, Props>(({obj, isSelected, onClick}, ref) => {
    const style: React.CSSProperties = {
        ...(getStylesFromBaseNode(obj)),
    };

    const borderStyle = isSelected ? "!border-2 !border-blue-500" : "border-2 border-transparent";

    return (
        <div ref={ref}
             style={style}
             className={`flex gap-4 ${borderStyle}`}
             onClick={onClick}>
            {obj.icon}
            {Parser({obj: obj.text})}

        </div>
    );
});

IconText.displayName = "IconText";
