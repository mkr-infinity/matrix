import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/lib/ThemeContext';

const socialLinks = [
  {
    platform: 'Instagram',
    username: '@mkr_infinity',
    url: 'https://instagram.com/mkr_infinity/',
    icon: 'logo-instagram' as const,
    iconSet: 'ionicons' as const,
    color: '#E4405F',
  },
  {
    platform: 'GitHub',
    username: '@mkr-infinity',
    url: 'https://github.com/mkr-infinity/',
    icon: 'logo-github' as const,
    iconSet: 'ionicons' as const,
    color: '#FFFFFF',
  },
  {
    platform: 'Telegram',
    username: '@mkr_infinity',
    url: 'https://t.me/mkr_infinity/',
    icon: 'send' as const,
    iconSet: 'feather' as const,
    color: '#0088CC',
  },
];

export default function AboutScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <View style={[s.header, { paddingTop: (insets.top || webTopInset) + 8 }]}>
        <Text style={[s.title, { color: colors.text }]}>About</Text>
        <Pressable onPress={() => router.back()} style={s.closeBtn}>
          <Feather name="x" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: (insets.bottom || webBottomInset) + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400)} style={s.profileSection}>
          <View style={[s.avatarRing, { borderColor: colors.primary }]}>
            <Image
              source={require('../assets/images/developer-avatar.png')}
              style={s.avatar}
              contentFit="cover"
            />
          </View>
          <Text style={[s.devName, { color: colors.text }]}>
            Mohammad Kaif Raja
          </Text>
          <Text style={[s.devSubtitle, { color: colors.textSecondary }]}>
            Proudly an Indian
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(150)} style={s.connectSection}>
          <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>
            Connect
          </Text>

          {socialLinks.map((link, index) => (
            <Animated.View key={link.platform} entering={FadeInDown.duration(300).delay(200 + index * 80)}>
              <Pressable
                onPress={() => openLink(link.url)}
                style={({ pressed }) => [
                  s.socialCard,
                  {
                    backgroundColor: pressed ? colors.surfaceLight : colors.cardBg,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={[s.socialIconWrap, { backgroundColor: link.color + '22' }]}>
                  {link.iconSet === 'ionicons' ? (
                    <Ionicons name={link.icon} size={22} color={link.color} />
                  ) : (
                    <Feather name={link.icon} size={22} color={link.color} />
                  )}
                </View>
                <View style={s.socialInfo}>
                  <Text style={[s.socialPlatform, { color: colors.text }]}>
                    {link.platform}
                  </Text>
                  <Text style={[s.socialUsername, { color: colors.textSecondary }]}>
                    {link.username}
                  </Text>
                </View>
                <Feather name="external-link" size={16} color={colors.textMuted} />
              </Pressable>
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(500)} style={[s.appInfo, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[s.appName, { color: colors.primary }]}>
            Matrix Solver
          </Text>
          <Text style={[s.appVersion, { color: colors.textMuted }]}>
            Version 1.0.0
          </Text>
          <Text style={[s.appDesc, { color: colors.textSecondary }]}>
            A fully offline, lightweight matrix calculator with step-by-step solutions.
          </Text>
        </Animated.View>
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
  content: { padding: 20, alignItems: 'center' },
  profileSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  avatarRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  devName: {
    fontSize: 22,
    marginBottom: 4,
  },
  devSubtitle: {
    fontSize: 14,
  },
  connectSection: {
    width: '100%',
    marginBottom: 28,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  socialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
  },
  socialIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialInfo: { flex: 1 },
  socialPlatform: { fontSize: 15 },
  socialUsername: { fontSize: 13 },
  appInfo: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  appName: { fontSize: 18, marginBottom: 4 },
  appVersion: { fontSize: 12, marginBottom: 8 },
  appDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
