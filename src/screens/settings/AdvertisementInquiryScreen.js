import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function ServiceInquiryScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>광고 문의</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.text}>광고 문의 화면 내용</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#121212", 
    paddingTop: 36 
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 14, 
    marginBottom: 20 
  },
  headerTitle: { 
    color: "#fff", 
    fontSize: 19, 
    fontWeight: "bold", 
    marginLeft: 10 
  },
  content: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  text: { 
    color: "#fff", 
    fontSize: 16 
  },
});
