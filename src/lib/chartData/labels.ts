import type { NumberPoint } from "./types";

export function getGuideFormulaLabel(availableStart: number): string {
  if (availableStart === 0) {
    return "Guide y=x+1";
  }

  if (availableStart === 1) {
    return "Guide y=x";
  }

  return `Guide y=x-${availableStart - 1}`;
}

export function getPointTitle(entry: NumberPoint): string {
  return entry.hoverTitle ?? formatPointTitleEntries([entry]);
}

export function formatPointTitleEntries(entries: NumberPoint[]): string {
  const [firstEntry] = entries;

  return `${entries
    .map((entry) => `${entry.languageLabel}: ${entry.name}`)
    .join("\n")}\nValue: ${firstEntry.value}\nPosition: ${firstEntry.alphabeticalRank}`;
}
