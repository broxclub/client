import React from 'react';

export interface IRow {
  [key: string]: string;
}

export interface IColumnDefinition {
  id: string;
  caption: string;
  className?: string;
  hidden?: boolean;
  key?: boolean;
  style?: React.CSSProperties;
  renderCell?(col: IColumnDefinition, row: IRow, rowIndex: number, className: string, baseClassName: string): React.ReactNode;
  renderHeaderCell?(col: IColumnDefinition, className: string, baseClassName: string, index: number): React.ReactNode;
  renderFooterCell?(col: IColumnDefinition, className: string, baseClassName: string): React.ReactNode;
}

export type TColumnsDefinition = IColumnDefinition[];
