import {ArcherContainer} from "react-archer";
import {TransformWrapper, TransformComponent} from "react-zoom-pan-pinch";
import {Parser} from "../utills/parser/Parser.tsx";
import {BaseNode} from "../utills/parser/types.ts";
import {useSelectedNode} from "../context/hooks/context.ts";
import {useState} from "react";
import AddNodeModal from "./AddNodeModal.tsx";

const MainDrawBar = ({obj}: { obj: BaseNode }) => {
    const {setSelectedNodeData, isAvailableToAdd} = useSelectedNode();
    const [showModal, setShowModal] = useState(false);


    return (
        <div
            className="flex-grow bg-gray-300 min-h-screen relative overflow-hidden"
            onClick={() => setSelectedNodeData(null)}
        >

            {showModal && <AddNodeModal onClose={() => setShowModal(false)}/>}


            <TransformWrapper limitToBounds={false} centerOnInit={true} minScale={0.5} maxScale={5} wheel={{step: 0.2}}>
                {({zoomIn, zoomOut, resetTransform}) => (
                    <>
                        <div className="absolute mt-4 ml-8 flex gap-2 z-50">
                            <button onClick={(e) => {
                                e.stopPropagation();
                                zoomIn(0.2);
                            }} className="px-4 py-2 bg-blue-500 text-white rounded">+
                            </button>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                zoomOut(0.2);
                            }} className="px-4 py-2 bg-blue-500 text-white rounded">−
                            </button>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                resetTransform();
                            }} className="px-4 py-2 bg-gray-500 text-white rounded">🔄
                            </button>
                            {
                                isAvailableToAdd && <button
                                    className="px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-500 transition"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowModal(true)
                                    }}
                                >
                                    ➕ Добавить узел
                                </button>
                            }
                        </div>

                        <TransformComponent wrapperClass={"!w-screen !h-screen"}>
                            <div
                                className="w-[1200px] mx-auto flex flex-col gap-6 sm:px-8 px-0"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ArcherContainer strokeColor="white" strokeWidth={2} endMarker={false}>
                                    <Parser obj={obj}/>
                                </ArcherContainer>
                            </div>
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>
        </div>
    );
};

export default MainDrawBar;
