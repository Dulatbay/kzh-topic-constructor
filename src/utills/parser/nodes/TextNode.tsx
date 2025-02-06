import React, {useState, useRef, useEffect, forwardRef} from "react";
import {BaseProps, Text} from "../types";
import {getColor, getFontSize, getFontWeight, getStylesFromBaseNode, getTextAlign} from "../lib";
import {useSelectedNode} from "../../../context/hooks/context.ts";

interface Props extends BaseProps {
    obj: Text;
}

export const TextNode = forwardRef<HTMLParagraphElement, Props>(({obj, onClick, isSelected}, ref) => {
    const {updateSelectedNodeProperty} = useSelectedNode();
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(obj.htmltext);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
    };

    const handleBlur = () => {
        setIsEditing(false);
        updateSelectedNodeProperty("htmltext", text);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleBlur();
        }
    };

    const style: React.CSSProperties = {
        textAlign: getTextAlign(obj.textAlign),
        fontWeight: getFontWeight(obj.fontWeight),
        ...(obj.fontColor && {color: getColor(obj.fontColor)}),
        ...(obj.fontSize && {fontSize: getFontSize(obj.fontSize)}),
        ...getStylesFromBaseNode(obj),
    };

    const borderStyle = isSelected ? "!border-2 !border-blue-500" : "border-2 border-transparent";

    return (
        <>
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full p-1 border border-gray-400 rounded bg-gray-900 text-white"
                    value={text}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                />
            ) : (
                <p
                    ref={ref}
                    style={style}
                    onDoubleClick={handleDoubleClick}
                    onClick={onClick}
                    className={`${borderStyle}`}
                    dangerouslySetInnerHTML={{__html: obj.htmltext}}
                ></p>
            )}
        </>
    );
});

TextNode.displayName = "TextNode";
