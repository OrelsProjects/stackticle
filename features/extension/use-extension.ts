"use client";

import { useCallback, useMemo } from "react";
import type {
  DeleteArticleResult,
  ExtensionAction,
  ExtensionResponse,
  PostsResponse,
  SyncUserResult,
} from "./types";

const EXTENSION_ID =
  process.env.NEXT_PUBLIC_EXTENSION_ID ?? "bimneickbemndjkmehlpkdcfacpkbmbo";

interface ChromeRuntime {
  sendMessage: (
    extensionId: string,
    message: unknown,
    callback: (response: unknown) => void,
  ) => void;
  lastError?: { message: string };
}

interface ChromeGlobal {
  runtime?: ChromeRuntime;
}

declare global {
  interface Window {
    chrome?: ChromeGlobal;
  }
}

class ExtensionUnavailableError extends Error {
  constructor() {
    super(
      "StackTicle Chrome extension is not installed or not reachable. Install it from the Chrome Web Store and reload this page.",
    );
    this.name = "ExtensionUnavailableError";
  }
}

function sendMessage<T>(
  action: ExtensionAction,
  payload: Record<string, unknown>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.chrome?.runtime?.sendMessage) {
      reject(new ExtensionUnavailableError());
      return;
    }
    try {
      window.chrome.runtime.sendMessage(
        EXTENSION_ID,
        { type: "API_REQUEST", action, payload },
        (response: unknown) => {
          const err = window.chrome?.runtime?.lastError;
          if (err) {
            reject(new ExtensionUnavailableError());
            return;
          }
          const res = response as ExtensionResponse<T> | undefined;
          if (!res) {
            reject(new ExtensionUnavailableError());
            return;
          }
          if (!res.success) {
            reject(new Error(res.error || "Extension call failed"));
            return;
          }
          resolve(res.data);
        },
      );
    } catch {
      reject(new ExtensionUnavailableError());
    }
  });
}

export interface UseExtension {
  isInstalled: () => boolean;
  syncUser: () => Promise<SyncUserResult>;
  fetchPublishedPosts: (
    newsletterUrl: string,
    offset?: number,
    limit?: number,
  ) => Promise<PostsResponse>;
  fetchScheduledPosts: (
    newsletterUrl: string,
    offset?: number,
    limit?: number,
  ) => Promise<PostsResponse>;
  fetchDraftPosts: (
    newsletterUrl: string,
    offset?: number,
    limit?: number,
  ) => Promise<PostsResponse>;
  deleteArticleMany: (
    newsletterUrl: string,
    postIds: number[],
  ) => Promise<DeleteArticleResult[]>;
}

export function useExtension(): UseExtension {
  const isInstalled = useCallback(() => {
    return Boolean(
      typeof window !== "undefined" && window.chrome?.runtime?.sendMessage,
    );
  }, []);

  const syncUser = useCallback(
    () => sendMessage<SyncUserResult>("syncUser", {}),
    [],
  );

  const fetchPublishedPosts = useCallback(
    (newsletterUrl: string, offset = 0, limit = 25) =>
      sendMessage<PostsResponse>("fetchPublishedPosts", {
        newsletterUrl,
        offset,
        limit,
      }),
    [],
  );

  const fetchScheduledPosts = useCallback(
    (newsletterUrl: string, offset = 0, limit = 25) =>
      sendMessage<PostsResponse>("fetchScheduledPosts", {
        newsletterUrl,
        offset,
        limit,
      }),
    [],
  );

  const fetchDraftPosts = useCallback(
    (newsletterUrl: string, offset = 0, limit = 25) =>
      sendMessage<PostsResponse>("fetchDraftPosts", {
        newsletterUrl,
        offset,
        limit,
      }),
    [],
  );

  const deleteArticleMany = useCallback(
    (newsletterUrl: string, postIds: number[]) =>
      sendMessage<DeleteArticleResult[]>("deleteArticleMany", {
        newsletterUrl,
        postIds,
      }),
    [],
  );

  return useMemo(
    () => ({
      isInstalled,
      syncUser,
      fetchPublishedPosts,
      fetchScheduledPosts,
      fetchDraftPosts,
      deleteArticleMany,
    }),
    [
      isInstalled,
      syncUser,
      fetchPublishedPosts,
      fetchScheduledPosts,
      fetchDraftPosts,
      deleteArticleMany,
    ],
  );
}
