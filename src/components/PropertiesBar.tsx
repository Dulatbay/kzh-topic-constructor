import React, { useEffect, useState } from "react";
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
import { isTextNode, isStackNode, isIconText } from "../utills/parser/Parser.tsx";
import { useSelectedNode } from "../context/hooks/context.ts";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

// Компонент для сворачиваемых секций
const CollapsibleSection = ({
                                title,
                                children
                            }: {
    title: string;
    children: React.ReactNode[] | React.ReactNode | null;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="mt-4 border-b border-gray-600 pb-2">
            <button
                className="flex items-center justify-between w-full text-left py-2 px-3 rounded hover:bg-[#282828] transition"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-white font-bold">{title}</span>
                {isOpen ? (
                    <FaChevronDown className="text-gray-300" />
                ) : (
                    <FaChevronRight className="text-gray-300" />
                )}
            </button>
            {isOpen && <div className="mt-2">{children}</div>}
        </div>
    );
};

interface LocalInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onEnter?: (value: string) => void;
    type?: string;
    step?: number | string;
    min?: number | string;
    max?: number | string;
}
const LocalInput: React.FC<LocalInputProps> = ({
                                                   label,
                                                   value,
                                                   onChange,
                                                   onEnter,
                                                   type = "text",
                                                   step,
                                                   min,
                                                   max
                                               }) => {
    // Здесь мы не используем отдельное локальное состояние, а сразу вызываем onChange
    // Таким образом, изменения сразу поступают в родительское состояние
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (onEnter) {
                onEnter(value);
            }
        }
    };

    return (
        <div className="mt-2">
            <label className="block text-gray-300 mb-1">{label}</label>
            <input
                type={type}
                className="w-full p-2 bg-gray-700 text-white rounded"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                step={step}
                min={min}
                max={max}
            />
        </div>
    );
};

