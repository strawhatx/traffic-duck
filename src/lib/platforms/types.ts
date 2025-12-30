export type PlatformSource = "reddit" | "twitter" | "hackernews";

export type PlatformResult = {
  platform: PlatformSource;
  title: string;
  content?: string;
  author: string;
  url: string;
  engagement?: Record<string, unknown>;
};


