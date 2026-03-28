import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type CSSProperties, useMemo } from "react";
import type { AppOptions, NumberRange, PointDisplayMode } from "../app/types";
import { maxAvailableValue, minAvailableStart } from "../lib/appOptions";
import { getGuideFormulaLabel, type LanguageSeries } from "../lib/chartData";
import {
  getAvailableRangeFromEndInput,
  getAvailableRangeFromStartInput,
  getLanguageOptions,
  getLanguageRemovalLabel,
  getLanguageVisibilityLabel,
  removeSelectedLanguage,
} from "../lib/controlsPanel";
import { type LanguageId } from "../numberLanguages";
import { MultiSelectCombobox } from "./ui/MultiSelectCombobox";

const pointDisplayModeOptions: Array<{
  label: string;
  value: PointDisplayMode;
}> = [
  { label: "Auto", value: "auto" },
  { label: "Cells", value: "cells" },
  { label: "Squares", value: "squares" },
];

const panelTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
} as const;

const panelExitTransition = {
  duration: 0.16,
  ease: [0.4, 0, 1, 1],
} as const;

const sectionTransition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
} as const;

const segmentedControlTransition = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1],
} as const;

const legendItemTransition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1],
} as const;

type ControlsPanelContentProps = {
  controlsBodyId: string;
  floatingRef: (node: HTMLElement | null) => void;
  floatingStyle: CSSProperties;
  languageSeries: LanguageSeries[];
  options: AppOptions;
  panelAlignment: "left" | "right";
  selectedLanguageColorById: Map<LanguageId, string>;
  setPointDisplayMode: (pointDisplayMode: PointDisplayMode) => void;
  setSelectedLanguageIds: (selectedLanguageIds: LanguageId[]) => void;
  setShowEqualityLine: (showEqualityLine: boolean) => void;
  setShowRangeSliders: (showRangeSliders: boolean) => void;
  toggleHiddenLanguageId: (languageId: LanguageId) => void;
  updateAvailableRange: (availableRange: NumberRange) => void;
};

