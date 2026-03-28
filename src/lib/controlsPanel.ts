import type { NumberRange } from "../app/types";
import {
  clampNumber,
  maxAvailableValue,
  minAvailableStart,
} from "./appOptions";
import { numberLanguages, type LanguageId } from "../numberLanguages";

type LanguageOption = {
  color?: string;
  label: string;
  value: LanguageId;
};

export function getLanguageOptions(
  selectedLanguageColorById: Map<LanguageId, string>,
): LanguageOption[] {
  return numberLanguages.map((language) => ({
    color: selectedLanguageColorById.get(language.id),
    label: language.label,
    value: language.id,
  }));
}

export function getAvailableRangeFromStartInput(
  inputValue: string,
  currentEnd: number,
): NumberRange {
  const start = clampNumber(
    Number(inputValue || 0),
    minAvailableStart,
    maxAvailableValue,
  );

  return {
    start,
    end: Math.max(start, currentEnd),
  };
}

export function getAvailableRangeFromEndInput(
  inputValue: string,
  currentStart: number,
): NumberRange {
  const end = clampNumber(
    Number(inputValue || 0),
    minAvailableStart,
    maxAvailableValue,
  );

  return {
    start: Math.min(currentStart, end),
    end,
  };
}

export function getLanguageRemovalLabel(languageLabel: string): string {
  return `Remove ${languageLabel}`;
}

export function getLanguageVisibilityLabel(
  isHidden: boolean,
  languageLabel: string,
): string {
  return isHidden
    ? `Show ${languageLabel} on graph`
    : `Hide ${languageLabel} from graph`;
}

export function removeSelectedLanguage(
  selectedLanguageIds: LanguageId[],
  languageIdToRemove: LanguageId,
): LanguageId[] {
  return selectedLanguageIds.filter(
    (languageId) => languageId !== languageIdToRemove,
  );
}
