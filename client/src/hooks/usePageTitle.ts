import { useEffect } from "react";

const DEFAULT_TITLE = "DECIDE — Stop Comparing. Get a Decision.";

function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
}

export { usePageTitle };
