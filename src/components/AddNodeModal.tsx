import { useState } from "react";
import { useSelectedNode } from "../context/hooks/context.ts";
import {
    AlignItems,
    BaseNode,
    CenteredContainer,
    FlexWrap,
    FontColor,
    FontSize,
    FontWeight,
    IconText,
    JustifyContent,
    NodeType,
    Stack,
    Text,
    TextAlign,
    TitledContainer
} from "../utills/parser/types.ts";
import { v4 as uuidv4 } from "uuid";

// Функция создания нового узла с опциональным вложенным узлом
const createNodeWithChild = (nodeType: NodeType, child?: BaseNode): BaseNode => {
    const newId = uuidv4();

    if (nodeType === NodeType.TEXT) {
        return {
            id: newId,
            nodeType: NodeType.TEXT,
            fontSize: FontSize.SMALL,
            htmltext: "Новый текст",
            textAlign: TextAlign.LEFT,
            fontColor: FontColor.DEFAULT,
            fontWeight: FontWeight.REGULAR,
        } as Text;
    }

    if (nodeType === NodeType.STACK) {
        return {
            id: newId,
            nodeType: NodeType.STACK,
            vertical: true,
            gap: 0,
            flexWrap: FlexWrap.NOWRAP,
            justifyContent: JustifyContent.CENTER,
            alignItems: AlignItems.CENTER,
            children: [],
        } as Stack;
    }

    if (nodeType === NodeType.CENTERED_CONTAINER) {
        return {
            id: newId,
            nodeType: NodeType.CENTERED_CONTAINER,
            childNode: child || createNodeWithChild(NodeType.TEXT),
        } as CenteredContainer;
    }

    if (nodeType === NodeType.TITLED_CONTAINER) {
        return {
            id: newId,
            nodeType: NodeType.TITLED_CONTAINER,
            titleText: createNodeWithChild(NodeType.TEXT) as Text,
            isDivided: false,
            content: child || createNodeWithChild(NodeType.TEXT),
        } as TitledContainer;
    }

    if (nodeType === NodeType.ICON_TEXT) {
        return {
            id: newId,
            nodeType: NodeType.ICON_TEXT,
            text: createNodeWithChild(NodeType.TEXT) as Text,
            icon: "icon",
        } as IconText;
    }

    return { id: newId, nodeType } as BaseNode;
};

// Компонент для динамического выбора вложенных типов
const ChildTypeSelector = ({ selectedChildTypes, setSelectedChildTypes }: {
    selectedChildTypes: NodeType[];
    setSelectedChildTypes: (types: NodeType[]) => void;
}) => {
    const handleChange = (index: number, newType: NodeType) => {
        // Обновляем тип на данном уровне и обрезаем массив до этого индекса
        const newChildTypes = [...selectedChildTypes.slice(0, index), newType];

        // Если выбранный тип требует наличия вложенного узла, добавляем дефолтный выбор
        if (newType === NodeType.CENTERED_CONTAINER || newType === NodeType.TITLED_CONTAINER) {
            newChildTypes.push(NodeType.TEXT);
        }

        setSelectedChildTypes(newChildTypes);
    };

    return (
        <>
            {selectedChildTypes.map((type, index) => (
                <select
                    key={index}
                    className="w-full p-2 bg-gray-700 rounded mb-4"
                    value={type}
                    onChange={(e) => handleChange(index, e.target.value as NodeType)}
                >
                    <option value="">Выберите вложенный тип (уровень {index + 1})</option>
                    {Object.values(NodeType).map((nodeType) => (
                        <option key={nodeType} value={nodeType}>{nodeType}</option>
                    ))}
                </select>
            ))}
        </>
    );
};

const AddNodeModal = ({ onClose }: { onClose: () => void }) => {
    const { addNodeToSelectedStack } = useSelectedNode();
    const [selectedType, setSelectedType] = useState<NodeType | null>(null);
    const [text, setText] = useState("");

    // Состояние для хранения выбранных типов вложенных узлов (для контейнеров)
    const [selectedChildTypes, setSelectedChildTypes] = useState<NodeType[]>([]);

    const handleAddNode = () => {
        if (!selectedType) return;

        let newNode: BaseNode;

        if (selectedType === NodeType.TEXT) {
            // Создаём текстовый узел с введённым значением
            const textNode = createNodeWithChild(NodeType.TEXT) as Text;
            textNode.htmltext = text || "Новый текст";
            newNode = textNode;
        } else if (selectedType === NodeType.STACK) {
            newNode = createNodeWithChild(NodeType.STACK);
        } else if (selectedType === NodeType.CENTERED_CONTAINER || selectedType === NodeType.TITLED_CONTAINER) {
            // Если есть цепочка вложенных узлов, строим её снизу вверх
            let childChain: BaseNode;
            if (selectedChildTypes.length > 0) {
                // Инициализируем нижний (самый вложенный) узел
                childChain = createNodeWithChild(selectedChildTypes[selectedChildTypes.length - 1]);
                // Оборачиваем каждый предыдущий узел (если есть)
                for (let i = selectedChildTypes.length - 2; i >= 0; i--) {
                    childChain = createNodeWithChild(selectedChildTypes[i], childChain);
                }
            } else {
                // Если цепочка не задана – используем дефолтный текстовый узел
                childChain = createNodeWithChild(NodeType.TEXT);
            }
            // Создаём корневой контейнер выбранного типа, передавая сформированную цепочку
            newNode = createNodeWithChild(selectedType, childChain);
        } else if (selectedType === NodeType.ICON_TEXT) {
            newNode = createNodeWithChild(NodeType.ICON_TEXT);
        } else {
            return;
        }

        addNodeToSelectedStack(newNode);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-800 p-6 rounded shadow-lg w-96 text-white" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-bold mb-4">Добавить узел</h2>

                {/* Выбор основного типа узла */}
                <select
                    className="w-full p-2 bg-gray-700 rounded mb-4"
                    value={selectedType || ""}
                    onChange={(e) => {
                        const newType = e.target.value as NodeType;
                        setSelectedType(newType);
                        // Для контейнеров по умолчанию создаём вложенный текстовый узел
                        setSelectedChildTypes(
                            (newType === NodeType.CENTERED_CONTAINER || newType === NodeType.TITLED_CONTAINER)
                                ? [NodeType.TEXT]
                                : []
                        );
                    }}
                >
                    <option value="">Выберите тип</option>
                    {Object.values(NodeType).map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                {/* Поле для ввода текста (если выбран узел типа Text) */}
                {selectedType === NodeType.TEXT && (
                    <input
                        type="text"
                        className="w-full p-2 bg-gray-700 rounded mb-4"
                        placeholder="Введите текст"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                )}

                {/* Динамический выбор вложенных типов для контейнеров */}
                {(selectedType === NodeType.CENTERED_CONTAINER || selectedType === NodeType.TITLED_CONTAINER) && (
                    <ChildTypeSelector
                        selectedChildTypes={selectedChildTypes}
                        setSelectedChildTypes={setSelectedChildTypes}
                    />
                )}

                <button className="w-full p-3 bg-green-600 rounded hover:bg-green-500" onClick={handleAddNode}>
                    Добавить
                </button>

                <button className="w-full p-3 bg-red-600 rounded mt-2 hover:bg-red-500" onClick={onClose}>
                    Отмена
                </button>
            </div>
        </div>
    );
};

export default AddNodeModal;
