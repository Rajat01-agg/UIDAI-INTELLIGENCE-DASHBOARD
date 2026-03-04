export const resolveChartPreset = (context: string) => {
  switch (context) {
    case "trend":
      return { defaultChart: "line", allowed: ["line", "bar"] };
    case "distribution":
      return { defaultChart: "pie", allowed: ["pie"] };
    case "comparison":
      return { defaultChart: "bar", allowed: ["bar"] };
    case "radar":
      return { defaultChart: "radar", allowed: ["radar"] };
    case "breakdown":
      return { defaultChart: "polarArea", allowed: ["polarArea", "pie"] };
    default:
      return { defaultChart: "line", allowed: ["line"] };
  }
};
