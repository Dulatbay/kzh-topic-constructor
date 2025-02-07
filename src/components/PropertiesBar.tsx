import {
    Background,
    BorderType,
    FontColor,
    FontSize,
    TextAlign,
    BaseNode,
    Stack,
    TitledContainer,
    Text,
    CenteredContainer,
    IconText,
    Image,
    FontWeight,
    JustifyContent,
    AlignItems,
    FlexWrap
} from "../utills/parser/types.ts";
import {
    isTextNode,
    isStackNode, isIconText,
} from "../utills/parser/Parser.tsx";
import React, {useEffect, useState, useRef} from "react";
import {useSelectedNode} from "../context/hooks/context.ts";
import {FaChevronDown, FaChevronRight} from "react-icons/fa";

const CollapsibleSection = ({title, children}: {
    title: string,
    children: React.ReactNode[] | React.ReactNode | null
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mt-4 border-b border-gray-600 pb-2">
            <button
                className="flex items-center justify-between w-full text-left py-2 px-3  rounded hover:bg-[#282828] transition"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-white font-bold">{title}</span>
                {isOpen ? <FaChevronDown className="text-gray-300"/> : <FaChevronRight className="text-gray-300"/>}
            </button>

            {isOpen && <div className="mt-2">{children}</div>}
        </div>
    );
};

interface Props {
    selectedNode: Text;
    handleChange: <T extends keyof (BaseNode & Stack & TitledContainer & Text & CenteredContainer & IconText & Image)>(
        key: T,
        value: unknown
    ) => void;
}

const TextareaComponent: React.FC<Props> = ({selectedNode, handleChange}) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [text, setText] = useState(selectedNode.htmltext || "");

    useEffect(() => {
        setText(selectedNode.htmltext || "");
    }, [selectedNode.htmltext]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        e.stopPropagation()
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleChange("htmltext" as keyof Props["selectedNode"], text);
        }
    };

    return (
        <div className="mt-2">
            <label className="block text-gray-300 mb-1">HTML Text</label>
            <textarea
                ref={textareaRef}
                className="w-full p-2 bg-gray-700 text-white rounded"
                value={text}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={() => handleChange("htmltext", text)}
            />
        </div>
    );
};


