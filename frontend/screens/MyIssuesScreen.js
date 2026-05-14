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

export default function MyIssuesScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const statusFilters = [
    "all",
    "pending",
    "in progress",
    "resolved",
  ];

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const response = await fetch(
          "http://192.168.1.25:8000/api/issues/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        setIssues(data);
      } catch (err) {
        setError("Failed to load issues");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
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

  const getStatusStyle = (status) => {
    const normalized = status?.toLowerCase();

    if (normalized === "pending") {
      return { style: styles.pending, icon: "🟡" };
    }

    if (
      normalized === "in progress" ||
      normalized === "in_progress"
    ) {
      return { style: styles.inProgress, icon: "🔵" };
    }

    if (normalized === "resolved") {
      return { style: styles.resolved, icon: "🟢" };
    }

    return { style: styles.pending, icon: "🟡" };
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

        <Text style={styles.loadingText}>
          Loading your issues...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>My Issues</Text>

      <Text style={styles.subtitle}>
        Track the maintenance requests you submitted.
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
            No matching issues
          </Text>

          <Text style={styles.emptyText}>
            Try changing the search or status filter.
          </Text>
        </View>
      ) : null}

      <FlatList
        data={filteredIssues}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const statusData = getStatusStyle(item.status);

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("MyIssueDetails", {
                  id: item.id,
                })
              }
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.category}>
                  {item.category}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    statusData.style,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {statusData.icon} {item.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.location}>
                {item.location}
              </Text>

              <Text style={styles.viewText}>
                View details →
              </Text>
            </TouchableOpacity>
          );
        }}
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
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  category: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  statusBadge: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 30,
  },

  pending: {
    backgroundColor: "#FFF4D6",
  },

  inProgress: {
    backgroundColor: "#DCEBFF",
  },

  resolved: {
    backgroundColor: "#DFF5E8",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0B2F24",
    textTransform: "capitalize",
  },

  location: {
    fontSize: 15,
    color: "#475467",
    marginBottom: 14,
  },

  viewText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0B6E4F",
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