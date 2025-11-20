
import { useState, useEffect, useCallback } from 'react';

interface MasonryItem {
  id: string;
  col: number;
  height?: number;
}

interface MasonryLayoutResult {
  columns: MasonryItem[][];
  getItemColumn: (item: MasonryItem) => number;
  recalculate: () => void;
}

/**
 * Hook para crear un layout tipo masonry que adapta el contenido dinámicamente
 * @param items Array de elementos con id y col
 * @param maxColumns Número máximo de columnas
 * @returns Layout masonry con columnas balanceadas
 */
export const useMasonryLayout = (
  items: MasonryItem[],
  maxColumns: number = 12
): MasonryLayoutResult => {
  const [columns, setColumns] = useState<MasonryItem[][]>([]);
  
  const calculateLayout = useCallback(() => {
    if (items.length === 0) {
      setColumns([]);
      return;
    }

    // Crear columnas basadas en el ancho de cada elemento
    const newColumns: MasonryItem[][] = [];
    let currentColumn: MasonryItem[] = [];
    let currentColumnWidth = 0;

    for (const item of items) {
      // Si agregar este item excede el ancho máximo, crear nueva columna
      if (currentColumnWidth + item.col > maxColumns && currentColumn.length > 0) {
        newColumns.push([...currentColumn]);
        currentColumn = [item];
        currentColumnWidth = item.col;
      } else {
        currentColumn.push(item);
        currentColumnWidth += item.col;
      }
    }

    // Agregar la última columna si tiene elementos
    if (currentColumn.length > 0) {
      newColumns.push(currentColumn);
    }

    setColumns(newColumns);
  }, [items, maxColumns]);

  const getItemColumn = useCallback((item: MasonryItem): number => {
    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      if (columns[colIndex].some(colItem => colItem.id === item.id)) {
        return colIndex;
      }
    }
    return 0;
  }, [columns]);

  const recalculate = useCallback(() => {
    calculateLayout();
  }, [calculateLayout]);

  useEffect(() => {
    calculateLayout();
  }, [calculateLayout]);

  return {
    columns,
    getItemColumn,
    recalculate
  };
};
