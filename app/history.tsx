import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/lib/ThemeContext';
import { getHistory, HistoryEntry } from '@/lib/history';
import { formatNumber } from '@/lib/matrix-operations';

function HistoryItem({ item, colors }: { item: HistoryEntry; colors: any }) {
  const date = new Date(item.timestamp);
  const timeStr = date.toLocaleString();

  const resultPreview = () => {
    if (typeof item.result === 'number') return formatNumber(item.result);
    if (Array.isArray(item.result)) {
      return `${item.result.length}x${item.result[0]?.length || 0} matrix`;
    }
    return 'N/A';
  };

  return (
    <Animated.View entering={FadeInDown.duration(200)}>
      <View style={[s.historyCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={s.historyTop}>
          <View style={[s.opBadge, { backgroundColor: colors.primary + '22' }]}>
            <Text style={[s.opBadgeText, { color: colors.primary }]}>
              {item.operation}
            </Text>
          </View>
          <Text style={[s.historyTime, { color: colors.textMuted }]}>
            {timeStr}
          </Text>
        </View>
        <View style={s.historyBody}>
          <Text style={[s.historyDetail, { color: colors.textSecondary }]}>
            A: {item.rowsA}x{item.colsA}
            {item.matrixB ? `  B: ${item.rowsB}x${item.colsB}` : ''}
          </Text>
          <Text style={[s.historyResult, { color: colors.accent }]}>
            = {resultPreview()}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory().then((h) => {
      setHistory(h);
      setLoading(false);
    });
  }, []);

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <View style={[s.header, { paddingTop: (insets.top || webTopInset) + 8 }]}>
        <Text style={[s.title, { color: colors.text }]}>History</Text>
        <Pressable onPress={() => router.back()} style={s.closeBtn}>
          <Feather name="x" size={24} color={colors.text} />
        </Pressable>
      </View>
      {history.length === 0 && !loading ? (
        <View style={s.emptyState}>
          <Feather name="clock" size={48} color={colors.textMuted} />
          <Text style={[s.emptyText, { color: colors.textSecondary }]}>
            No calculations yet
          </Text>
          <Text style={[s.emptySubtext, { color: colors.textMuted }]}>
            Your calculation history will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryItem item={item} colors={colors} />}
          contentContainerStyle={[s.list, { paddingBottom: (insets.bottom || webBottomInset) + 20 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 24 },
  closeBtn: { padding: 8 },
  list: { padding: 16, gap: 12 },
  historyCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  opBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  opBadgeText: { fontSize: 13 },
  historyTime: { fontSize: 11 },
  historyBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDetail: { fontSize: 13 },
  historyResult: { fontSize: 14 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: { fontSize: 18 },
  emptySubtext: { fontSize: 14 },
});
