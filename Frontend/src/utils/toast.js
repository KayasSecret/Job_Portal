import React from "react";
import { toast as sonnerToast } from "sonner";

/**
 * Normalizes and sanitizes toast messages to prevent raw technical errors,
 * HTML dumps, network crashes, or null/undefined messages from being shown to users.
 */
export function sanitizeToastMessage(
  rawMessage,
  fallback = "Something went wrong. Please try again."
) {
  if (rawMessage === null || rawMessage === undefined) {
    return fallback;
  }

  // If already a valid React element, return directly
  if (React.isValidElement(rawMessage)) {
    return rawMessage;
  }

  // Handle Error instances and Axios error shapes
  if (typeof rawMessage === "object") {
    // Axios error response data
    if (rawMessage.response?.data?.message) {
      return sanitizeToastMessage(rawMessage.response.data.message, fallback);
    }
    if (rawMessage.response?.data?.error) {
      return sanitizeToastMessage(rawMessage.response.data.error, fallback);
    }
    // Standard JS Error
    if (rawMessage.message) {
      return sanitizeToastMessage(rawMessage.message, fallback);
    }
    return fallback;
  }

  if (typeof rawMessage !== "string") {
    return String(rawMessage);
  }

  const trimmed = rawMessage.trim();
  if (!trimmed) return fallback;

  // Catch HTML server dumps (e.g. 500/502/504 error pages)
  if (
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<html") ||
    /<[a-z][\s\S]*>/i.test(trimmed)
  ) {
    return "The server is temporarily unavailable. Please try again in a moment.";
  }

  // Friendly network error formatting
  const lower = trimmed.toLowerCase();
  if (
    lower === "network error" ||
    lower === "err_network" ||
    lower.includes("failed to fetch") ||
    lower.includes("network request failed")
  ) {
    return "Network connection issue. Please check your internet connection.";
  }

  // Strip technical stack traces or generic Axios error wrappers
  if (
    trimmed.includes("\n    at ") ||
    trimmed.includes(" at ") ||
    trimmed.startsWith("Error:") ||
    trimmed.startsWith("AxiosError:")
  ) {
    const firstLine = trimmed
      .split("\n")[0]
      .replace(/^(Axios)?Error:\s*/i, "")
      .trim();

    if (firstLine.includes("status code 500")) {
      return "Internal server error occurred. Please try again later.";
    }
    if (firstLine.includes("status code 404")) {
      return "Requested resource could not be found.";
    }
    if (firstLine.includes("status code 401") || firstLine.includes("status code 403")) {
      return "You do not have permission to perform this action.";
    }
    return firstLine || fallback;
  }

  return trimmed;
}

/**
 * In-memory deduplication cache to prevent identical toasts from spamming
 * the screen in rapid succession (e.g. React StrictMode double effect or rapid clicks).
 */
const recentToasts = new Map();
const DEDUPE_THRESHOLD_MS = 1200;

function isThrottled(type, message, options) {
  // If user explicitly provided an ID, let Sonner handle matching
  if (options && options.id !== undefined) {
    return false;
  }

  // Generate unique signature for this toast
  const contentKey =
    typeof message === "string"
      ? message
      : typeof message === "object"
      ? JSON.stringify(message)
      : String(message);
  const cacheKey = `${type}::${contentKey}`;

  const now = Date.now();
  const lastFired = recentToasts.get(cacheKey);

  if (lastFired && now - lastFired < DEDUPE_THRESHOLD_MS) {
    return true;
  }

  recentToasts.set(cacheKey, now);

  // Keep cache small
  if (recentToasts.size > 80) {
    for (const [key, timestamp] of recentToasts.entries()) {
      if (now - timestamp > 8000) {
        recentToasts.delete(key);
      }
    }
  }

  return false;
}

// Preserve original sonner functions
const rawToast = sonnerToast;
const rawSuccess = sonnerToast.success.bind(sonnerToast);
const rawError = sonnerToast.error.bind(sonnerToast);
const rawWarning = sonnerToast.warning.bind(sonnerToast);
const rawInfo = sonnerToast.info.bind(sonnerToast);
const rawLoading = sonnerToast.loading.bind(sonnerToast);
const rawMessage = sonnerToast.message.bind(sonnerToast);
const rawDismiss = sonnerToast.dismiss.bind(sonnerToast);

/**
 * Enhanced global toast helper functions with deduplication & sanitization.
 */
export const toast = Object.assign(
  (message, options) => {
    const cleanMsg = sanitizeToastMessage(message, "Notification");
    if (isThrottled("default", cleanMsg, options)) return "";
    return rawToast(cleanMsg, options);
  },
  {
    success: (message, options) => {
      const cleanMsg = sanitizeToastMessage(message, "Operation completed successfully.");
      if (isThrottled("success", cleanMsg, options)) return "";
      return rawSuccess(cleanMsg, options);
    },

    error: (message, options) => {
      const cleanMsg = sanitizeToastMessage(message, "An unexpected error occurred.");
      if (isThrottled("error", cleanMsg, options)) return "";
      return rawError(cleanMsg, options);
    },

    warning: (message, options) => {
      const cleanMsg = sanitizeToastMessage(message, "Please review the information provided.");
      if (isThrottled("warning", cleanMsg, options)) return "";
      return rawWarning(cleanMsg, options);
    },

    info: (message, options) => {
      const cleanMsg = sanitizeToastMessage(message, "Notice");
      if (isThrottled("info", cleanMsg, options)) return "";
      return rawInfo(cleanMsg, options);
    },

    loading: (message, options) => {
      const cleanMsg = sanitizeToastMessage(message, "Loading...");
      return rawLoading(cleanMsg, options);
    },

    message: (message, options) => {
      const cleanMsg = sanitizeToastMessage(message, "Notification");
      if (isThrottled("message", cleanMsg, options)) return "";
      return rawMessage(cleanMsg, options);
    },

    promise: sonnerToast.promise.bind(sonnerToast),
    custom: sonnerToast.custom.bind(sonnerToast),
    dismiss: (id) => rawDismiss(id),
    getHistory: () => sonnerToast.getHistory(),
    getToasts: () => sonnerToast.getToasts(),
  }
);

/**
 * Patch global Sonner singleton so all existing imports throughout the app
 * (`import { toast } from "sonner"`) automatically benefit from deduplication & sanitization.
 */
let isPatched = false;
export function patchSonnerGlobally() {
  if (isPatched || !sonnerToast) return;
  try {
    sonnerToast.success = toast.success;
    sonnerToast.error = toast.error;
    sonnerToast.warning = toast.warning;
    sonnerToast.info = toast.info;
    sonnerToast.loading = toast.loading;
    sonnerToast.message = toast.message;
    isPatched = true;
  } catch (err) {
    console.warn("Unable to monkey-patch sonner toast methods:", err);
  }
}

// Auto-run patch on load
patchSonnerGlobally();

export default toast;
