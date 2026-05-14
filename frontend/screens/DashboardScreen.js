import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DashboardScreen({ navigation }) {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("user");

      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUserName(parsedUser.name);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    Alert.alert(
      "Logged Out",
      "You have been logged out successfully"
    );

    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        Welcome, {userName}
      </Text>

      <Text style={styles.title}>
        CampusCare Dashboard
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("SubmitIssue")}
      >
        <Text style={styles.buttonText}>
          Submit Issue
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("MyIssues")}
      >
        <Text style={styles.buttonText}>
          My Issues
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#fff",
  },

  welcome: {
    fontSize: 18,
    marginBottom: 10,
    color: "#0B6E4F",
    fontWeight: "600",
    textAlign: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 35,
    textAlign: "center",
    color: "#0B6E4F",
  },

  button: {
    backgroundColor: "#0B6E4F",
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
  },

  logoutButton: {
    backgroundColor: "#9B2226",
    padding: 16,
    borderRadius: 10,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});