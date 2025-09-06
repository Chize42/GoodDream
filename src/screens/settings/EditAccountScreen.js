import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Image } from "react-native";

export default function EditAccountScreen({ navigation, route }) {
  const [info, setInfo] = useState(route.params.currentUser);
  const [editField, setEditField] = useState(null);
  
  const handleSave = () => {
      navigation.navigate({
        name: "계정 센터", 
        params: { updatedUser: info }, 
        merge: true, 
    });
  };
  
  const handleCancel = () => {
    navigation.goBack();
  };

  const renderRow = (label, fieldKey) => (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueBox}>
        {editField === fieldKey ? (
          <TextInput
            style={[styles.value, styles.input]}
            value={info[fieldKey]}
            autoFocus
            onChangeText={text => setInfo({ ...info, [fieldKey]: text })}
            onBlur={() => setEditField(null)}
            placeholder={label}
            placeholderTextColor="#888"
          />
        ) : (
          <Text style={styles.value}>{info[fieldKey]}</Text>
        )}
        <TouchableOpacity onPress={() => setEditField(fieldKey)}>
          <Image
            source={{ uri: 'https://i.ibb.co/k6ms3py0/bx-pencil.png' }}
            style={{ width: 16, height: 16, marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>개인 정보</Text>
      <View style={styles.infoBox}>
        {renderRow("이름", "name")}
        {renderRow("생년월일", "birth")}
        {renderRow("성별", "gender")}
        {renderRow("이메일 주소", "email")}
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>저장하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={handleCancel}>
          <Text style={styles.buttonText}>취소하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111014",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
    alignSelf: "center",
    marginBottom: 32,
  },
  infoBox: {
    backgroundColor: "#222224",
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: 18,
    justifyContent: "space-between",
  },
  label: {
    color: "#ccc",
    fontSize: 15,
    minWidth: 85,
  },
  valueBox: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 160,
    maxWidth: 200,
    flexShrink: 1,
    justifyContent: "flex-end",
  },
  value: {
    color: "#fff",
    fontSize: 15,
  },
  input: {
    backgroundColor: "#222224",
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    color: "#fff",
    minWidth: 60,
    padding: 0,
    margin: 0,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  button: {
    backgroundColor: "#295be7",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 28,
    marginHorizontal: 8,
  },
  cancelBtn: {
    backgroundColor: "#444",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});