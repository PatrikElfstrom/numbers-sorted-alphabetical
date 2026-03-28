import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import type { AppOptions } from "../app/types";
import {
  type ChartData,
  type PlotLayout,
  type PointRendering,
  type VisibleLanguageSeries,
} from "../lib/chartData";
import { createLanguageSeriesPlot, mountPlot } from "../lib/plotBuilders";
import { getPlotPanelViewModel } from "../lib/plotPanel";
import { usePlotLayers } from "../hooks/usePlotLayers";
import "./PlotPanel.css";

type PlotPanelProps = {
  chartData: ChartData;
  options: AppOptions;
  plotRangeRef: (node: HTMLDivElement | null) => void;
  plotSize: number;
  setVisibleRankRangeEnd: (end: number) => void;
  setVisibleRankRangeStart: (start: number) => void;
  setVisibleValueRangeEnd: (end: number) => void;
  setVisibleValueRangeStart: (start: number) => void;
  visibleLanguageSeries: VisibleLanguageSeries[];
};

const plotSeriesTransition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
} as const;

type PlotLanguageLayerProps = {
  chartData: ChartData;
  layout: PlotLayout;
  plotSize: number;
  pointRendering: PointRendering;
  transition: typeof plotSeriesTransition | { duration: number };
  visibleLanguageSeries: VisibleLanguageSeries[];
};

function PlotLanguageLayer({
  chartData,
  layout,
  plotSize,
  pointRendering,
  transition,
  visibleLanguageSeries,
}: PlotLanguageLayerProps) {
  const overlayPlotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!overlayPlotRef.current) {
      return;
    }

    return mountPlot(
      overlayPlotRef.current,
      createLanguageSeriesPlot({
        chartData,
        layout,
        plotSize,
        pointRendering,
        visibleLanguageSeries,
      }),
    );
  }, [chartData, layout, plotSize, pointRendering, visibleLanguageSeries]);

  return (
    <motion.div
      animate={{
        filter: "blur(0px)",
        opacity: 1,
      }}
      className="plot-layer plot-layer--overlay plot-layer--overlay-series"
      exit={{
        filter: "blur(3px)",
        opacity: 0,
      }}
      initial={{
        filter: "blur(4px)",
        opacity: 0,
      }}
      ref={overlayPlotRef}
      transition={transition}
    />
  );
}

function buildVisibleSeriesKey(visibleLanguageSeries: VisibleLanguageSeries[]): string {
  return visibleLanguageSeries.map((series) => series.languageId).join("|");
}

export function PlotPanel({
  chartData,
  options,
  plotRangeRef,
  plotSize,
  setVisibleRankRangeEnd,
  setVisibleRankRangeStart,
  setVisibleValueRangeEnd,
  setVisibleValueRangeStart,
  visibleLanguageSeries,
}: PlotPanelProps) {
  const prefersReducedMotion = useReducedMotion();
  const viewModel = useMemo(
    () => getPlotPanelViewModel(options, plotSize),
    [options, plotSize],
  );
  const { basePlotRef, equalityPlotRef } = usePlotLayers({
    chartData,
    layout: viewModel.layout,
    plotSize,
    showEqualityLine: options.showEqualityLine,
  });
  const seriesTransition = prefersReducedMotion
    ? { duration: 0 }
    : plotSeriesTransition;
  const visibleSeriesKey = useMemo(
    () => buildVisibleSeriesKey(visibleLanguageSeries),
    [visibleLanguageSeries],
  );

  return (
    <div className="plot-shell">
      <div
        className={
          options.showRangeSliders
            ? "plot-matrix"
            : "plot-matrix plot-matrix--without-sliders"
        }
      >
        {options.showRangeSliders ? (
          <div className="plot-y-range-shell">
            <div className="plot-y-range__rail" style={viewModel.yRailStyle}>
              <div className="plot-y-range__labels" aria-hidden="true">
                <span>{viewModel.availableCount}</span>
                <span>
                  {viewModel.visibleRankCount} / {viewModel.availableCount}
                </span>
                <span>1</span>
              </div>

              <div className="range-slider range-slider--vertical">
                <div
                  className="range-slider__track range-slider__track--vertical"
                  style={viewModel.yTrackStyle}
                />
                <input
                  aria-label="Visible rank start"
                  className="range-slider__input range-slider__input--vertical"
                  max={viewModel.availableCount}
                  min={1}
                  onChange={(event) => {
                    setVisibleRankRangeStart(Number(event.target.value));
                  }}
                  type="range"
                  value={options.visibleRankRange.start}
                />
                <input
                  aria-label="Visible rank end"
                  className="range-slider__input range-slider__input--vertical"
                  max={viewModel.availableCount}
                  min={1}
                  onChange={(event) => {
                    setVisibleRankRangeEnd(Number(event.target.value));
                  }}
                  type="range"
                  value={options.visibleRankRange.end}
                />
              </div>
            </div>
          </div>
        ) : null}

        <div className="plot-frame" style={viewModel.plotFrameStyle}>
          <div className="plot-canvas">
            <div className="plot-grid" style={viewModel.plotGridStyle}>
              <svg
                aria-hidden="true"
                className="plot-grid__svg"
                viewBox={`0 0 ${viewModel.layout.plotAreaSize} ${viewModel.layout.plotAreaSize}`}
              >
                <path className="plot-grid__path" d={viewModel.plotGridPath} />
              </svg>
            </div>
            <div className="plot-layer plot-layer--base" ref={basePlotRef} />
            <div className="plot-layer plot-layer--overlay" ref={equalityPlotRef} />
            <AnimatePresence initial={false}>
              {visibleLanguageSeries.length > 0 ? (
                <PlotLanguageLayer
                  chartData={chartData}
                  key={visibleSeriesKey}
                  layout={viewModel.layout}
                  plotSize={plotSize}
                  pointRendering={viewModel.pointRendering}
                  transition={seriesTransition}
                  visibleLanguageSeries={visibleLanguageSeries}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {options.showRangeSliders ? (
          <div className="plot-range-row" ref={plotRangeRef} style={viewModel.plotRangeStyle}>
            <div className="plot-range-shell" style={viewModel.plotRangeShellStyle}>
              <div className="range-slider" aria-label="Visible value range">
                <div className="range-slider__track" style={viewModel.valueTrackStyle} />
                <input
                  aria-label="Visible value start"
                  className="range-slider__input"
                  max={options.availableRange.end}
                  min={options.availableRange.start}
                  onChange={(event) => {
                    setVisibleValueRangeStart(Number(event.target.value));
                  }}
                  type="range"
                  value={options.visibleValueRange.start}
                />
                <input
                  aria-label="Visible value end"
                  className="range-slider__input"
                  max={options.availableRange.end}
                  min={options.availableRange.start}
                  onChange={(event) => {
                    setVisibleValueRangeEnd(Number(event.target.value));
                  }}
                  type="range"
                  value={options.visibleValueRange.end}
                />
              </div>

              <div className="plot-range__footer">
                <span>{options.availableRange.start}</span>
                <span>
                  {viewModel.visibleCount} / {viewModel.availableCount} visible
                </span>
                <span>{options.availableRange.end}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
