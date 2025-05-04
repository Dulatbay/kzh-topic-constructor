import {baseApi} from "../baseApi.ts";
import {ModuleResponse, TopicDetailResponse} from "./types.ts";
import {BaseNode} from "../../utills/parser/types.ts";

export const topicApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        fetchTopicByParams: builder.query<TopicDetailResponse, { topicId: string }>({
            query: ({topicId}) =>
                `/modules/topics/${topicId}`,
        }),
        fetchAllModules: builder.query<ModuleResponse[], void>({
            query: () => `/modules`,
        }),
        setTopicContent: builder.mutation<void, { topicId: string; content: BaseNode }>({
            query: ({ topicId, content }) => ({
                url: `/modules/topics/${topicId}`,
                method: 'PUT',
                body: content,
            }),
        }),
    }),
});

export const {useLazyFetchTopicByParamsQuery, useLazyFetchAllModulesQuery, useSetTopicContentMutation} = topicApi;
