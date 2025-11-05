import { create } from "zustand";
import newsData from "@/content/news.json";

export type PostStatus = "draft" | "published";

export type Post = {
  id: string;
  title: string;
  author: string;
  excerpt: string;
  content?: string;
  links?: string[];
  tags: string[];
  publishedAt: string;
  pinned: boolean;
  status: PostStatus;
  thumbnail: string;
  readingTime: string;
  order: number;
};

export type PostsState = {
  posts: Post[];
  deletedPosts: Post[];
  createPost: (overrides?: Partial<Post>) => Post;
  publishPost: (id: string) => void;
  unpublishPost: (id: string) => void;
  togglePin: (id: string) => void;
  duplicatePost: (id: string) => void;
  deletePost: (id: string) => void;
  restorePost: (id: string) => void;
  deletePermanently: (id: string) => void;
  movePost: (id: string, direction: "up" | "down") => void;
  updatePost: (id: string, payload: Partial<Post>) => void;
};

const INITIAL_POSTS: Post[] = newsData.map((item, index) => ({
  id: item.id,
  title: item.title,
  author: item.author,
  excerpt: item.preview,
  content: "",
  links: [],
  tags: item.tags,
  pinned: Boolean(item.pinned),
  status: (item.status ?? "draft") as PostStatus,
  publishedAt: item.date,
  thumbnail: item.thumbnail,
  readingTime: item.readingTime,
  order: index
}));

/**
 * TODO(supabase): Replace this in-memory posts store with Supabase queries/mutations.
 */
export const usePostsStore = create<PostsState>((set, get) => ({
  posts: INITIAL_POSTS,
  deletedPosts: [],
  createPost: (overrides) => {
    const base: Post = {
      id: `post-${Date.now()}`,
      title: "Untitled Draft",
      author: "Editorial Team",
      excerpt: "Outline the key insights for this update.",
      content: "",
      links: [],
      tags: ["Draft"],
      pinned: false,
      status: "draft",
      publishedAt: new Date().toISOString(),
      thumbnail: Math.random() > 0.5 ? "/Images/Logos/Placeholders/Placeholder.png" : "/Images/Logos/Placeholders/Placeholder 2.png",
      readingTime: "3 min read",
      order: 0,
    };

    const nextPost = { ...base, ...overrides, order: 0 } satisfies Post;

    set(({ posts }) => ({
      posts: [nextPost, ...posts].map((post, index) => ({ ...post, order: index })),
    }));

    return nextPost;
  },
  publishPost: (id) => {
    set(({ posts }) => ({
      posts: posts.map((post) =>
        post.id === id ? { ...post, status: "published" } : post
      )
    }));
  },
  unpublishPost: (id) => {
    set(({ posts }) => ({
      posts: posts.map((post) =>
        post.id === id ? { ...post, status: "draft" } : post
      )
    }));
  },
  togglePin: (id) => {
    set(({ posts }) => ({
      posts: posts.map((post) =>
        post.id === id ? { ...post, pinned: !post.pinned } : post
      )
    }));
  },
  duplicatePost: (id) => {
    const { posts } = get();
    const target = posts.find((post) => post.id === id);
    if (!target) return;
    const clone: Post = {
      ...target,
      id: `${target.id}-copy-${Date.now()}`,
      title: `${target.title} (Copy)`,
      pinned: false,
      status: "draft",
      order: target.order + 0.1
    };
    set({
      posts: [...posts, clone]
        .sort((a, b) => a.order - b.order)
        .map((post, index) => ({ ...post, order: index }))
    });
  },
  deletePost: (id) => {
    const { posts, deletedPosts } = get();
    const target = posts.find((post) => post.id === id);
    if (!target) return;
    set({
      posts: posts.filter((post) => post.id !== id).map((post, idx) => ({
        ...post,
        order: idx
      })),
      deletedPosts: [{ ...target }, ...deletedPosts]
    });
  },
  restorePost: (id) => {
    const { posts, deletedPosts } = get();
    const target = deletedPosts.find((post) => post.id === id);
    if (!target) return;
    set({
      posts: [{ ...target, order: posts.length }, ...posts].map((post, idx) => ({
        ...post,
        order: idx
      })),
      deletedPosts: deletedPosts.filter((post) => post.id !== id)
    });
  },
  deletePermanently: (id) => {
    const { deletedPosts } = get();
    set({
      deletedPosts: deletedPosts.filter((post) => post.id !== id)
    });
  },
  movePost: (id, direction) => {
    const { posts } = get();
    const index = posts.findIndex((post) => post.id === id);
    if (index === -1) return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= posts.length) return;
    const updated = [...posts];
    const [target] = updated.splice(index, 1);
    updated.splice(swapIndex, 0, target);
    set({
      posts: updated.map((post, idx) => ({ ...post, order: idx }))
    });
  },
  updatePost: (id, payload) => {
    set(({ posts }) => ({
      posts: posts.map((post) =>
        post.id === id
          ? {
              ...post,
              ...payload
            }
          : post
      )
    }));
  }
}));

