import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Image,
  RefreshControl,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ManagerIssuesScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const statusFilters = ["all", "pending", "in progress", "resolved"];

  const fetchAllIssues = async () => {
    try {
      setError("");

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        "http://192.168.1.20:8000/api/issues",
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

      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Network error while loading issues");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllIssues();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllIssues();
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      navigation.replace("Login");
    } catch (error) {
      console.log("LOGOUT ERROR:", error);
    }
  };

  const normalizeStatus = (status) =>
    status?.toLowerCase().replace("_", " ") || "pending";

  const getStatusStyle = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized === "pending") {
      return {
        style: styles.pending,
        strip: "#FACC15",
        icon: "●",
      };
    }

    if (normalized === "in progress") {
      return {
        style: styles.inProgress,
        strip: "#3B82F6",
        icon: "●",
      };
    }

    if (normalized === "resolved") {
      return {
        style: styles.resolved,
        strip: "#22C55E",
        icon: "●",
      };
    }

    if (normalized === "closed") {
      return {
        style: styles.closed,
        strip: "#111827",
        icon: "●",
      };
    }

    return {
      style: styles.pending,
      strip: "#FACC15",
      icon: "●",
    };
  };

  const countByStatus = (targetStatus) =>
    issues.filter(
      (issue) => normalizeStatus(issue.status) === targetStatus
    ).length;

  const filteredIssues = issues.filter((issue) => {
    const category = issue.category?.toLowerCase() || "";
    const location = issue.location?.toLowerCase() || "";
    const assignedWorker = issue.assign_worker?.toLowerCase() || "";
    const status = normalizeStatus(issue.status);

    const matchesSearch =
      category.includes(searchText.toLowerCase()) ||
      location.includes(searchText.toLowerCase()) ||
      assignedWorker.includes(searchText.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return "Not available";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
      <View style={styles.header}>
        <Text style={styles.headerTag}>FACILITY MANAGER</Text>

        <Text style={styles.pageTitle}>All Issues</Text>

        <Text style={styles.subtitle}>
          Monitor, filter, assign, and manage submitted maintenance requests.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{issues.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{countByStatus("pending")}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {countByStatus("in progress")}
          </Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{countByStatus("resolved")}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by category, location, or worker"
          placeholderTextColor="#98A2B3"
          value={searchText}
          onChangeText={setSearchText}
        />

        <View style={styles.filterContainer}>
          {statusFilters.map((status) => (
            <TouchableOpacity
              key={status}
              activeOpacity={0.85}
              style={[
                styles.filterButton,
                selectedStatus === status && styles.activeFilterButton,
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedStatus === status && styles.activeFilterText,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <FlatList
          data={filteredIssues}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 90 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0B6E4F"
            />
          }
          ListEmptyComponent={
            !error ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No issues found</Text>
                <Text style={styles.emptyText}>
                  No submitted issues match your current filters.
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const statusData = getStatusStyle(item.status);
            const issuePhoto =
              item.photo?.trim() || item.photo_url?.trim() || null;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.card,
                  { borderLeftColor: statusData.strip },
                ]}
                onPress={() =>
                  navigation.navigate("ManagerIssueDetails", {
                    id: item.id,
                  })
                }
              >
                <View style={styles.cardContent}>
                  {issuePhoto ? (
                    <Image
                      source={{ uri: issuePhoto }}
                      style={styles.issueImage}
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>No Photo</Text>
                    </View>
                  )}

                  <View style={styles.cardDetails}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.category} numberOfLines={1}>
                        {item.category || "Issue"}
                      </Text>

                      <View style={[styles.statusBadge, statusData.style]}>
                        <Text style={styles.statusText}>
                          {statusData.icon} {normalizeStatus(item.status)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.info} numberOfLines={1}>
                      Location: {item.location || "Not available"}
                    </Text>

                    <Text style={styles.info}>
                      Date: {formatDate(item.created_at)}
                    </Text>

                    <Text style={styles.info} numberOfLines={1}>
                      Worker: {item.assign_worker || "Not assigned"}
                    </Text>

                    <Text style={styles.viewText}>Open details →</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.85}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8F7",
  },

  header: {
    backgroundColor: "#0B6E4F",
    paddingTop: 62,
    paddingHorizontal: 24,
    paddingBottom: 34,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  headerTag: {
    color: "#BFE3D3",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
  },

  pageTitle: {
    color: "#fff",
    fontSize: 34,
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
    paddingHorizontal: 14,
    justifyContent: "space-between",
  },

  statCard: {
    backgroundColor: "#fff",
    width: "24%",
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 3,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0B6E4F",
    marginBottom: 3,
  },

  statLabel: {
    fontSize: 11,
    color: "#667085",
    fontWeight: "800",
  },

  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 22,
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
    fontWeight: "800",
    color: "#475467",
    textTransform: "capitalize",
  },

  activeFilterText: {
    color: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderLeftWidth: 6,
    borderColor: "#E5E7EB",
    elevation: 3,
  },

  cardContent: {
    flexDirection: "row",
  },

  issueImage: {
    width: 78,
    height: 78,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    marginRight: 14,
  },

  placeholderImage: {
    width: 78,
    height: 78,
    borderRadius: 16,
    backgroundColor: "#EEF2F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  placeholderText: {
    color: "#98A2B3",
    fontSize: 11,
    fontWeight: "800",
  },

  cardDetails: {
    flex: 1,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },

  category: {
    flex: 1,
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
    marginRight: 8,
  },

  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
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

  closed: {
    backgroundColor: "#E5E7EB",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#0B2F24",
    textTransform: "capitalize",
  },

  info: {
    fontSize: 12,
    color: "#475467",
    marginBottom: 5,
    fontWeight: "600",
  },

  viewText: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "900",
    color: "#0B6E4F",
  },

  logoutButton: {
    position: "absolute",
    bottom: 18,
    left: 22,
    right: 22,
    backgroundColor: "#9B2226",
    paddingVertical: 13,
    borderRadius: 16,
    elevation: 3,
  },

  logoutButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 15,
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
    fontWeight: "700",
  },

  error: {
    color: "#9B2226",
    marginBottom: 12,
    fontWeight: "800",
  },

  emptyBox: {
    backgroundColor: "#fff",
    padding: 28,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    marginTop: 20,
  },

  emptyIcon: {
    fontSize: 34,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },

  emptyText: {
    color: "#667085",
    textAlign: "center",
    lineHeight: 20,
  },
});
