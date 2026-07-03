"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SESSION_KEY = "analytics-session-id";
const VISITOR_KEY = "analytics-visitor-id";

const EXCLUDED_PAGE_VIEW_PATHS = ["/", "/portfolio", "/portfolio/", "/packages", "/testimonials", "/admin", "/admin/", "/schedule"];

function isExcludedPageView(page: string) {
  return EXCLUDED_PAGE_VIEW_PATHS.some((excluded) =>
    excluded.endsWith("/") ? page.startsWith(excluded) : page === excluded
  );
}

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

export async function sendAnalyticsEvent(payload: {
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
  // Opt-in only: hanya elemen yang sengaja ditandai data-analytics yang di-track.
  // Ini menghindari noise dari nav link, tombol UI umum, form field, dsb.
  return target.closest("[data-analytics]") as HTMLElement | null;
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const search =
  typeof window !== "undefined" ? window.location.search : "";

  useEffect(() => {
    const page = pathname || "/";
    if (isExcludedPageView(page)) return;

    const session_id = getSessionId();
    const visitor_id = getVisitorId();

    sendAnalyticsEvent({
      session_id,
      visitor_id,
      event_type: "page_view",
      page,
      metadata: {
        search,
        title: document.title,
        }
    });
  }, [pathname]);

  useEffect(() => {
    const session_id = getSessionId();
    const visitor_id = getVisitorId();

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const element = normalizeTarget(target);
      if (!element) return;

      // Skip elements that already have their own dedicated tracking
      // (e.g. everything inside the FloatingChat widget is tracked via /api/assistant instead).
      if (element.closest("[data-analytics-ignore]")) return;

      const analyticsType = element.getAttribute("data-analytics")!; // guaranteed by normalizeTarget
      const explicitValue = element.getAttribute("data-analytics-value");
      const packageId = element.getAttribute("data-analytics-package-id") || null;
      const pageOverride = element.getAttribute("data-analytics-page");
      const text = element.textContent?.trim() || null;
      const href = element instanceof HTMLAnchorElement ? element.href : null;
      const tagName = element.tagName.toLowerCase();

      // Prefer explicit clean value (data-analytics-value) over raw textContent,
      // which can end up being a jumble of concatenated child text (title + description, etc).
      const label = explicitValue || text || href;
      if (!label) return;

      sendAnalyticsEvent({
        session_id,
        visitor_id,
        event_type: analyticsType,
        page: pageOverride || pathname || "/",
        package_id: packageId,
        value: label,
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