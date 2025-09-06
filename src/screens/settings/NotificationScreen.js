import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@notification_settings'; 

export default function NotificationScreen({ navigation }) {
  const [settings, setSettings] = useState({
    all: true,
    sms: true,
    email: false,
    push: true,
    nightPush: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedSettings !== null) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (e) {
        console.error('Failed to load settings.', e);
      }
    };
    loadSettings();
  }, []); 

  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (e) {
        console.error('Failed to save settings.', e);
      }
    };
    saveSettings();
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value,
    }));
  };

  const toggleAll = value => {
    setSettings({
      all: value,
      sms: value,
      email: value,
      push: value,
      nightPush: value,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림</Text>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>전체 알림</Text>
          <Switch
            value={settings.all}
            onValueChange={toggleAll}
            trackColor={{ false: "#555", true: "#295be7" }}
            thumbColor={settings.all ? "#fff" : "#ccc"}
          />
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>문자/이메일</Text>
        <Text style={styles.groupDescription}>문자, 이메일 발송 알림</Text>
        <View style={styles.sectionInner}>
          <View style={styles.sectionRow}>
            <Text style={styles.label}>문자 알림</Text>
            <Switch
              value={settings.sms}
              onValueChange={value => updateSetting('sms', value)}
              disabled={!settings.all}
              trackColor={{ false: "#555", true: "#295be7" }}
              thumbColor={settings.sms ? "#fff" : "#ccc"}
            />
          </View>
          <View style={[styles.sectionRow, { marginTop: 10 }]}>
            <Text style={styles.label}>이메일 알림</Text>
            <Switch
              value={settings.email}
              onValueChange={value => updateSetting('email', value)}
              disabled={!settings.all}
              trackColor={{ false: "#555", true: "#295be7" }}
              thumbColor={settings.email ? "#fff" : "#ccc"}
            />
          </View>
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>활동 알림</Text>
        <Text style={styles.groupDescription}>앱 업데이트, 새로운 기능 알림</Text>
        <View style={styles.sectionInner}>
          <View style={styles.sectionRow}>
            <Text style={styles.label}>푸시 알림</Text>
            <Switch
              value={settings.push}
              onValueChange={value => updateSetting('push', value)}
              disabled={!settings.all}
              trackColor={{ false: "#555", true: "#295be7" }}
              thumbColor={settings.push ? "#fff" : "#ccc"}
            />
          </View>
          <View style={[styles.sectionRow, { marginTop: 10 }]}>
            <Text style={styles.label}>야간 푸시 알림(21~08시)</Text>
            <Switch
              value={settings.nightPush}
              onValueChange={value => updateSetting('nightPush', value)}
              disabled={!settings.all}
              trackColor={{ false: "#555", true: "#295be7" }}
              thumbColor={settings.nightPush ? "#fff" : "#ccc"}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  section: {
    backgroundColor: "#232324",
    borderRadius: 10,
    padding: 18,
    marginBottom: 18,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  group: {
    marginBottom: 18,
  },
  groupLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    marginLeft: 4,
  },
  groupDescription: {
    color: "#888",
    fontSize: 12,
    marginBottom: 5,
    marginLeft: 4,
  },
  sectionInner: {
    backgroundColor: "#232324",
    borderRadius: 10,
    padding: 18,
    marginTop: 6,
  },
  label: {
    color: "#fff",
    fontSize: 15,
  },
});