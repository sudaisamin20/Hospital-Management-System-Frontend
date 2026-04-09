import { useState } from "react";

export const useBadge = (key: string) => {
  const countKey = `${key}_count`;
  const flagKey = `${key}_new`;

  const [count, setCount] = useState(() => {
    const stored = localStorage.getItem(countKey);
    return stored ? parseInt(stored) : 0;
  });

  const [hasNew, setHasNew] = useState(() => {
    return localStorage.getItem(flagKey) === "true";
  });

  const addNew = (num: number = 1) => {
    setCount((prev) => {
      const updated = prev + num;
      localStorage.setItem(countKey, updated.toString());
      localStorage.setItem(flagKey, "true");
      return updated;
    });
    setHasNew(true);
  };

  // ✅ when user opens page
  const markAsViewed = () => {
    localStorage.removeItem(countKey);
    localStorage.removeItem(flagKey);

    setCount(0);
    setHasNew(false);
  };

  return {
    count,
    hasNew,
    addNew,
    markAsViewed,
  };
};
