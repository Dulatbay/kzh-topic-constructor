import InfoBar from "../components/InfoBar.tsx";
import MainDrawBar from "../components/MainDrawBar.tsx";
import PropertiesBar from "../components/PropertiesBar.tsx";
import {useLazyFetchTopicByParamsQuery} from "../services/module/api.ts";
import {useEffect} from "react";
import {useSelectedNode} from "../context/hooks/context.ts";
import {useSearchParams} from "react-router-dom";
import Split from "react-split";

const MainPage = () => {
    const [fetchTopicByParamsQuery, {isLoading, error, data}] = useLazyFetchTopicByParamsQuery();
    const {fullData, setFullData, reset, setApiResponse} = useSelectedNode();
    const [searchParams] = useSearchParams();
    const topicId = searchParams.get("topicId") ?? "0";

    useEffect(() => {
        const fetch = async () => {
            await fetchTopicByParamsQuery({topicId});
            if (data) {
                setFullData(data.content)
                setApiResponse(data)
            }
        }

        const storedData = localStorage.getItem("fullData");
        if (storedData) {
            setFullData(JSON.parse(storedData));
        } else {
            fetch()
        }
    }, [data, fetchTopicByParamsQuery, topicId]);


    const handleReset = async () => {
        reset()
        await fetchTopicByParamsQuery({topicId});

        if (data) {
            setFullData(data.content);
        } else {
            setFullData(null);
        }
    };

    if (isLoading || !fullData) return <div>Loading...</div>;
    if (error) return <div>No data</div>;


    return (
        <div className="flex w-full justify-stretch bg-gray-100 h-screen">
            <Split
                className="flex w-full h-screen"
                sizes={[20, 60, 20]}
                minSize={200}
                expandToMin={true}
                gutterSize={8}
                gutterAlign="center"
                direction="horizontal"
            >
                <InfoBar obj={fullData} handleReset={handleReset}/>
                <MainDrawBar obj={fullData}/>
                <PropertiesBar/>
            </Split>
        </div>
    );
};

export default MainPage;
