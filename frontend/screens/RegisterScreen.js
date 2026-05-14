import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerUser } from "../services/authService";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // default empty role
  const [role, setRole] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password || !role) {
      Alert.alert("Error", "Please fill all fields and choose a role");
      return;
    }

    try {
      await registerUser(name, email, password, role);

      Alert.alert("Success", "Account created successfully");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert(
        "Register Failed",
        error.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

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

      <Text style={styles.label}>Role</Text>

      <TouchableOpacity
        style={[
          styles.roleButton,
          role === "community" && styles.selectedRoleButton,
        ]}
        onPress={() => setRole("community")}
      >
        <Text
          style={[
            styles.roleButtonText,
            role === "community" && styles.selectedRoleText,
          ]}
        >
          Community Member
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.roleButton,
          role === "manager" && styles.selectedRoleButton,
        ]}
        onPress={() => setRole("manager")}
      >
        <Text
          style={[
            styles.roleButtonText,
            role === "manager" && styles.selectedRoleText,
          ]}
        >
          Facility Manager
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.roleButton,
          role === "worker" && styles.selectedRoleButton,
        ]}
        onPress={() => setRole("worker")}
      >
        <Text
          style={[
            styles.roleButtonText,
            role === "worker" && styles.selectedRoleText,
          ]}
        >
          Worker
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
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
    marginBottom: 25,
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
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#F5F5F5",
  },

  roleButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#F5F5F5",
  },

  selectedRoleButton: {
    backgroundColor: "#0B6E4F",
    borderColor: "#0B6E4F",
  },

  roleButtonText: {
    textAlign: "center",
    color: "#333",
    fontWeight: "600",
  },

  selectedRoleText: {
    color: "white",
  },

  button: {
    backgroundColor: "#0B6E4F",
    padding: 15,
    borderRadius: 8,
    marginTop: 12,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },

  link: {
    marginTop: 18,
    textAlign: "center",
    color: "#0B6E4F",
    fontWeight: "600",
  },
});