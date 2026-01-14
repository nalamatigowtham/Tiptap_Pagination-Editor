
export interface PageMetrics {
  width: number; // in pixels
  height: number; // in pixels
  margin: number; // in pixels
  pxPerInch: number;
}

export interface DocumentState {
  totalPages: number;
  currentPage: number;
}
