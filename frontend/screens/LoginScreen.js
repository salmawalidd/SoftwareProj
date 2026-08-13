import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { loginUser } from "../services/authService";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      const data = await loginUser(email, password);

      console.log("LOGIN SUCCESS:", data);

      if (data?.token) {
        await AsyncStorage.setItem("token", data.token);
      }

      if (data?.user) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      }

      Alert.alert("Success", "Login successful");

      const role = data?.user?.role;

      if (role === "manager") {
        navigation.replace("ManagerIssues");
      } else if (role === "worker") {
        navigation.replace("AssignedIssues");
      } else if (role === "community") {
        navigation.replace("Dashboard");
      } else {
        navigation.replace("Dashboard");
      }
    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data || error.message);

      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>CC</Text>
          </View>

          <Text style={styles.title}>CampusCare</Text>

          <Text style={styles.subtitle}>
            Smart facility management for campus maintenance requests.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>

          <Text style={styles.cardSubtitle}>
            Login to continue to your dashboard.
          </Text>

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#98A2B3"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#98A2B3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            activeOpacity={0.8}
          >
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            activeOpacity={0.8}
          >
            <Text style={styles.link}>
              Don’t have an account?{" "}
              <Text style={styles.linkBold}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#F6F8F7",
  },

  container: {
    flexGrow: 1,
    backgroundColor: "#F6F8F7",
    paddingBottom: 28,
  },

  header: {
    backgroundColor: "#0B6E4F",
    paddingTop: 78,
    paddingHorizontal: 24,
    paddingBottom: 72,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    alignItems: "center",
  },

  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  logoText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 1,
  },

  title: {
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    color: "#fff",
    marginBottom: 10,
  },

  subtitle: {
    color: "#E3F3EC",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 310,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 22,
    marginTop: -42,
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 4,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },

  cardSubtitle: {
    color: "#667085",
    fontSize: 14,
    marginBottom: 22,
    lineHeight: 20,
  },

  label: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 7,
    color: "#475467",
    letterSpacing: 0.3,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },

  button: {
    backgroundColor: "#0B6E4F",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 4,
    elevation: 3,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },

  forgotPassword: {
    marginTop: 16,
    textAlign: "center",
    color: "#9B2226",
    fontWeight: "800",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 18,
  },

  link: {
    textAlign: "center",
    color: "#667085",
    fontWeight: "700",
  },

  linkBold: {
    color: "#0B6E4F",
    fontWeight: "900",
  },
});
