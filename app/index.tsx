import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { useTheme } from '@/lib/ThemeContext';
import {
  Matrix,
  createEmptyMatrix,
  addMatrices,
  subtractMatrices,
  multiplyMatrices,
  transposeMatrix,
  calculateDeterminant,
  invertMatrix,
  formatNumber,
} from '@/lib/matrix-operations';
import { addHistory } from '@/lib/history';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type MatrixMode = '1' | '2';
type Operation = 'add' | 'sub' | 'mul' | 'transpose' | 'det' | 'inverse';

export default function MatrixScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const [mode, setMode] = useState<MatrixMode>('1');
  const [rowsA, setRowsA] = useState(3);
  const [colsA, setColsA] = useState(3);
  const [rowsB, setRowsB] = useState(3);
  const [colsB, setColsB] = useState(3);
  const [matrixA, setMatrixA] = useState<Matrix>(createEmptyMatrix(3, 3));
  const [matrixB, setMatrixB] = useState<Matrix>(createEmptyMatrix(3, 3));
  const [result, setResult] = useState<Matrix | number | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [lastOp, setLastOp] = useState<string>('');
  const [showMenu, setShowMenu] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const updateMatrixA = useCallback((r: number, c: number, val: string) => {
    setMatrixA(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = val === '' || val === '-' ? 0 : parseFloat(val) || 0;
      return next;
    });
  }, []);

  const updateMatrixB = useCallback((r: number, c: number, val: string) => {
    setMatrixB(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = val === '' || val === '-' ? 0 : parseFloat(val) || 0;
      return next;
    });
  }, []);

  const resizeMatrix = (
    matrix: Matrix,
    newRows: number,
    newCols: number
  ): Matrix => {
    const result = createEmptyMatrix(newRows, newCols);
    for (let i = 0; i < Math.min(matrix.length, newRows); i++) {
      for (let j = 0; j < Math.min(matrix[0]?.length || 0, newCols); j++) {
        result[i][j] = matrix[i][j];
      }
    }
    return result;
  };

  const changeSizeA = (r: number, c: number) => {
    setRowsA(r);
    setColsA(c);
    setMatrixA(prev => resizeMatrix(prev, r, c));
    setResult(null);
  };

  const changeSizeB = (r: number, c: number) => {
    setRowsB(r);
    setColsB(c);
    setMatrixB(prev => resizeMatrix(prev, r, c));
    setResult(null);
  };

  const showError = (msg: string) => {
    if (Platform.OS === 'web') {
      alert(msg);
    } else {
      Alert.alert('Error', msg);
    }
  };

  const performOperation = async (op: Operation) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      let res: { result: Matrix | number | null; steps: string[] };
      let opName = '';

      switch (op) {
        case 'add':
          if (rowsA !== rowsB || colsA !== colsB) {
            showError('Matrices must have the same dimensions for addition');
            return;
          }
          res = addMatrices(matrixA, matrixB);
          opName = 'Addition';
          break;
        case 'sub':
          if (rowsA !== rowsB || colsA !== colsB) {
            showError('Matrices must have the same dimensions for subtraction');
            return;
          }
          res = subtractMatrices(matrixA, matrixB);
          opName = 'Subtraction';
          break;
        case 'mul':
          if (colsA !== rowsB) {
            showError(`Cannot multiply: A columns (${colsA}) must equal B rows (${rowsB})`);
            return;
          }
          res = multiplyMatrices(matrixA, matrixB);
          opName = 'Multiplication';
          break;
        case 'transpose':
          res = transposeMatrix(matrixA);
          opName = 'Transpose';
          break;
        case 'det':
          if (rowsA !== colsA) {
            showError('Matrix must be square for determinant');
            return;
          }
          const detRes = calculateDeterminant(matrixA);
          res = { result: detRes.result, steps: detRes.steps };
          opName = 'Determinant';
          break;
        case 'inverse':
          if (rowsA !== colsA) {
            showError('Matrix must be square for inverse');
            return;
          }
          const invRes = invertMatrix(matrixA);
          if (invRes.result === null) {
            setSteps(invRes.steps);
            setResult(null);
            setLastOp('Inverse (Singular)');
            setShowSteps(true);
            showError('Matrix is singular - inverse does not exist');
            return;
          }
          res = { result: invRes.result, steps: invRes.steps };
          opName = 'Inverse';
          break;
        default:
          return;
      }

      setResult(res.result);
      setSteps(res.steps);
      setLastOp(opName);
      setShowSteps(false);

      await addHistory({
        matrixA,
        matrixB: mode === '2' ? matrixB : null,
        operation: opName,
        result: res.result,
        rowsA,
        colsA,
        rowsB: mode === '2' ? rowsB : 0,
        colsB: mode === '2' ? colsB : 0,
      });
    } catch (e: any) {
      showError(e.message || 'Calculation error');
    }
  };

  const clearAll = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setMatrixA(createEmptyMatrix(rowsA, colsA));
    setMatrixB(createEmptyMatrix(rowsB, colsB));
    setResult(null);
    setSteps([]);
    setLastOp('');
    setShowSteps(false);
  };

  const renderSizeSelector = (
    rows: number,
    cols: number,
    onChange: (r: number, c: number) => void,
    label: string
  ) => (
    <View style={s.sizeSelectorRow}>
      <Text style={[s.sizeLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={s.sizeControls}>
        <Pressable
          onPress={() => { if (rows > 1) onChange(rows - 1, cols); }}
          style={[s.sizeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Feather name="minus" size={14} color={colors.text} />
        </Pressable>
        <Text style={[s.sizeText, { color: colors.primary }]}>
          {rows}x{cols}
        </Text>
        <Pressable
          onPress={() => { if (rows < 6) onChange(rows + 1, cols); }}
          style={[s.sizeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Feather name="plus" size={14} color={colors.text} />
        </Pressable>
        <View style={[s.sizeDivider, { backgroundColor: colors.border }]} />
        <Pressable
          onPress={() => { if (cols > 1) onChange(rows, cols - 1); }}
          style={[s.sizeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Feather name="minus" size={14} color={colors.text} />
        </Pressable>
        <Text style={[s.sizeColLabel, { color: colors.textMuted }]}>cols</Text>
        <Pressable
          onPress={() => { if (cols < 6) onChange(rows, cols + 1); }}
          style={[s.sizeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Feather name="plus" size={14} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );

  const renderMatrixGrid = (
    matrix: Matrix,
    rows: number,
    cols: number,
    onUpdate: (r: number, c: number, val: string) => void,
    label: string
  ) => {
    const maxCellWidth = Math.min(52, (SCREEN_WIDTH - 64) / cols);
    return (
      <Animated.View entering={FadeInDown.duration(300)} style={[s.matrixContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={s.matrixHeader}>
          <Text style={[s.matrixLabel, { color: colors.primary }]}>{label}</Text>
          {renderSizeSelector(
            rows,
            cols,
            label === 'Matrix A' ? changeSizeA : changeSizeB,
            ''
          )}
        </View>
        <View style={s.matrixBracketWrap}>
          <View style={[s.bracketLeft, { borderColor: colors.primary }]} />
          <View style={s.matrixGrid}>
            {Array.from({ length: rows }).map((_, i) => (
              <View key={i} style={s.matrixRow}>
                {Array.from({ length: cols }).map((_, j) => (
                  <TextInput
                    key={`${i}-${j}`}
                    style={[
                      s.matrixCell,
                      {
                        width: maxCellWidth,
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      },
                    ]}
                    value={matrix[i]?.[j] !== 0 ? String(matrix[i]?.[j] ?? '') : ''}
                    onChangeText={(val) => onUpdate(i, j, val)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </View>
            ))}
          </View>
          <View style={[s.bracketRight, { borderColor: colors.primary }]} />
        </View>
      </Animated.View>
    );
  };

  const renderResult = () => {
    if (result === null && steps.length === 0) return null;

    return (
      <Animated.View entering={FadeIn.duration(400)} style={[s.resultContainer, { backgroundColor: colors.cardBg, borderColor: colors.accent }]}>
        <View style={s.resultHeader}>
          <Text style={[s.resultTitle, { color: colors.accent }]}>
            {lastOp} Result
          </Text>
          {steps.length > 0 && (
            <Pressable
              onPress={() => setShowSteps(!showSteps)}
              style={[s.stepsToggle, { backgroundColor: colors.surface }]}
            >
              <Feather name={showSteps ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
              <Text style={[s.stepsToggleText, { color: colors.primary }]}>
                Steps
              </Text>
            </Pressable>
          )}
        </View>

        {typeof result === 'number' ? (
          <View style={s.scalarResult}>
            <Text style={[s.scalarValue, { color: colors.primary }]}>
              {formatNumber(result)}
            </Text>
          </View>
        ) : result && Array.isArray(result) ? (
          <View style={s.resultMatrixWrap}>
            <View style={[s.bracketLeft, { borderColor: colors.accent }]} />
            <View style={s.matrixGrid}>
              {result.map((row, i) => (
                <View key={i} style={s.matrixRow}>
                  {row.map((val, j) => (
                    <View key={j} style={[s.resultCell, { backgroundColor: colors.surface }]}>
                      <Text style={[s.resultCellText, { color: colors.text }]}>
                        {formatNumber(val)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
            <View style={[s.bracketRight, { borderColor: colors.accent }]} />
          </View>
        ) : null}

        {showSteps && steps.length > 0 && (
          <Animated.View entering={FadeInDown.duration(200)} style={[s.stepsContainer, { backgroundColor: colors.surface }]}>
            <ScrollView style={s.stepsScroll} nestedScrollEnabled>
              {steps.map((step, i) => (
                <Text key={i} style={[s.stepText, { color: step.startsWith('Step') || step.startsWith('Final') ? colors.accent : colors.textSecondary }]}>
                  {step}
                </Text>
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  const oneMatrixOps: { op: Operation; icon: string; label: string }[] = [
    { op: 'transpose', icon: 'swap-horizontal', label: 'T' },
    { op: 'det', icon: 'grid', label: 'det' },
    { op: 'inverse', icon: 'return-up-back', label: 'inv' },
  ];

  const twoMatrixOps: { op: Operation; icon: string; label: string }[] = [
    { op: 'add', icon: 'add', label: '+' },
    { op: 'sub', icon: 'remove', label: '-' },
    { op: 'mul', icon: 'close', label: 'x' },
  ];

  const ops = mode === '1' ? oneMatrixOps : twoMatrixOps;

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <View style={[s.header, { paddingTop: (insets.top || webTopInset) + 8 }]}>
        <View style={s.headerLeft}>
          <MaterialCommunityIcons name="matrix" size={28} color={colors.primary} />
          <Text style={[s.headerTitle, { color: colors.text }]}>
            Matrix Solver
          </Text>
        </View>
        <View style={s.headerRight}>
          <Pressable onPress={clearAll} style={s.headerBtn}>
            <Feather name="trash-2" size={20} color={colors.textSecondary} />
          </Pressable>
          <Pressable onPress={() => setShowMenu(!showMenu)} style={s.headerBtn}>
            <Feather name="more-vertical" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
        {showMenu && (
          <Animated.View entering={FadeIn.duration(150)} style={[s.menuDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Pressable
              style={s.menuItem}
              onPress={() => { setShowMenu(false); router.push('/history'); }}
            >
              <Feather name="clock" size={18} color={colors.text} />
              <Text style={[s.menuText, { color: colors.text }]}>History</Text>
            </Pressable>
            <Pressable
              style={s.menuItem}
              onPress={() => { setShowMenu(false); router.push('/settings'); }}
            >
              <Feather name="settings" size={18} color={colors.text} />
              <Text style={[s.menuText, { color: colors.text }]}>Settings</Text>
            </Pressable>
            <Pressable
              style={s.menuItem}
              onPress={() => { setShowMenu(false); router.push('/about'); }}
            >
              <Feather name="info" size={18} color={colors.text} />
              <Text style={[s.menuText, { color: colors.text }]}>About</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>

      <ScrollView
        style={s.scrollView}
        contentContainerStyle={[s.scrollContent, { paddingBottom: (insets.bottom || webBottomInset) + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[s.modeToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            onPress={() => setMode('1')}
            style={[
              s.modeBtn,
              mode === '1' && { backgroundColor: colors.primary },
            ]}
          >
            <Text style={[s.modeBtnText, { color: mode === '1' ? colors.background : colors.textSecondary }]}>
              1 Matrix
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('2')}
            style={[
              s.modeBtn,
              mode === '2' && { backgroundColor: colors.primary },
            ]}
          >
            <Text style={[s.modeBtnText, { color: mode === '2' ? colors.background : colors.textSecondary }]}>
              2 Matrices
            </Text>
          </Pressable>
        </View>

        {renderMatrixGrid(matrixA, rowsA, colsA, updateMatrixA, 'Matrix A')}

        {mode === '2' && renderMatrixGrid(matrixB, rowsB, colsB, updateMatrixB, 'Matrix B')}

        <View style={s.opsRow}>
          {ops.map((item) => (
            <Pressable
              key={item.op}
              onPress={() => performOperation(item.op)}
              style={({ pressed }) => [
                s.opBtn,
                {
                  backgroundColor: pressed ? colors.primaryDark : colors.surface,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text style={[s.opBtnText, { color: colors.primary }]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {renderResult()}
      </ScrollView>

      {showMenu && (
        <Pressable style={s.menuOverlay} onPress={() => setShowMenu(false)} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: 22 },
  headerBtn: { padding: 8 },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  menuDropdown: {
    position: 'absolute',
    right: 16,
    top: '100%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    width: 180,
    zIndex: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuText: { fontSize: 15 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  modeToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeBtnText: { fontSize: 14 },
  matrixContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  matrixHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matrixLabel: { fontSize: 16 },
  sizeSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sizeLabel: { fontSize: 12 },
  sizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sizeBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeText: { fontSize: 14 },
  sizeColLabel: { fontSize: 10 },
  sizeDivider: { width: 1, height: 16 },
  matrixBracketWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bracketLeft: {
    width: 6,
    borderLeftWidth: 2.5,
    borderTopWidth: 2.5,
    borderBottomWidth: 2.5,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    alignSelf: 'stretch',
  },
  bracketRight: {
    width: 6,
    borderRightWidth: 2.5,
    borderTopWidth: 2.5,
    borderBottomWidth: 2.5,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    alignSelf: 'stretch',
  },
  matrixGrid: {
    gap: 6,
    paddingVertical: 4,
  },
  matrixRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  matrixCell: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    paddingHorizontal: 4,
  },
  opsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  opBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 100,
  },
  opBtnText: { fontSize: 20 },
  resultContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: { fontSize: 16 },
  stepsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stepsToggleText: { fontSize: 13 },
  scalarResult: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  scalarValue: { fontSize: 32 },
  resultMatrixWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  resultCell: {
    minWidth: 44,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  resultCellText: { fontSize: 13 },
  stepsContainer: {
    marginTop: 12,
    borderRadius: 10,
    padding: 12,
    maxHeight: 200,
  },
  stepsScroll: {},
  stepText: {
    fontSize: 11,
    lineHeight: 18,
  },
});
