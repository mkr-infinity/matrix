export type Matrix = number[][];

export function createEmptyMatrix(rows: number, cols: number): Matrix {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

export function addMatrices(a: Matrix, b: Matrix): { result: Matrix; steps: string[] } {
  const rows = a.length;
  const cols = a[0].length;
  const result = createEmptyMatrix(rows, cols);
  const steps: string[] = ['Addition: A + B', `Each element: result[i][j] = A[i][j] + B[i][j]`, ''];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i][j] = a[i][j] + b[i][j];
      steps.push(`[${i + 1},${j + 1}]: ${a[i][j]} + ${b[i][j]} = ${result[i][j]}`);
    }
  }
  return { result, steps };
}

export function subtractMatrices(a: Matrix, b: Matrix): { result: Matrix; steps: string[] } {
  const rows = a.length;
  const cols = a[0].length;
  const result = createEmptyMatrix(rows, cols);
  const steps: string[] = ['Subtraction: A - B', `Each element: result[i][j] = A[i][j] - B[i][j]`, ''];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i][j] = a[i][j] - b[i][j];
      steps.push(`[${i + 1},${j + 1}]: ${a[i][j]} - ${b[i][j]} = ${result[i][j]}`);
    }
  }
  return { result, steps };
}

export function multiplyMatrices(a: Matrix, b: Matrix): { result: Matrix; steps: string[] } {
  const rowsA = a.length;
  const colsA = a[0].length;
  const colsB = b[0].length;
  const result = createEmptyMatrix(rowsA, colsB);
  const steps: string[] = [
    'Multiplication: A x B',
    `A (${rowsA}x${colsA}) x B (${colsA}x${colsB}) = Result (${rowsA}x${colsB})`,
    `result[i][j] = sum of A[i][k] * B[k][j] for k=1..${colsA}`,
    '',
  ];

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      const parts: string[] = [];
      for (let k = 0; k < colsA; k++) {
        sum += a[i][k] * b[k][j];
        parts.push(`${a[i][k]}*${b[k][j]}`);
      }
      result[i][j] = Math.round(sum * 1e10) / 1e10;
      steps.push(`[${i + 1},${j + 1}]: ${parts.join(' + ')} = ${result[i][j]}`);
    }
  }
  return { result, steps };
}

export function transposeMatrix(a: Matrix): { result: Matrix; steps: string[] } {
  const rows = a.length;
  const cols = a[0].length;
  const result = createEmptyMatrix(cols, rows);
  const steps: string[] = [
    'Transpose: A^T',
    `Original: ${rows}x${cols} -> Transposed: ${cols}x${rows}`,
    'Rows become columns and columns become rows',
    '',
  ];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = a[i][j];
      steps.push(`A^T[${j + 1},${i + 1}] = A[${i + 1},${j + 1}] = ${a[i][j]}`);
    }
  }
  return { result, steps };
}

function getMinor(m: Matrix, row: number, col: number): Matrix {
  return m
    .filter((_, i) => i !== row)
    .map((r) => r.filter((_, j) => j !== col));
}

export function determinant(m: Matrix, steps: string[] = [], depth: number = 0): number {
  const n = m.length;
  const indent = '  '.repeat(depth);

  if (n === 1) {
    steps.push(`${indent}det([${m[0][0]}]) = ${m[0][0]}`);
    return m[0][0];
  }

  if (n === 2) {
    const det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
    steps.push(`${indent}det = ${m[0][0]}*${m[1][1]} - ${m[0][1]}*${m[1][0]} = ${det}`);
    return det;
  }

  let det = 0;
  const parts: string[] = [];

  for (let j = 0; j < n; j++) {
    const minor = getMinor(m, 0, j);
    const cofactor = Math.pow(-1, j) * m[0][j];
    const sign = j % 2 === 0 ? '+' : '-';
    steps.push(`${indent}Cofactor C(1,${j + 1}): ${sign}${Math.abs(m[0][j])} * det(Minor)`);
    const minorDet = determinant(minor, steps, depth + 1);
    const term = cofactor * minorDet;
    det += term;
    parts.push(`${sign === '+' ? '' : '-'}${Math.abs(m[0][j])}*${minorDet}`);
  }

  det = Math.round(det * 1e10) / 1e10;
  steps.push(`${indent}= ${parts.join(' + ')} = ${det}`);
  return det;
}

export function calculateDeterminant(m: Matrix): { result: number; steps: string[] } {
  const steps: string[] = [`Determinant of ${m.length}x${m.length} matrix`, 'Using cofactor expansion along first row', ''];
  const result = determinant(m, steps);
  steps.push('', `Final Determinant = ${result}`);
  return { result, steps };
}

export function invertMatrix(m: Matrix): { result: Matrix | null; steps: string[] } {
  const n = m.length;
  const steps: string[] = [`Inverse of ${n}x${n} matrix`, ''];

  const detSteps: string[] = [];
  const det = determinant(m, detSteps);
  steps.push('Step 1: Calculate Determinant');
  steps.push(...detSteps);
  steps.push(`Determinant = ${det}`, '');

  if (Math.abs(det) < 1e-10) {
    steps.push('Matrix is SINGULAR (det = 0). Inverse does not exist.');
    return { result: null, steps };
  }

  if (n === 1) {
    const result = [[1 / det]];
    steps.push(`Inverse = 1/${det} = ${result[0][0]}`);
    return { result, steps };
  }

  if (n === 2) {
    steps.push('Step 2: For 2x2 matrix, inverse = (1/det) * adj(A)');
    steps.push(`adj(A) = [[${m[1][1]}, ${-m[0][1]}], [${-m[1][0]}, ${m[0][0]}]]`);
    const result = [
      [m[1][1] / det, -m[0][1] / det],
      [-m[1][0] / det, m[0][0] / det],
    ].map(row => row.map(v => Math.round(v * 1e10) / 1e10));
    steps.push(`Inverse = (1/${det}) * adj(A)`);
    return { result, steps };
  }

  steps.push('Step 2: Calculate Cofactor Matrix');
  const cofactorMatrix = createEmptyMatrix(n, n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const minor = getMinor(m, i, j);
      const minorDet = determinant(minor, []);
      cofactorMatrix[i][j] = Math.pow(-1, i + j) * minorDet;
      steps.push(`C(${i + 1},${j + 1}) = ${Math.pow(-1, i + j) > 0 ? '+' : '-'}det(Minor) = ${cofactorMatrix[i][j]}`);
    }
  }

  steps.push('', 'Step 3: Transpose cofactor matrix to get Adjugate');
  const adjugate = createEmptyMatrix(n, n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      adjugate[j][i] = cofactorMatrix[i][j];
    }
  }

  steps.push('', 'Step 4: Inverse = (1/det) * Adjugate');
  const result = createEmptyMatrix(n, n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[i][j] = Math.round((adjugate[i][j] / det) * 1e10) / 1e10;
    }
  }

  return { result, steps };
}

export function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  const rounded = Math.round(n * 10000) / 10000;
  return rounded.toString();
}
