import {BaseProps, TitledContainer} from "../types";
import {forwardRef} from "react";
import {Parser} from "../Parser.tsx";
import {getStylesFromBaseNode} from "../lib";

interface Props extends BaseProps {
    obj: TitledContainer;
}

export const TitledContainerNode = forwardRef<HTMLDivElement, Props>(({obj, onClick, isSelected}, ref) => {
    const containerStyles = {
        ...(getStylesFromBaseNode(obj)),
    };

    const borderStyle = isSelected ? "!border-2 !border-blue-500" : "border-2 border-transparent";

    return (
        <div ref={ref} style={containerStyles} className={`flex flex-col gap-4 ${borderStyle}`} onClick={onClick}>
            {Parser({obj: obj.titleText})}
            {Parser({obj: obj.content})}
        </div>
    );
});

TitledContainerNode.displayName = "TitledContainerNode";

export default TitledContainerNode;
