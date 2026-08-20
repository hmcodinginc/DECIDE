import { useLayoutEffect } from "react";
import { useLocation } from "react-router";

function scrollWindowTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.replace(/^#/, ""));
      const jump = () => document.getElementById(id)?.scrollIntoView();
      jump();
      const frame = window.requestAnimationFrame(jump);
      return () => window.cancelAnimationFrame(frame);
    }
    scrollWindowTop();
  }, [pathname, hash]);

  return null;
}

export { ScrollToTop, scrollWindowTop };
