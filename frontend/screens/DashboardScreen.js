import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
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

    Alert.alert("Logged Out", "You have been logged out successfully");

    navigation.replace("Login");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roleText}>COMMUNITY MEMBER</Text>

        <Text style={styles.welcome}>
          Welcome back{userName ? `, ${userName}` : ""}
        </Text>

        <Text style={styles.subtitle}>
          Report and track campus maintenance issues easily.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>+</Text>
          <Text style={styles.statLabel}>Report</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>✓</Text>
          <Text style={styles.statLabel}>Track</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>CC</Text>
          <Text style={styles.statLabel}>CampusCare</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.actionCard}
          onPress={() => navigation.navigate("SubmitIssue")}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>+</Text>
          </View>

          <View style={styles.actionTextBox}>
            <Text style={styles.actionTitle}>Submit New Issue</Text>
            <Text style={styles.actionSubtitle}>
              Report a maintenance problem with details and photo.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.actionCard}
          onPress={() => navigation.navigate("MyIssues")}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>≡</Text>
          </View>

          <View style={styles.actionTextBox}>
            <Text style={styles.actionTitle}>View My Issues</Text>
            <Text style={styles.actionSubtitle}>
              Track issue status and review submitted requests.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>How it works</Text>
        <Text style={styles.infoText}>
          Submit an issue, wait for manager assignment, then track progress until
          it is resolved.
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F6F8F7",
    paddingBottom: 28,
  },

  header: {
    backgroundColor: "#0B6E4F",
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 34,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  roleText: {
    color: "#BFE3D3",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 10,
  },

  welcome: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 8,
  },

  subtitle: {
    color: "#E3F3EC",
    fontSize: 15,
    lineHeight: 22,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: -24,
    paddingHorizontal: 18,
    justifyContent: "space-between",
  },

  statCard: {
    backgroundColor: "#fff",
    width: "31%",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 3,
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0B6E4F",
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: "#667085",
    fontWeight: "700",
  },

  section: {
    paddingHorizontal: 22,
    marginTop: 26,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
  },

  actionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 3,
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E8F5EF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  iconText: {
    color: "#0B6E4F",
    fontSize: 24,
    fontWeight: "900",
  },

  actionTextBox: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 4,
  },

  actionSubtitle: {
    fontSize: 13,
    color: "#667085",
    lineHeight: 19,
  },

  arrow: {
    fontSize: 30,
    color: "#98A2B3",
    marginLeft: 8,
  },

  infoBox: {
    backgroundColor: "#ECFDF3",
    marginHorizontal: 22,
    marginTop: 10,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#B7E4C7",
  },

  infoTitle: {
    color: "#0B6E4F",
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 6,
  },

  infoText: {
    color: "#475467",
    fontSize: 14,
    lineHeight: 20,
  },

  logoutButton: {
    backgroundColor: "#9B2226",
    marginHorizontal: 22,
    marginTop: 18,
    paddingVertical: 15,
    borderRadius: 16,
  },

  logoutText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },
});
