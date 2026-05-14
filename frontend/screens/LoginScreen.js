import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
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
    <View style={styles.container}>
      <Text style={styles.title}>CampusCare Login</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.forgotPassword}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>
          Don’t have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#0B6E4F",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: "#F5F5F5",
  },

  button: {
    backgroundColor: "#0B6E4F",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },

  forgotPassword: {
    marginTop: 15,
    textAlign: "center",
    color: "#9B2226",
    fontWeight: "600",
  },

  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#0B6E4F",
    fontWeight: "600",
  },
});