import InfoBar from "../components/InfoBar.tsx";
import MainDrawBar from "../components/MainDrawBar.tsx";
import PropertiesBar from "../components/PropertiesBar.tsx";
import {useLazyFetchTopicByParamsQuery} from "../services/module/api.ts";
import {useEffect} from "react";
import {useSelectedNode} from "../context/hooks/context.ts";
import {useSearchParams} from "react-router-dom";

const MainPage = () => {
    const [fetchTopicByParamsQuery, {isLoading, error, data}] = useLazyFetchTopicByParamsQuery();
    const {fullData, setFullData, handleIsSaved} = useSelectedNode();
    const [searchParams] = useSearchParams();
    const moduleNumber = searchParams.get("module") ?? "0";
    const topicNumber = searchParams.get("topic") ?? "0";

    useEffect(() => {
        const fetch = async () => {
            await fetchTopicByParamsQuery({moduleNumber, topicNumber});
            if (data)
                setFullData(data.content)
        }

        const storedData = localStorage.getItem("fullData");
        if (storedData) {
            setFullData(JSON.parse(storedData));
        } else {
            fetch()
        }
    }, [data, fetchTopicByParamsQuery, moduleNumber, setFullData, topicNumber]);


    const handleReset = async () => {
        handleIsSaved(true);
        await fetchTopicByParamsQuery({moduleNumber: moduleNumber, topicNumber: topicNumber});

        if (data) {
            setFullData(data.content);
        } else {
            setFullData(null);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error || !fullData) return <div>No data</div>;


    return (
        <div className="flex w-full justify-stretch bg-gray-100">
            <InfoBar obj={fullData} handleReset={handleReset}/>
            <MainDrawBar obj={fullData}/>
            <PropertiesBar/>
        </div>
    );
};

export default MainPage;
