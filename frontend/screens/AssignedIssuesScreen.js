import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
 StyleSheet,
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AssignedIssuesScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignedIssues = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const response = await fetch(
          "http://192.168.1.25:8000/api/issues/assigned",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load assigned issues");
          return;
        }

        setIssues(data);
      } catch (err) {
        console.log("ASSIGNED ISSUES ERROR:", err);
        setError("Network error while loading assigned issues");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedIssues();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      navigation.replace("Login");
    } catch (error) {
      console.log("LOGOUT ERROR:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0B6E4F" />
        <Text style={styles.loadingText}>
          Loading assigned issues...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Assigned Issues</Text>

      <Text style={styles.subtitle}>
        Issues assigned to you by the facility manager.
      </Text>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      {issues.length === 0 && !error ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>
            No assigned issues
          </Text>

          <Text style={styles.emptyText}>
            Assigned work will appear here.
          </Text>
        </View>
      ) : null}

      <FlatList
        data={issues}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() =>
              navigation.navigate("WorkIssue", {
                id: item.id,
              })
            }
          >
            <View style={styles.cardHeader}>
              <Text style={styles.category}>
                {item.category}
              </Text>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {item.status}
                </Text>
              </View>
            </View>

            <Text style={styles.info}>
              Location: {item.location}
            </Text>

            <Text style={styles.info}>
              Date:{" "}
              {item.created_at
                ? new Date(
                    item.created_at
                  ).toLocaleDateString("en-GB")
                : "Not available"}
            </Text>

            <View style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>
                Open Work Page
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 22,
    backgroundColor: "#F6F8F7",
  },

  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0B2F24",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: "#667085",
    marginBottom: 18,
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  category: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  statusBadge: {
    backgroundColor: "#DCEBFF",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 30,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0B2F24",
    textTransform: "capitalize",
  },

  info: {
    fontSize: 14,
    color: "#475467",
    marginBottom: 8,
  },

  detailsButton: {
    marginTop: 8,
    backgroundColor: "#0B6E4F",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: "flex-start",
  },

  detailsButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },

  logoutButton: {
    backgroundColor: "#9B2226",
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
  },

  logoutButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 14,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F8F7",
  },

  loadingText: {
    marginTop: 12,
    color: "#667085",
    fontWeight: "600",
  },

  error: {
    color: "#9B2226",
    marginBottom: 12,
    fontWeight: "700",
  },

  emptyBox: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },

  emptyText: {
    color: "#667085",
  },
});