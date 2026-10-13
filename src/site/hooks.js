// Shared hooks and helpers (no components here, so fast refresh stays happy).
import { createContext, useCallback, useContext, useEffect } from "react";

export const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
export const hasIO = () => typeof window !== "undefined" && "IntersectionObserver" in window;
export const rand = (a, b) => a + Math.random() * (b - a);
export const num = (n) => Number(n).toLocaleString("en-US");


/* ---------------- toasts ---------------- */
export const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);


/* ---------------- clipboard ---------------- */
export function useCopy() {
  const toast = useToast();
  return useCallback(
    async (text, what = "Copied", btn) => {
      let ok;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        try {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.cssText = "position:fixed;opacity:0;top:0";
          document.body.appendChild(ta);
          ta.select();
          ok = document.execCommand("copy");
          ta.remove();
        } catch {
          ok = false;
        }
      }
      toast(ok ? `${what}: ${text}` : `Copy is blocked here. Select it manually: ${text}`, ok ? "check" : "info");
      if (ok && btn) {
        btn.classList.add("is-done");
        setTimeout(() => btn.classList.remove("is-done"), 1600);
      }
    },
    [toast],
  );
}


/* ---------------- reveal on scroll (content stays visible without JS) ---------------- */
function countUp(el) {
  if (el._counted) return;
  el._counted = true;
  const to = Number(el.dataset.count);
  const pre = el.dataset.prefix || "";
  const suf = el.dataset.suffix || "";
  const fin = pre + num(to) + suf;
  if (reduceMotion() || to === 0) {
    el.textContent = fin;
    return;
  }
  let t0 = null;
  const step = (t) => {
    if (t0 === null) t0 = t;
    const k = Math.min(1, (t - t0) / 1400);
    const e = 1 - Math.pow(1 - k, 4);
    el.textContent = pre + num(Math.round(to * e)) + suf;
    if (k < 1) requestAnimationFrame(step);
    else el.textContent = fin;
  };
  requestAnimationFrame(step);
}

function reveal(el) {
  el.classList.add("is-in");
  el.querySelectorAll("[data-count]").forEach(countUp);
  if (el.hasAttribute("data-count")) countUp(el);
}

/** Watches every [data-reveal] on the page once; call after the page renders. */
export function useRevealAll(dep) {
  useEffect(() => {
    const els = [...document.querySelectorAll("[data-reveal]:not(.is-in)")];
    if (!hasIO() || reduceMotion()) {
      els.forEach(reveal);
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          reveal(e.target);
          io.unobserve(e.target);
        }),
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );
    const vh = window.innerHeight || 800;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width && r.top < vh * 0.96 && r.bottom > 0) requestAnimationFrame(() => reveal(el));
      else io.observe(el);
    });
    return () => io.disconnect();
  }, [dep]);
}

