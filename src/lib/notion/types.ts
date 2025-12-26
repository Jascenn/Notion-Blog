

export interface NotionPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    publishedAt: string;
    tags: { name: string; color: string }[];
    published: boolean;
    cover?: string | null;
    pinned?: boolean;
    type?: 'post' | 'page' | 'announcement';
}

// Notion API 响应类型
export interface NotionRichText {
    plain_text: string;
    href?: string | null;
    annotations?: {
        bold: boolean;
        italic: boolean;
        strikethrough: boolean;
        underline: boolean;
        code: boolean;
        color: string;
    };
    text?: {
        link?: {
            url?: string | null;
        };
    };
}

export interface NotionSelect {
    name: string;
}

export interface NotionMultiSelect {
    name: string;
    color: string;
}

export interface NotionCheckbox {
    checkbox: boolean;
}

export interface NotionDate {
    start: string;
}

export interface NotionFile {
    url: string;
}

export interface NotionCover {
    external?: NotionFile;
    file?: NotionFile;
}

export interface NotionProperties {
    Title?: { title: NotionRichText[] };
    Slug?: { rich_text: NotionRichText[] };
    Summary?: { rich_text: NotionRichText[] };
    Excerpt?: { rich_text: NotionRichText[] };
    'Published Date'?: { date?: NotionDate };
    Tags?: { multi_select: NotionMultiSelect[] };
    Published?: NotionCheckbox;
    Status?: { select?: NotionSelect };
    Type?: { select?: NotionSelect };
    Pinned?: NotionCheckbox;
}

export interface NotionPage {
    id: string;
    properties: NotionProperties;
    cover?: NotionCover;
    last_edited_time: string;
}

// Notion 块内容类型
export interface NotionBlockContent {
    rich_text?: NotionRichText[];
    language?: string;
    caption?: NotionRichText[];
    url?: string;
    name?: string;
    color?: string;
    table_width?: number;
    is_toggleable?: boolean;
    children?: NotionBlock[];
    icon?: {
        emoji?: string;
        external?: { url: string };
        file?: { url: string };
    };
    external?: { url: string };
    file?: { url: string };
    table_row?: {
        cells: NotionRichText[][];
    };
    bookmark?: {
        url: string;
    };
}

export interface NotionBlock {
    id: string;
    type: string;
    has_children: boolean;
    // 具体的块类型属性
    paragraph?: NotionBlockContent;
    heading_1?: NotionBlockContent;
    heading_2?: NotionBlockContent;
    heading_3?: NotionBlockContent;
    bulleted_list_item?: NotionBlockContent;
    numbered_list_item?: NotionBlockContent;
    code?: NotionBlockContent;
    quote?: NotionBlockContent;
    image?: NotionBlockContent & {
        external?: { url: string };
        file?: { url: string };
    };
    video?: NotionBlockContent & {
        external?: { url: string };
        file?: { url: string };
    };
    audio?: NotionBlockContent & {
        external?: { url: string };
        file?: { url: string };
    };
    file?: NotionBlockContent & {
        external?: { url: string };
        file?: { url: string };
    };
    embed?: { url: string };
    callout?: NotionBlockContent;
    toggle?: NotionBlockContent;
    column_list?: NotionBlockContent;
    column?: NotionBlockContent;
    table_row?: { cells: NotionRichText[][] };
    table?: {
        table_width: number;
        has_column_header?: boolean;
        has_row_header?: boolean;
    };
    bookmark?: {
        caption?: NotionRichText[];
        url: string;
    };
    equation?: {
        expression: string;
    };
    pdf?: NotionBlockContent;
    // 通用索引签名作为后备，需要包含上述所有具体类型
    [key: string]: unknown;
}

export interface FetchOptions {
    method?: string;
    headers: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
    next?: { revalidate: number };
    cache?: RequestCache;
}