// Компонент для текстовой области (textarea) с локальным состоянием,
// обновляющий родительское состояние сразу при каждом вводе (если нужно, можно добавить onEnter аналогично)
interface TextareaProps {
    selectedNode: Text;
    handleChange: <T extends keyof (BaseNode & Stack & TitledContainer & Text & CenteredContainer & IconText & Image)>(
        key: T,
        value: unknown
    ) => void;
}
const TextareaComponent: React.FC<TextareaProps> = ({ selectedNode, handleChange }) => {
    const [text, setText] = useState(selectedNode.htmltext || "");

    // Обновляем локальное состояние при смене выбранного узла (по id)
    useEffect(() => {
        setText(selectedNode.htmltext || "");
    }, [selectedNode.id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        // Обновляем родительское состояние сразу, чтобы изменения отображались немедленно
        handleChange("htmltext" as keyof Text, e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        e.stopPropagation();
        // Если требуется дополнительная логика при нажатии Enter, можно добавить её здесь
    };

    return (
        <div className="mt-2">
            <label className="block text-gray-300 mb-1">HTML Text</label>
            <textarea
                className="w-full p-2 bg-gray-700 text-white rounded"
                value={text}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
};

const PropertiesBar = () => {
    const { selectedNodeData, updateSelectedNodeProperty, handleDeleteNode, isDeletable } = useSelectedNode();
    const [selectedNode, setSelectedNode] = useState<BaseNode | null>(null);

    useEffect(() => {
        setSelectedNode(selectedNodeData);
    }, [selectedNodeData]);

    if (!selectedNode) {
        return (
            <div className="w-[400px] min-h-screen bg-[#0a0a0a] border-gray-200 p-4 text-white">
                <p>Выберите элемент</p>
            </div>
        );
    }

    // Функция для обновления родительского состояния (контекста)
    const handleChange = <T extends keyof (BaseNode & Stack & TitledContainer & Text & CenteredContainer & IconText & Image)>(
        key: T,
        value: unknown
    ) => {
        updateSelectedNodeProperty(key, value);
    };

    return (
        <div className="w-[400px] h-screen bg-[#0a0a0a] border-gray-200 p-4 text-white overflow-y-scroll">
            <h3 className="text-lg font-bold mb-4">Свойства элемента</h3>
            <p>
                <strong>ID:</strong> {selectedNode.id}
            </p>
            <p>
                <strong>Тип:</strong> {selectedNode.nodeType}
            </p>

            {isDeletable && (
                <button
                    className="w-full p-3 bg-red-600 text-white font-bold rounded hover:bg-red-500 transition mb-4"
                    onClick={handleDeleteNode}
                >
                    Удалить
                </button>
            )}

            <CollapsibleSection title={"Base node style"}>
                {/* Общие свойства */}
                <div className="mt-2">
                    <label className="block text-gray-300 mb-1">Background</label>
                    <select
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={selectedNode.background || "DEFAULT"}
                        onChange={(e) => handleChange("background", e.target.value)}
                    >
                        {Object.values(Background).map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
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
                            <option key={option} value={option}>
                                {option}
                            </option>
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
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <LocalInput
                    label="Border Radius"
                    value={selectedNode.borderRadius || ""}
                    onChange={(val) => handleChange("borderRadius", val)}
                    onEnter={(val) => handleChange("borderRadius", val)}
                />
                <LocalInput
                    label="Opacity"
                    type="number"
                    step={0.1}
                    min={0}
                    max={1}
                    value={
                        selectedNode.opacity === undefined
                            ? "1"
                            : selectedNode.opacity.toString()
                    }
                    onChange={(val) => handleChange("opacity", parseFloat(val))}
                    onEnter={(val) => handleChange("opacity", parseFloat(val))}
                />
                <LocalInput label="Padding" value={selectedNode.padding || ""} onChange={(val) => handleChange("padding", val)} />
                <LocalInput label="Margin" value={selectedNode.margin || ""} onChange={(val) => handleChange("margin", val)} />
                <LocalInput label="Overflow X" value={selectedNode.overflowX || ""} onChange={(val) => handleChange("overflowX", val)} />
                <LocalInput label="Overflow Y" value={selectedNode.overflowY || ""} onChange={(val) => handleChange("overflowY", val)} />
                <LocalInput label="Flex" type="number" value={selectedNode.flex?.toString() || ""} onChange={(val) => handleChange("flex", val)} />
                <LocalInput label="Min Height" value={selectedNode.minHeight || ""} onChange={(val) => handleChange("minHeight", val)} />
                <LocalInput label="Min Width" value={selectedNode.minWidth || ""} onChange={(val) => handleChange("minWidth", val)} />
                <LocalInput label="Width" value={selectedNode.width || ""} onChange={(val) => handleChange("width", val)} />
                <LocalInput label="Height" value={selectedNode.height || ""} onChange={(val) => handleChange("height", val)} />
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
                                <option key={option} value={option}>
                                    {option}
                                </option>
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
                                <option key={option} value={option}>
                                    {option}
                                </option>
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
                                <option key={option} value={option}>
                                    {option}
                                </option>
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
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <TextareaComponent selectedNode={selectedNode as Text} handleChange={handleChange} />
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
                            onChange={() => handleChange("vertical", !selectedNode.vertical)}
                        />
                    </div>
                    <LocalInput label="Gap" type="number" value={selectedNode.gap?.toString() || ""} onChange={(val) => handleChange("gap", Number(val))} />
                    <div className="mt-2">
                        <label className="block text-gray-300 mb-1">Justify content</label>
                        <select
                            className="w-full p-2 bg-gray-700 text-white rounded"
                            value={selectedNode.justifyContent || ""}
                            onChange={(e) => handleChange("justifyContent", e.target.value)}
                        >
                            {Object.values(JustifyContent).map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
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
                                <option key={option} value={option}>
                                    {option}
                                </option>
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
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                </CollapsibleSection>
            )}

            {/* Свойства для IconText */}
            {isIconText(selectedNode) && (
                <CollapsibleSection title={"IconText node style"}>
                    <LocalInput label="Icon" value={selectedNode.icon || ""} onChange={(val) => handleChange("icon", val)} />
                </CollapsibleSection>
            )}
        </div>
    );
};

export default PropertiesBar;
