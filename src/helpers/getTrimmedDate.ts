export const getTrimmedDate = (dateStr: string) => {
  const trimmedDate = dateStr.split("T")[0];
  return trimmedDate;
};
