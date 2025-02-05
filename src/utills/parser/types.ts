import React from "react";

export enum TextAlign {
    LEFT = 'left',
    RIGHT = 'right',
    CENTER = 'center',
}

export enum Background {
    PRIMARY = "PRIMARY",
    DEFAULT = "DEFAULT",
    SECONDARY = "SECONDARY",
    TERTIARY = "TERTIARY",
}

export enum BorderType {
    SOLID = "SOLID",
    DASHED = "DASHED",
    DOTTED = "DOTTED",
    NONE = "NONE",
}

export enum FontColor {
    PRIMARY = "PRIMARY",
    DEFAULT = "DEFAULT",
    SECONDARY = "SECONDARY",
    TERTIARY = "TERTIARY",
}

export enum FontWeight {
    BOLD = "BOLD",
    REGULAR = "REGULAR",
    THIN = "THIN",
}

export enum Icon {
    // Add specific icons here, e.g. HOME = "HOME"
}

export enum FontSize {
    BIG = "BIG",
    MEDIUM = "MEDIUM",
    SMALL = "SMALL",
}

// BaseNode abstract structure
export interface BaseNode {
    id: string;
    nodeType: NodeType;
    background?: Background;
    borderColor?: FontColor;
    borderType?: BorderType;
    borderRadius?: string;
    opacity?: number;
    padding?: string;
    margin?: string;
    width?: string;
    height?: string;
    links?: Link[];
    overflowX?: string;
    overflowY?: string;
    flex?: number;
    minWidth?: string;
    minHeight?: string;
}

// Enum for Node Types
export enum NodeType {
    TEXT = "TEXT",
    ICON_TEXT = "ICON_TEXT",
    TITLED_CONTAINER = "TITLED_CONTAINER",
    CENTERED_CONTAINER = "CENTERED_CONTAINER",
    IMAGE = "IMAGE",
    STACK = "STACK",
}

export enum FlexWrap {
    WRAP = "wrap", NOWRAP = "nowrap"
}

export enum JustifyContent {
    SPACE_BETWEEN = 'space-between', SPACE_AROUND = 'space-around', CENTER = 'center', STRETCH = 'stretch'
}

export enum AlignItems {
    START = 'start', CENTER = 'center', END = 'end', STRETCH = 'stretch'
}

// Specific node types
export interface CenteredContainer extends BaseNode {
    nodeType: NodeType.CENTERED_CONTAINER;
    childNode: BaseNode;
}

export interface IconText extends BaseNode {
    nodeType: NodeType.ICON_TEXT;
    text: Text;
    icon: string;
}

export interface Image extends BaseNode {
    nodeType: NodeType.IMAGE;
    url: string;
}

export interface Stack extends BaseNode {
    nodeType: NodeType.STACK;
    vertical: boolean;
    gap: number;
    flexWrap: FlexWrap;
    justifyContent: JustifyContent;
    alignItems: AlignItems;
    children: BaseNode[];
}

export type Link = {
    fromId: string;
    toId: string;
};

export interface Text extends BaseNode {
    nodeType: NodeType.TEXT;
    fontSize: FontSize;
    htmltext: string;
    textAlign: TextAlign;
    fontColor: FontColor;
    fontWeight: FontWeight;
}

export interface TitledContainer extends BaseNode {
    nodeType: NodeType.TITLED_CONTAINER;
    titleText: Text;
    isDivided: boolean;
    content: BaseNode;
}

//                     onClick={(e) => handleClick(e, obj.id)}

export interface BaseProps {
    onClick?: (e: React.MouseEvent) => void;
    isSelected?: boolean;
}
