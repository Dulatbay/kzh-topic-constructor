import React, {forwardRef} from 'react';
import {BaseProps, Text} from '../types';
import {getColor, getFontSize, getFontWeight, getStylesFromBaseNode} from "../lib";

interface Props extends BaseProps {
    obj: Text;
}

export const TextNode = forwardRef<HTMLParagraphElement, Props>(({obj, onClick, isSelected}, ref) => {
    const style: React.CSSProperties = {
        ...(obj.fontColor && {color: getColor(obj.fontColor)}),
        fontWeight: getFontWeight(obj.fontWeight),
        ...(obj.fontSize && {fontSize: getFontSize(obj.fontSize)}),
        ...(obj.textAlign && {textAlign: obj.textAlign}),
        ...(getStylesFromBaseNode(obj)),
    };

    const borderStyle = isSelected ? "!border-2 !border-blue-500" : "border-2 border-transparent";

    return <p ref={ref}
              style={style}
              dangerouslySetInnerHTML={{__html: obj.htmltext}}
              onClick={onClick}
              className={`${borderStyle}`}></p>;
});

TextNode.displayName = "TextNode";

export default TextNode;