export function ControlsPanelContent({
  controlsBodyId,
  floatingRef,
  floatingStyle,
  languageSeries,
  options,
  panelAlignment,
  selectedLanguageColorById,
  setPointDisplayMode,
  setSelectedLanguageIds,
  setShowEqualityLine,
  setShowRangeSliders,
  toggleHiddenLanguageId,
  updateAvailableRange,
}: ControlsPanelContentProps) {
  const prefersReducedMotion = useReducedMotion();
  const languageOptions = useMemo(
    () => getLanguageOptions(selectedLanguageColorById),
    [selectedLanguageColorById],
  );
  const displayLabelId = `${controlsBodyId}-display`;
  const hiddenLanguageIdSet = useMemo(
    () => new Set(options.hiddenLanguageIds),
    [options.hiddenLanguageIds],
  );
  const guideFormulaLabel = getGuideFormulaLabel(options.availableRange.start);
  const activePointDisplayModeIndex = pointDisplayModeOptions.findIndex(
    (option) => option.value === options.pointDisplayMode,
  );
  const panelMotion = prefersReducedMotion
    ? {
        animate: { opacity: 1 },
        exit: {
          opacity: 0,
          transition: panelExitTransition,
        },
        initial: { opacity: 0 },
      }
    : {
        animate: {
          filter: "blur(0px)",
          opacity: 1,
          scale: 1,
          y: 0,
        },
        exit: {
          filter: "blur(8px)",
          opacity: 0,
          scale: 0.98,
          transition: panelExitTransition,
          y: -10,
        },
        initial: {
          filter: "blur(10px)",
          opacity: 0,
          scale: 0.965,
          y: -14,
        },
      };
  const sectionMotion = prefersReducedMotion
    ? {
        animate: { opacity: 1 },
        initial: { opacity: 1 },
      }
    : {
        animate: { opacity: 1, y: 0 },
        initial: { opacity: 0, y: 8 },
      };

  return (
    <div
      className="controls-shell__floating-layer"
      ref={floatingRef}
      style={floatingStyle}
    >
      <motion.section
        animate={panelMotion.animate}
        className={
          panelAlignment === "right"
            ? "controls-shell controls-shell--floating controls-shell--align-right"
            : "controls-shell controls-shell--floating controls-shell--align-left"
        }
        exit={panelMotion.exit}
        id={controlsBodyId}
        initial={panelMotion.initial}
        transition={panelTransition}
      >
        <motion.span
          animate={sectionMotion.animate}
          className="controls-shell__eyebrow"
          initial={sectionMotion.initial}
          transition={sectionTransition}
        >
          Controls
        </motion.span>

        <div className="controls-shell__body">
          <motion.div
            animate={sectionMotion.animate}
            className="controls-shell__top"
            initial={sectionMotion.initial}
            transition={sectionTransition}
          >
            <section
              aria-labelledby={`${controlsBodyId}-range`}
              className="controls-card"
            >
              <span className="controls-card__title" id={`${controlsBodyId}-range`}>
                Range
              </span>
              <div className="controls-card__grid controls-card__grid--range">
                <label className="number-group number-group--from">
                  <span>From</span>
                  <input
                    className="number-input"
                    max={maxAvailableValue}
                    min={minAvailableStart}
                    onChange={(event) => {
                      updateAvailableRange(
                        getAvailableRangeFromStartInput(
                          event.target.value,
                          options.availableRange.end,
                        ),
                      );
                    }}
                    type="number"
                    value={options.availableRange.start}
                  />
                </label>

                <label className="number-group number-group--to">
                  <span>To</span>
                  <input
                    className="number-input"
                    max={maxAvailableValue}
                    min={minAvailableStart}
                    onChange={(event) => {
                      updateAvailableRange(
                        getAvailableRangeFromEndInput(
                          event.target.value,
                          options.availableRange.start,
                        ),
                      );
                    }}
                    type="number"
                    value={options.availableRange.end}
                  />
                </label>

                <label className="number-group number-group--toggle-row">
                  <span>Range sliders</span>
                  <span className="toggle-switch">
                    <input
                      checked={options.showRangeSliders}
                      className="toggle-switch__input"
                      onChange={(event) => {
                        setShowRangeSliders(event.target.checked);
                      }}
                      type="checkbox"
                    />
                    <span className="toggle-switch__control" aria-hidden="true">
                      <span className="toggle-switch__thumb" />
                    </span>
                  </span>
                </label>
              </div>
            </section>

            <section
              aria-labelledby={`${controlsBodyId}-view`}
              className="controls-card"
            >
              <span className="controls-card__title" id={`${controlsBodyId}-view`}>
                View
              </span>
              <div className="controls-card__grid controls-card__grid--view">
                <div className="number-group number-group--display">
                  <span id={displayLabelId}>Display</span>
                  <div
                    aria-labelledby={displayLabelId}
                    className="segmented-control"
                    role="radiogroup"
                  >
                    <motion.span
                      animate={{
                        left: `calc(var(--segmented-control-padding) + ${Math.max(
                          0,
                          activePointDisplayModeIndex,
                        )} * (var(--segmented-control-pill-width) + var(--segmented-control-gap)))`,
                      }}
                      aria-hidden="true"
                      className="segmented-control__active-pill"
                      initial={false}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : segmentedControlTransition
                      }
                    />
                    {pointDisplayModeOptions.map((option) => {
                      const isActive = option.value === options.pointDisplayMode;

                      return (
                        <button
                          aria-checked={isActive}
                          className={
                            isActive
                              ? "segmented-control__button segmented-control__button--active"
                              : "segmented-control__button"
                          }
                          key={option.value}
                          onClick={() => {
                            setPointDisplayMode(option.value);
                          }}
                          role="radio"
                          type="button"
                        >
                          <span className="segmented-control__label">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="number-group number-group--toggle-row">
                  <span>{guideFormulaLabel}</span>
                  <span className="toggle-switch">
                    <input
                      checked={options.showEqualityLine}
                      className="toggle-switch__input"
                      onChange={(event) => {
                        setShowEqualityLine(event.target.checked);
                      }}
                      type="checkbox"
                    />
                    <span className="toggle-switch__control" aria-hidden="true">
                      <span className="toggle-switch__thumb" />
                    </span>
                  </span>
                </label>
              </div>
            </section>
          </motion.div>

          <motion.section
            animate={sectionMotion.animate}
            aria-labelledby={`${controlsBodyId}-language`}
            className="controls-card"
            initial={sectionMotion.initial}
            transition={{
              ...sectionTransition,
              delay: prefersReducedMotion ? 0 : 0.03,
            }}
          >
            <div className="controls-card__header">
              <span className="controls-card__title" id={`${controlsBodyId}-language`}>
                Language
              </span>
            </div>
            <div className="number-group number-group--language">
              <MultiSelectCombobox
                emptyText="No languages match your search."
                onValueChange={(nextValues) => {
                  setSelectedLanguageIds(nextValues as LanguageId[]);
                }}
                options={languageOptions}
                placeholder="Choose one or more languages"
                searchPlaceholder="Search languages..."
                selectAllLabel="Select all languages"
                value={options.selectedLanguageIds}
              />
            </div>
            <div className="language-legend" aria-label="Selected language overlays">
              <AnimatePresence initial={false}>
                {languageSeries.map((series) => {
                  const isHidden = hiddenLanguageIdSet.has(series.languageId);

                  return (
                    <motion.div
                      animate={
                        isHidden
                          ? {
                              filter: "saturate(0.55)",
                              opacity: 0.5,
                              scale: 0.97,
                            }
                          : {
                              filter: "saturate(1)",
                              opacity: 1,
                              scale: 1,
                            }
                      }
                      className={
                        isHidden
                          ? "language-legend__item language-legend__item--hidden"
                          : "language-legend__item"
                      }
                      exit={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : {
                              opacity: 0,
                              scale: 0.92,
                              y: -6,
                            }
                      }
                      initial={
                        prefersReducedMotion
                          ? { opacity: 1 }
                          : {
                              opacity: 0,
                              scale: 0.92,
                              y: -6,
                            }
                      }
                      key={series.languageId}
                      style={{ "--language-color": series.color } as CSSProperties}
                      transition={
                        prefersReducedMotion ? { duration: 0 } : legendItemTransition
                      }
                    >
                      <button
                        aria-label={getLanguageVisibilityLabel(
                          isHidden,
                          series.languageLabel,
                        )}
                        aria-pressed={!isHidden}
                        className="language-legend__toggle"
                        onClick={() => {
                          toggleHiddenLanguageId(series.languageId);
                        }}
                        type="button"
                      >
                        <span aria-hidden="true" className="language-legend__swatch" />
                        <span className="language-legend__label">
                          {series.languageLabel}
                        </span>
                      </button>
                      <button
                        aria-label={getLanguageRemovalLabel(series.languageLabel)}
                        className="language-legend__remove"
                        onClick={() => {
                          setSelectedLanguageIds(
                            removeSelectedLanguage(
                              options.selectedLanguageIds,
                              series.languageId,
                            ),
                          );
                        }}
                        type="button"
                      >
                        x
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>
      </motion.section>
    </div>
  );
}
