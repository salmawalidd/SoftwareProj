import React, { useState } from "react";
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

import { forgotPassword } from "../services/authService";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    try {
      await forgotPassword(email);

      Alert.alert(
        "Success",
        "Password reset email sent. Please check your inbox."
      );

      navigation.navigate("Login");
    } catch (error) {
      Alert.alert(
        "Reset Failed",
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
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🔒</Text>
          </View>

          <Text style={styles.title}>Forgot Password</Text>

          <Text style={styles.subtitle}>
            Enter your email address and we’ll send you a password reset link.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reset Your Password</Text>

          <Text style={styles.cardSubtitle}>
            Make sure you enter the same email linked to your account.
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

          <TouchableOpacity
            style={styles.button}
            onPress={handleReset}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              Send Reset Email
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.8}
          >
            <Text style={styles.link}>
              ← Back to Login
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
    paddingTop: 88,
    paddingHorizontal: 24,
    paddingBottom: 70,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    alignItems: "center",
  },

  iconCircle: {
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

  iconText: {
    fontSize: 30,
  },

  title: {
    fontSize: 34,
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
    maxWidth: 320,
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
    marginBottom: 18,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },

  button: {
    backgroundColor: "#0B6E4F",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 2,
    elevation: 3,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },

  link: {
    marginTop: 22,
    textAlign: "center",
    color: "#0B6E4F",
    fontWeight: "800",
    fontSize: 14,
  },
});
