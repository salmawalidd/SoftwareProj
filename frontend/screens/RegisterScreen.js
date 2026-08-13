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

import { registerUser } from "../services/authService";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password || !role) {
      Alert.alert(
        "Error",
        "Please fill all fields and choose a role"
      );
      return;
    }

    try {
      await registerUser(name, email, password, role);

      Alert.alert(
        "Success",
        "Account created successfully"
      );

      navigation.navigate("Login");
    } catch (error) {
      Alert.alert(
        "Register Failed",
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  const roles = [
    {
      id: "community",
      title: "Community Member",
      icon: "👤",
      desc: "Submit and track maintenance issues",
    },
    {
      id: "manager",
      title: "Facility Manager",
      icon: "🧑‍💼",
      desc: "Manage and assign maintenance tasks",
    },
    {
      id: "worker",
      title: "Worker",
      icon: "🛠️",
      desc: "Handle assigned maintenance requests",
    },
  ];

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

          <Text style={styles.title}>
            Create Account
          </Text>

          <Text style={styles.subtitle}>
            Join CampusCare and access the campus maintenance management system.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          <Text style={styles.label}>Full Name</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#98A2B3"
            value={name}
            onChangeText={setName}
          />

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
            placeholder="Create a password"
            placeholderTextColor="#98A2B3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.sectionTitle}>
            Select Role
          </Text>

          {roles.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={[
                styles.roleCard,
                role === item.id &&
                  styles.selectedRoleCard,
              ]}
              onPress={() => setRole(item.id)}
            >
              <View
                style={[
                  styles.roleIconContainer,
                  role === item.id &&
                    styles.selectedRoleIconContainer,
                ]}
              >
                <Text style={styles.roleIcon}>
                  {item.icon}
                </Text>
              </View>

              <View style={styles.roleInfo}>
                <Text
                  style={[
                    styles.roleTitle,
                    role === item.id &&
                      styles.selectedRoleTitle,
                  ]}
                >
                  {item.title}
                </Text>

                <Text
                  style={[
                    styles.roleDescription,
                    role === item.id &&
                      styles.selectedRoleDescription,
                  ]}
                >
                  {item.desc}
                </Text>
              </View>

              {role === item.id && (
                <Text style={styles.checkMark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={handleRegister}
          >
            <Text style={styles.buttonText}>
              Create Account
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.link}>
              Already have an account?{" "}
              <Text style={styles.linkBold}>
                Login
              </Text>
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
    paddingTop: 58,
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

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 16,
    marginTop: 4,
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

  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    marginBottom: 12,
  },

  selectedRoleCard: {
    backgroundColor: "#0B6E4F",
    borderColor: "#0B6E4F",
  },

  roleIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E8F5EF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  selectedRoleIconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  roleIcon: {
    fontSize: 24,
  },

  roleInfo: {
    flex: 1,
  },

  roleTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 4,
  },

  selectedRoleTitle: {
    color: "#fff",
  },

  roleDescription: {
    fontSize: 13,
    color: "#667085",
    lineHeight: 18,
  },

  selectedRoleDescription: {
    color: "#EAF4EF",
  },

  checkMark: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    marginLeft: 8,
  },

  button: {
    backgroundColor: "#0B6E4F",
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 12,
    elevation: 3,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
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
