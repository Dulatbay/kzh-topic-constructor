import {useEffect} from "react";
import {useLazyFetchAllModulesQuery} from "../services/module/api.ts";
import {TopicResponse} from "../services/module/types.ts";
import {useNavigate} from "react-router-dom";
import {useSelectedNode} from "../context/hooks/context.ts";

const ModulesPage = () => {
    const [fetchModules, {data: modules, isLoading, error}] = useLazyFetchAllModulesQuery();
    const {setFullData} = useSelectedNode();

    const navigate = useNavigate();

    useEffect(() => {
        setFullData(null);
        localStorage.removeItem("isSaved")
        fetchModules();
    }, [setFullData, fetchModules]);

    if (isLoading) return <div>Загрузка модулей...</div>;
    if (error) return <div className="text-red-500">Ошибка загрузки</div>;

    return (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-800 text-white rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Выберите топик</h2>

            {modules?.map((module) => (
                <div key={module.id} className="mb-6">
                    <h3 className="text-lg font-semibold bg-gray-700 p-2 rounded">{module.name}</h3>
                    <div className="ml-4 mt-2">
                        {module.topics.length > 0 ? (
                            module.topics.map((topic: TopicResponse, i) => (
                                <button
                                    key={topic.topicId}
                                    className="block w-full text-left p-2 bg-gray-600 hover:bg-gray-500 rounded mb-1"
                                    onClick={() => {

                                        navigate(`/main?module=${module.number - 1}&topic=${i}`)
                                    }}
                                >
                                    {topic.topicName}
                                </button>
                            ))
                        ) : (
                            <p className="text-gray-400">Нет доступных топиков</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ModulesPage;
