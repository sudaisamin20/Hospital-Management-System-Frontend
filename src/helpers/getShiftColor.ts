export const getShiftColor = (shift: string) => {
  switch (shift?.toLowerCase()) {
    case "morning":
      return "bg-orange-100 text-orange-800";
    case "evening":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
