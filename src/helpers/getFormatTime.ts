export const getFormatTime = (timeStr: string): string => {
  const date = new Date(timeStr);
  return date.toLocaleDateString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
