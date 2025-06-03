export type RowData = {
  id: string;
  [key: string]: string | number;
};

export type filterType = {
  id: string;
  operator: string;
  viewId: string;
  columnId: string;
  value: string | null;
};
