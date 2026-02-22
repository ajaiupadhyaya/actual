declare module "react-grid-layout" {
  import type { ComponentType, ReactNode } from "react";

  export type Layout = {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
  };

  export type Layouts = {
    [key: string]: Layout[];
  };

  export type ResponsiveProps = {
    className?: string;
    layouts?: Layouts;
    breakpoints?: Record<string, number>;
    cols?: Record<string, number>;
    rowHeight?: number;
    isDraggable?: boolean;
    isResizable?: boolean;
    compactType?: "vertical" | "horizontal" | null;
    preventCollision?: boolean;
    margin?: [number, number];
    draggableHandle?: string;
    children?: ReactNode;
    onLayoutChange?: (layout: Layout[], layouts: Layouts) => void;
  };

  export const Responsive: ComponentType<ResponsiveProps>;
  export function WidthProvider<T>(component: T): T;
}
