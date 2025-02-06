import {baseApi} from "../baseApi.ts";
import {ModuleResponse, TopicDetailResponse} from "./types.ts";
import {BaseNode} from "../../utills/parser/types.ts";

export const topicApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        fetchTopicByParams: builder.query<TopicDetailResponse, { moduleNumber: string; topicNumber: string }>({
            query: ({moduleNumber, topicNumber}) =>
                `/modules/initializer-test/${moduleNumber}/topics/${topicNumber}`,
        }),
        fetchAllModules: builder.query<ModuleResponse[], void>({
            query: () => `/modules`,
        }),
        setTopicContent: builder.mutation<void, { topicId: string; content: BaseNode }>({
            query: ({ topicId, content }) => ({
                url: `/modules/topic/set-content/${topicId}`,
                method: 'PATCH',
                body: content,
            }),
        }),
    }),
});

export const {useLazyFetchTopicByParamsQuery, useLazyFetchAllModulesQuery, useSetTopicContentMutation} = topicApi;