const PropertiesBar = () => {
    const {selectedNodeData, updateSelectedNodeProperty, handleDeleteNode, isDeletable} = useSelectedNode();
    const [selectedNode, setSelectedNode] = useState<BaseNode | null>(null);

    useEffect(() => {
        setSelectedNode(selectedNodeData);
    }, [selectedNode, selectedNodeData]);


    if (!selectedNode) {
        return (
            <div className="w-[400px] min-h-screen bg-[#0a0a0a] border-gray-200 p-4 text-white">
                <p>Выберите элемент</p>
            </div>
        );
    }

    const handleChange = <T extends keyof (BaseNode & Stack & TitledContainer & Text & CenteredContainer & IconText & Image)>(key: T, value: unknown) => {
        updateSelectedNodeProperty(key, value);
    };

    return (
        <div className="w-[400px] h-screen bg-[#0a0a0a] border-gray-200 p-4 text-white overflow-y-scroll">
            <h3 className="text-lg font-bold mb-4">Свойства элемента</h3>
            <p><strong>ID:</strong> {selectedNode.id}</p>
            <p><strong>Тип:</strong> {selectedNode.nodeType}</p>

            {(selectedNode && isDeletable) && (
                <button
                    className="w-full p-3 bg-red-600 text-white font-bold rounded hover:bg-red-500 transition mb-4"
                    onClick={handleDeleteNode}
                >
                    Удалить
                </button>
            )}

            <CollapsibleSection title={"Base node style"}>
                {/*Общие свойства*/}
                <div className="mt-2">
                    <label className="block text-gray-300 mb-1">Background</label>
                    <select
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={selectedNode.background || "DEFAULT"}
                        onChange={(e) => handleChange("background", e.target.value)}
                    >
                        {Object.values(Background).map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                <div className="mt-2">
                    <label className="block text-gray-300 mb-1">Border Color</label>
                    <select
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={selectedNode.borderColor || "DEFAULT"}
                        onChange={(e) => handleChange("borderColor", e.target.value)}
                    >
                        {Object.values(FontColor).map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                <div className="mt-2">
                    <label className="block text-gray-300 mb-1">Border type</label>
                    <select
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={selectedNode.borderType || "NONE"}
                        onChange={(e) => handleChange("borderType", e.target.value)}
                    >
                        {Object.values(BorderType).map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                <div className="mt-2">
                    <label className="block text-gray-300 mb-1">Border Radius</label>
                    <input
                        type="text"
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={selectedNode.borderRadius || ""}
                        onChange={(e) => handleChange("borderRadius", (e.target.value))}
                    />
                </div>
                <div className="mt-2">
                    <label className="block text-gray-300 mb-1">Opacity</label>
                    <input
                        type="number"
                        step={0.1}
                        max={1}
                        min={0}
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={selectedNode.opacity === undefined ? 1 : selectedNode.opacity}
                        onChange={(e) => handleChange("opacity", parseFloat(e.target.value))}
                    />
                </div>
                <div className="mt-2">
                    <label className="block text-gray-300 mb-1">Padding</label>
                    <input
                        type="text"
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={selectedNode.padding || ""}
                        onChange={(e) => handleChange("padding", (e.target.value))}
                    />
                </div>
                <div className="mt-2">
                    <label className="block text-gray-300 mb-1">Margin</label>
                    <input
                        type="text"
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={selectedNode.margin || ""}
                        onChange={(e) => handleChange("margin", (e.target.value))}
                    />
                </div>
                <div className="mt-2">
                    <label className="block text-gray-300 mb-1">Overflow X</label>
                    <input
                        type="text"
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={selectedNode.overflowX || ""}
                        onChange={(e) => handleChange("overflowX", (e.target.value))}
                    />
                </div>
                <div className="mt-2">
                    <label className="block text-gray-300 mb-1">Overflow Y</label>
                    <input
                        type="text"
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={selectedNode.overflowY || ""}
                        onChange={(e) => handleChange("overflowY", (e.target.value))}
                    />
                </div>
                <div className="mt-2">
                    <label className="block text-gray-300 mb-1">Flex</label>
                    <input
                        type="number"
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={selectedNode.flex || ""}
                        onChange={(e) => handleChange("flex", (e.target.value))}
                    />
                </div>
                <div className="mt-2">
                    <label className="block text-gray-300 mb-1">Min Height</label>
                    <input
                        type="text"
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={selectedNode.minHeight || ""}
                        onChange={(e) => handleChange("minHeight", (e.target.value))}
                    />
                </div>
                <div className="mt-2">
                    <label className="block text-gray-300 mb-1">Min Width</label>
                    <input
                        type="text"
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={selectedNode.minWidth || ""}
                        onChange={(e) => handleChange("minWidth", (e.target.value))}
                    />
                </div>
                <div className="mt-2">
                    <label className="block text-gray-300 mb-1">Width</label>
                    <input
                        type="text"
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={selectedNode.width || ""}
                        onChange={(e) => handleChange("width", (e.target.value))}
                    />
                </div>
                <div className="mt-2">
                    <label className="block text-gray-300 mb-1">Height</label>
                    <input
                        type="text"
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={selectedNode.height || ""}
                        onChange={(e) => handleChange("height", (e.target.value))}
                    />
                </div>
            </CollapsibleSection>

            {/* Свойства для текста */}
            {isTextNode(selectedNode) && (
                <CollapsibleSection title={"Text node style"}>
                    <div className="mt-2">
                        <label className="block text-gray-300 mb-1">Font color</label>
                        <select
                            className="w-full p-2 bg-gray-700 text-white rounded"
                            value={selectedNode.fontColor}
                            onChange={(e) => handleChange("fontColor", e.target.value)}
                        >
                            {Object.values(FontColor).map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-2">
                        <label className="block text-gray-300 mb-1">Font size</label>
                        <select
                            className="w-full p-2 bg-gray-700 text-white rounded"
                            value={selectedNode.fontSize || "SMALL"}
                            onChange={(e) => handleChange("fontSize", e.target.value)}
                        >
                            {Object.values(FontSize).map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-2">
                        <label className="block text-gray-300 mb-1">Text align</label>
                        <select
                            className="w-full p-2 bg-gray-700 text-white rounded"
                            value={selectedNode.textAlign}
                            onChange={(e) => handleChange("textAlign", e.target.value)}
                        >
                            {Object.values(TextAlign).map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-2">
                        <label className="block text-gray-300 mb-1">Font weight</label>
                        <select
                            className="w-full p-2 bg-gray-700 text-white rounded"
                            value={selectedNode.fontWeight || "REGULAR"}
                            onChange={(e) => handleChange("fontWeight", e.target.value)}
                        >
                            {Object.values(FontWeight).map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <TextareaComponent selectedNode={selectedNode} handleChange={handleChange}/>
                </CollapsibleSection>
            )}

            {/* Свойства для Stack */}
            {isStackNode(selectedNode) && (
                <CollapsibleSection title={"Stack node style"}>
                    <div className="mt-2">
                        <label className="text-gray-300 mb-1">Is Vertical</label>
                        <input
                            type="checkbox"
                            className="ml-4 p-2 bg-gray-700 text-white rounded"
                            checked={selectedNode.vertical || false}
                            onChange={() => handleChange("vertical", !selectedNode?.vertical)}
                        />
                    </div>

                    <div className="mt-2">
                        <label className="block text-gray-300 mb-1">Gap</label>
                        <input
                            type="number"
                            className="w-full p-2 bg-gray-700 text-white rounded"
                            value={selectedNode.gap || ""}
                            onChange={(e) => handleChange("gap", Number(e.target.value))}
                        />
                    </div>

                    <div className="mt-2">
                        <label className="block text-gray-300 mb-1">Justify content</label>
                        <select
                            className="w-full p-2 bg-gray-700 text-white rounded"
                            value={selectedNode.justifyContent || ""}
                            onChange={(e) => handleChange("justifyContent", e.target.value)}
                        >
                            {Object.values(JustifyContent).map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-2">
                        <label className="block text-gray-300 mb-1">Align Items</label>
                        <select
                            className="w-full p-2 bg-gray-700 text-white rounded"
                            value={selectedNode.alignItems || ""}
                            onChange={(e) => handleChange("alignItems", e.target.value)}
                        >
                            {Object.values(AlignItems).map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-2">
                        <label className="block text-gray-300 mb-1">Wrap</label>
                        <select
                            className="w-full p-2 bg-gray-700 text-white rounded"
                            value={selectedNode.flexWrap || "nowrap"}
                            onChange={(e) => handleChange("flexWrap", e.target.value)}
                        >
                            {Object.values(FlexWrap).map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                </CollapsibleSection>
            )}

            {isIconText(selectedNode) && (
                <CollapsibleSection title={"IconText node style"}>
                    <div className="mt-2">
                        <label className="block text-gray-300 mb-1">Icon</label>
                        <input
                            type="text"
                            className="w-full p-2 bg-gray-700 text-white rounded"
                            value={selectedNode.icon || ""}
                            onChange={(e) => handleChange("icon", e.target.value)}
                        />
                    </div>
                </CollapsibleSection>
            )}


        </div>
    );
};

export default PropertiesBar;
