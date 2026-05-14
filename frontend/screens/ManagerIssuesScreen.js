import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ManagerIssuesScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const statusFilters = [
    "all",
    "pending",
    "in progress",
    "resolved",
  ];

  useEffect(() => {
    const fetchAllIssues = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const response = await fetch(
          "http://192.168.1.25:8000/api/issues",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load all issues");
          return;
        }

        setIssues(data);
      } catch (err) {
        setError("Network error while loading issues");
      } finally {
        setLoading(false);
      }
    };

    fetchAllIssues();
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

  const filteredIssues = issues.filter((issue) => {
    const category = issue.category?.toLowerCase() || "";
    const location = issue.location?.toLowerCase() || "";
    const status = issue.status?.toLowerCase() || "";

    const matchesSearch =
      category.includes(searchText.toLowerCase()) ||
      location.includes(searchText.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" ||
      status === selectedStatus ||
      status.replace("_", " ") === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0B6E4F" />
        <Text style={styles.loadingText}>Loading all issues...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>All Issues</Text>

      <Text style={styles.subtitle}>
        Manager view for all submitted facility issues.
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by category or location"
        placeholderTextColor="#98A2B3"
        value={searchText}
        onChangeText={setSearchText}
      />

      <View style={styles.filterContainer}>
        {statusFilters.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              selectedStatus === status &&
                styles.activeFilterButton,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.filterText,
                selectedStatus === status &&
                  styles.activeFilterText,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      {filteredIssues.length === 0 && !error ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>
            No issues found
          </Text>

          <Text style={styles.emptyText}>
            No submitted issues match your filters.
          </Text>
        </View>
      ) : null}

      <FlatList
        data={filteredIssues}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() =>
              navigation.navigate(
                "ManagerIssueDetails",
                {
                  id: item.id,
                }
              )
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

            <Text style={styles.info}>
              Assigned Worker:{" "}
              {item.assign_worker || "Not assigned"}
            </Text>

            <View style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>
                Open Details
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

  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    marginBottom: 14,
    color: "#111827",
  },

  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
    marginBottom: 8,
  },

  activeFilterButton: {
    backgroundColor: "#0B6E4F",
    borderColor: "#0B6E4F",
  },

  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475467",
    textTransform: "capitalize",
  },

  activeFilterText: {
    color: "#fff",
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
    backgroundColor: "#FFF4D6",
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