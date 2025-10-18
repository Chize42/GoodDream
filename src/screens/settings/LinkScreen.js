import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Ionicons } from "@expo/vector-icons";

export default function LinkScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Icon name="chevron-back" size={26} color="#fff" marginTop={30} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>계정 연동</Text>

        <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
          <View style={styles.btnInner}>
            <Image
              source={{ uri: "https://i.ibb.co/W489VZBp/Group-6795.png" }}
              style={styles.googleIcon}
              resizeMode="contain"
            />
            <Text style={styles.googleText}>CONTINUE WITH GOOGLE</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  backBtn: {
    position: "absolute",
    top: 48,
    left: 16,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 40,
  },
  btnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleBtn: {
    width: "100%",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "transparent",
    paddingVertical: 15,
  },
  googleIcon: {
    width: 26,
    height: 26,
    marginRight: 10,
  },
  googleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
