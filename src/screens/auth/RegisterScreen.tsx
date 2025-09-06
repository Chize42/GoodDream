// src/screens/RegisterScreen.tsx

import React from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const owlImage = require("../../../assets/reowl.png");

const { height } = Dimensions.get("window");

const RegisterScreen = ({ navigation }: { navigation: any }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={owlImage} style={styles.image} />
        </View>

        <Text style={styles.title}>We are what we do</Text>
        <Text style={styles.description}>
          Thousand of people are using silent moon{"\n"}for small meditations
        </Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={styles.buttonText}>SIGN UP</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>ALREADY HAVE AN ACCOUNT? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>LOG IN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#181820",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#181820",
  },
  imageContainer: {
    marginBottom: height < 600 ? 20 : 30,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  title: {
    fontSize: height < 600 ? 24 : 28,
    fontWeight: "600",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: height < 600 ? 14 : 16,
    lineHeight: 24,
    color: "#a8a8a8",
    textAlign: "center",
    marginBottom: height < 600 ? 25 : 40,
    maxWidth: 320,
  },
  button: {
    backgroundColor: "#4285f4",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    width: "80%",
    alignItems: "center",
    marginBottom: height < 600 ? 20 : 30,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginText: {
    fontSize: 13,
    color: "#a8a8a8",
    letterSpacing: 0.5,
  },
  loginLink: {
    fontSize: 13,
    color: "#4285f4",
    fontWeight: "500",
  },
});

export default RegisterScreen;
