// src/components/FirebaseStatusBar.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "../styles/globalStyles";

const FirebaseStatusBar = ({ dataCount, onAddTestData }) => {
  const isConnected = dataCount > 0;

  return (
    <View style={styles.container}>
      <Ionicons
        name={isConnected ? "cloud-done" : "cloud-offline"}
        size={16}
        color={isConnected ? colors.success : colors.warning}
      />
      <Text style={styles.statusText}>
        Firebase 연동됨 - {dataCount}개 데이터
      </Text>
      <TouchableOpacity onPress={onAddTestData} style={styles.addButton}>
        <Ionicons name="add" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  statusText: {
    ...typography.caption,
    marginLeft: spacing.sm,
    flex: 1,
  },
  addButton: {
    padding: spacing.xs,
  },
});

export default FirebaseStatusBar;
