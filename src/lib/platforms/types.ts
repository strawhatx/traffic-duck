export type PlatformSource = "reddit" | "instagram" | "twitter";

export type PlatformResult = {
  platform: PlatformSource;
  title: string;
  content?: string;
  author: string;
  url: string;
  engagement?: Record<string, unknown>;
};


