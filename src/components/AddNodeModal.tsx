import {useState} from "react";
import {useSelectedNode} from "../context/hooks/context.ts";
import {
    AlignItems,
    BaseNode,
    CenteredContainer,
    FlexWrap,
    FontColor,
    FontSize,
    FontWeight,
    JustifyContent,
    NodeType,
    Stack,
    Text,
    TextAlign,
    TitledContainer
} from "../utills/parser/types.ts";
import {v4 as uuidv4} from 'uuid';

const AddNodeModal = ({onClose}: { onClose: () => void }) => {
    const {addNodeToSelectedStack} = useSelectedNode();
    const [selectedType, setSelectedType] = useState<NodeType | null>(null);
    const [text, setText] = useState("");
    const [childNodeType, setChildNodeType] = useState<NodeType | null>(null);

    const handleAddNode = () => {
        if (!selectedType) return;

        let newNode: BaseNode;
        const newId = uuidv4(); // Генерация ID

        if (selectedType === NodeType.TEXT) {
            newNode = {
                id: newId,
                nodeType: NodeType.TEXT,
                fontSize: FontSize.SMALL,
                htmltext: text || "Новый текст",
                textAlign: TextAlign.LEFT,
                fontColor: FontColor.DEFAULT,
                fontWeight: FontWeight.BOLD,
            } as Text;
        } else if (selectedType === NodeType.STACK) {
            newNode = {
                id: newId,
                nodeType: NodeType.STACK,
                vertical: true,
                gap: 10,
                flexWrap: FlexWrap.NOWRAP,
                justifyContent: JustifyContent.CENTER,
                alignItems: AlignItems.CENTER,
                children: [],
            } as Stack;
        } else if (selectedType === NodeType.CENTERED_CONTAINER && childNodeType) {
            newNode = {
                id: newId,
                nodeType: NodeType.CENTERED_CONTAINER,
                childNode: {
                    id: Math.random().toString(36).substring(2, 9),
                    nodeType: childNodeType,
                } as BaseNode,
            } as CenteredContainer;
        } else if (selectedType === NodeType.TITLED_CONTAINER && childNodeType) {
            newNode = {
                id: newId,
                nodeType: NodeType.TITLED_CONTAINER,
                titleText: {
                    id: Math.random().toString(36).substring(2, 9),
                    nodeType: NodeType.TEXT,
                    htmltext: "Заголовок",
                    fontSize: FontSize.MEDIUM,
                    textAlign: TextAlign.LEFT,
                    fontColor: FontColor.PRIMARY,
                    fontWeight: FontWeight.BOLD,
                } as Text,
                content: {
                    id: Math.random().toString(36).substring(2, 9),
                    nodeType: childNodeType,
                } as BaseNode,
            } as TitledContainer;
        } else {
            return;
        }

        addNodeToSelectedStack(newNode);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-800 p-6 rounded shadow-lg w-96 text-white"
                 onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-bold mb-4">Добавить узел</h2>

                <select
                    className="w-full p-2 bg-gray-700 rounded mb-4"
                    value={selectedType || ""}
                    onChange={(e) => setSelectedType(e.target.value as NodeType)}
                >
                    <option value="">Выберите тип</option>
                    {Object.values(NodeType).map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                {selectedType === NodeType.TEXT && (
                    <input
                        type="text"
                        className="w-full p-2 bg-gray-700 rounded mb-4"
                        placeholder="Введите текст"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                )}

                {(selectedType === NodeType.CENTERED_CONTAINER || selectedType === NodeType.TITLED_CONTAINER) && (
                    <select
                        className="w-full p-2 bg-gray-700 rounded mb-4"
                        value={childNodeType || ""}
                        onChange={(e) => setChildNodeType(e.target.value as NodeType)}
                    >
                        <option value="">Выберите дочерний узел</option>
                        {Object.values(NodeType).map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
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
