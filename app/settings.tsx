import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/lib/ThemeContext';
import { ThemeColors, ThemeKey } from '@/constants/colors';
import { clearHistory } from '@/lib/history';

const themeOptions: { key: ThemeKey; label: string; desc: string }[] = [
  { key: 'default', label: 'Default', desc: 'Classic dark theme' },
  { key: 'amoled', label: 'AMOLED Dark', desc: 'Pure black for OLED' },
  { key: 'ocean', label: 'Ocean Blue', desc: 'Deep sea inspired' },
  { key: 'forest', label: 'Forest Green', desc: 'Nature inspired' },
  { key: 'sunset', label: 'Sunset Orange', desc: 'Warm evening tones' },
];

export default function SettingsScreen() {
  const { colors, theme, setTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const handleClearHistory = () => {
    const doClear = async () => {
      await clearHistory();
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Clear all calculation history?')) {
        doClear();
      }
    } else {
      Alert.alert('Clear History', 'Remove all saved calculations?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: doClear },
      ]);
    }
  };

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <View style={[s.header, { paddingTop: (insets.top || webTopInset) + 8 }]}>
        <Text style={[s.title, { color: colors.text }]}>Settings</Text>
        <Pressable onPress={() => router.back()} style={s.closeBtn}>
          <Feather name="x" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: (insets.bottom || webBottomInset) + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>
          Theme
        </Text>
        <View style={s.themesGrid}>
          {themeOptions.map((t) => {
            const tc = ThemeColors[t.key];
            const isActive = theme === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => {
                  setTheme(t.key);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                style={[
                  s.themeCard,
                  {
                    backgroundColor: tc.surface,
                    borderColor: isActive ? tc.primary : tc.border,
                    borderWidth: isActive ? 2 : 1,
                  },
                ]}
              >
                <View style={s.themePreview}>
                  <View style={[s.previewDot, { backgroundColor: tc.primary }]} />
                  <View style={[s.previewDot, { backgroundColor: tc.accent }]} />
                  <View style={[s.previewDot, { backgroundColor: tc.background }]} />
                </View>
                <Text style={[s.themeLabel, { color: tc.text }]}>
                  {t.label}
                </Text>
                <Text style={[s.themeDesc, { color: tc.textSecondary }]}>
                  {t.desc}
                </Text>
                {isActive && (
                  <View style={[s.activeIndicator, { backgroundColor: tc.primary }]}>
                    <Feather name="check" size={12} color={tc.background} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <Text style={[s.sectionTitle, { color: colors.textSecondary, marginTop: 28 }]}>
          Data
        </Text>
        <Pressable
          onPress={handleClearHistory}
          style={[s.clearBtn, { backgroundColor: colors.surface, borderColor: colors.error + '44' }]}
        >
          <Feather name="trash-2" size={20} color={colors.error} />
          <Text style={[s.clearBtnText, { color: colors.error }]}>
            Clear Calculation History
          </Text>
        </Pressable>
      </ScrollView>
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
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },
  themesGrid: {
    gap: 12,
  },
  themeCard: {
    borderRadius: 14,
    padding: 16,
    position: 'relative',
  },
  themePreview: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  previewDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  themeLabel: { fontSize: 16, marginBottom: 2 },
  themeDesc: { fontSize: 12 },
  activeIndicator: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  clearBtnText: { fontSize: 15 },
});
