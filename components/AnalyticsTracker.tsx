"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SESSION_KEY = "analytics-session-id";
const VISITOR_KEY = "analytics-visitor-id";

function generateId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getSessionId() {
  if (typeof window === "undefined") return null;
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

function getVisitorId() {
  if (typeof window === "undefined") return null;
  let visitorId = localStorage.getItem(VISITOR_KEY);
  if (!visitorId) {
    visitorId = generateId();
    localStorage.setItem(VISITOR_KEY, visitorId);
  }
  return visitorId;
}

async function sendAnalyticsEvent(payload: {
  session_id: string | null;
  visitor_id: string | null;
  event_type: string;
  page: string;
  package_id?: string | null;
  value?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn("Analytics tracking failed:", error);
  }
}

function normalizeTarget(target: HTMLElement | null) {
  if (!target) return null;
  return target.closest("a,button,input,textarea,select,[role='button'],[data-analytics]") as HTMLElement | null;
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const session_id = getSessionId();
    const visitor_id = getVisitorId();
    const page = pathname || "/";

    sendAnalyticsEvent({
      session_id,
      visitor_id,
      event_type: "page_view",
      page,
      metadata: {
        search: searchParams.toString(),
        title: document.title,
      },
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    const session_id = getSessionId();
    const visitor_id = getVisitorId();

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const element = normalizeTarget(target);
      if (!element) return;

      const analyticsType = element.getAttribute("data-analytics") || "generic_click";
      const text = element.textContent?.trim() || null;
      const href = element instanceof HTMLAnchorElement ? element.href : null;
      const tagName = element.tagName.toLowerCase();

      sendAnalyticsEvent({
        session_id,
        visitor_id,
        event_type: analyticsType,
        page: pathname || "/",
        value: text || href || tagName,
        metadata: {
          tag: tagName,
          href,
          text,
        },
      });
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname]);

  return null;
}
