import { useEffect, useRef } from "react";
import {
  createBasePlot,
  createEqualityPlot,
  mountPlot,
} from "../lib/plotBuilders";
import type {
  ChartData,
  PlotLayout,
} from "../lib/chartData";

type UsePlotLayersOptions = {
  chartData: ChartData;
  layout: PlotLayout;
  plotSize: number;
  showEqualityLine: boolean;
};

export function usePlotLayers({
  chartData,
  layout,
  plotSize,
  showEqualityLine,
}: UsePlotLayersOptions) {
  const basePlotRef = useRef<HTMLDivElement | null>(null);
  const equalityPlotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!basePlotRef.current) {
      return;
    }

    return mountPlot(
      basePlotRef.current,
      createBasePlot({
        chartData,
        layout,
        plotSize,
      }),
    );
  }, [chartData, layout, plotSize]);

  useEffect(() => {
    if (!equalityPlotRef.current) {
      return;
    }

    return mountPlot(
      equalityPlotRef.current,
      createEqualityPlot({
        chartData,
        layout,
        plotSize,
        showEqualityLine,
      }),
    );
  }, [chartData, layout, plotSize, showEqualityLine]);

  return {
    basePlotRef,
    equalityPlotRef,
  };
}
