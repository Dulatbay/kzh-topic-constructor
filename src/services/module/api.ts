import {baseApi} from "../baseApi.ts";
import {ModuleResponse, TopicDetailResponse} from "./types.ts";

export const topicApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        fetchTopicByParams: builder.query<TopicDetailResponse, { moduleNumber: string; topicNumber: string }>({
            query: ({moduleNumber, topicNumber}) =>
                `/modules/initializer-test/${moduleNumber}/topics/${topicNumber}`,
        }),
        fetchAllModules: builder.query<ModuleResponse[], void>({
            query: () => `/modules`,
        })
    }),
});

export const {useLazyFetchTopicByParamsQuery, useLazyFetchAllModulesQuery} = topicApi;
