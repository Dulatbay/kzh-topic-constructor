import {BaseNode} from "../../utills/parser/types.ts";

interface TopicLink {
    topicId: string;
    topicNumber: number;
    moduleNumber: number;
    topicName: string;
    moduleName: string;
    passed: boolean;
    availableToPass: boolean;
}

export interface TopicDetailResponse {
    content: BaseNode;
    current: TopicLink;
    next: TopicLink;
    prev: TopicLink;
}

export interface TopicResponse {
    topicId: string;
    topicName: string;
}

export interface ModuleResponse {
    id: string;
    name: string;
    imageUrl: string;
    questionNumbers: number;
    duration: number;
    passedUsersCount: number;
    number: number;
    difficulty: number;
    topics: TopicResponse[];
}
