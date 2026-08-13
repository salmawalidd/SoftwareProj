import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ManagerIssueDetailsScreen({
  route,
  navigation,
}) {
  const { id } = route.params;

  const [issue, setIssue] = useState(null);
  const [error, setError] = useState("");

  const fetchIssueDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `http://192.168.1.20:8000/api/issues/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load issue details");
        return;
      }

      setIssue(data);
    } catch (err) {
      console.log("MANAGER ISSUE DETAILS ERROR:", err);

      setError("Network error while loading issue details");
    }
  };

  useEffect(() => {
    fetchIssueDetails();
  }, [id]);

  const updateStatus = async (status) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `http://192.168.1.20:8000/api/issues/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message);
        return;
      }

      Alert.alert("Success", "Status updated");

      fetchIssueDetails();
    } catch (error) {
      console.log("STATUS UPDATE ERROR:", error);

      Alert.alert("Error", "Failed to update status");
    }
  };

  const getStatusData = (status) => {
    const normalized = status?.toLowerCase();

    if (normalized === "pending") {
      return {
        label: "Pending",
        icon: "●",
        style: styles.pending,
        strip: "#FACC15",
      };
    }

    if (
      normalized === "in progress" ||
      normalized === "in_progress"
    ) {
      return {
        label: "In Progress",
        icon: "●",
        style: styles.inProgress,
        strip: "#3B82F6",
      };
    }

    if (normalized === "resolved") {
      return {
        label: "Resolved",
        icon: "●",
        style: styles.resolved,
        strip: "#22C55E",
      };
    }

    if (normalized === "closed") {
      return {
        label: "Closed",
        icon: "●",
        style: styles.closed,
        strip: "#111827",
      };
    }

    return {
      label: "Pending",
      icon: "●",
      style: styles.pending,
      strip: "#FACC15",
    };
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return "Not available";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (!issue && !error) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0B6E4F" />

        <Text style={styles.loadingText}>
          Loading issue details...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  const statusData = getStatusData(issue.status);

  const issuePhoto =
    issue?.photo?.trim() || issue?.photo_url?.trim() || null;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTag}>FACILITY MANAGER</Text>

        <Text style={styles.headerTitle}>
          {issue.category || "Issue Details"}
        </Text>

        <Text style={styles.headerSubtitle}>
          Review issue information, assign workers, and manage status updates.
        </Text>
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.statusCard,
            { borderLeftColor: statusData.strip },
          ]}
        >
          <View>
            <Text style={styles.statusLabel}>Current Status</Text>

            <View style={[styles.statusBadge, statusData.style]}>
              <Text style={styles.statusText}>
                {statusData.icon} {statusData.label}
              </Text>
            </View>
          </View>

          <Text style={styles.issueId}>#{issue.id || id}</Text>
        </View>

        {issuePhoto ? (
          <Image
            source={{
              uri: issuePhoto,
            }}
            style={styles.issueImage}
          />
        ) : (
          <View style={styles.noImageBox}>
            <Text style={styles.noImageIcon}>📷</Text>
            <Text style={styles.noImageText}>No issue photo available</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Issue Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>
              {issue.description || "Not available"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>
              {issue.location || "Not available"}
            </Text>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.columnBox}>
              <Text style={styles.label}>Date Submitted</Text>
              <Text style={styles.value}>
                {formatDate(issue.created_at || issue.date)}
              </Text>
            </View>

            <View style={styles.columnBox}>
              <Text style={styles.label}>Submitted By</Text>
              <Text style={styles.value}>
                {issue.user_id || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Assigned Worker</Text>
            <Text style={styles.value}>
              {issue.assign_worker || "Not assigned"}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Comments / Updates</Text>

          <Text style={styles.commentsText}>
            {issue.comments ||
              issue.updates ||
              "No comments or updates yet."}
          </Text>
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Manager Actions</Text>

          <TouchableOpacity
            style={styles.assignButton}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("AssignIssue", {
                id: issue.id,
              })
            }
          >
            <Text style={styles.assignButtonText}>
              Assign Worker
            </Text>
          </TouchableOpacity>

          {issue.status === "pending" && (
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.85}
              onPress={() => updateStatus("in progress")}
            >
              <Text style={styles.actionButtonText}>
                Mark In Progress
              </Text>
            </TouchableOpacity>
          )}

          {issue.status === "in progress" && (
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.85}
              onPress={() => updateStatus("resolved")}
            >
              <Text style={styles.actionButtonText}>
                Mark Resolved
              </Text>
            </TouchableOpacity>
          )}

          {issue.status === "resolved" && (
            <TouchableOpacity
              style={styles.closeButton}
              activeOpacity={0.85}
              onPress={() => updateStatus("closed")}
            >
              <Text style={styles.actionButtonText}>
                Close Issue
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
    paddingTop: 62,
    paddingHorizontal: 24,
    paddingBottom: 34,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  backText: {
    color: "#fff",
    fontSize: 38,
    lineHeight: 40,
    fontWeight: "300",
  },

  headerTag: {
    color: "#BFE3D3",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 8,
  },

  headerSubtitle: {
    color: "#E3F3EC",
    fontSize: 15,
    lineHeight: 22,
  },

  content: {
    paddingHorizontal: 18,
    marginTop: -18,
  },

  statusCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderLeftWidth: 6,
    borderColor: "#E5E7EB",
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },

  statusLabel: {
    color: "#667085",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 7,
    paddingHorizontal: 14,
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
    fontSize: 13,
    fontWeight: "900",
    color: "#0B2F24",
    textTransform: "capitalize",
  },

  issueId: {
    fontSize: 18,
    color: "#98A2B3",
    fontWeight: "900",
  },

  issueImage: {
    width: "100%",
    height: 230,
    borderRadius: 22,
    marginBottom: 14,
    backgroundColor: "#E5E7EB",
  },

  noImageBox: {
    backgroundColor: "#fff",
    height: 170,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  noImageIcon: {
    fontSize: 34,
    marginBottom: 8,
  },

  noImageText: {
    color: "#667085",
    fontWeight: "800",
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 22,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },

  infoRow: {
    marginBottom: 14,
  },

  label: {
    fontSize: 13,
    color: "#667085",
    fontWeight: "800",
    marginBottom: 5,
  },

  value: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "700",
    lineHeight: 22,
  },

  twoColumnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  columnBox: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  commentsText: {
    color: "#475467",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },

  actionSection: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
  },

  assignButton: {
    backgroundColor: "#0B6E4F",
    paddingVertical: 15,
    borderRadius: 16,
    marginBottom: 12,
  },

  assignButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },

  actionButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 16,
    marginBottom: 12,
  },

  closeButton: {
    backgroundColor: "#111827",
    paddingVertical: 15,
    borderRadius: 16,
    marginBottom: 4,
  },

  actionButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F8F7",
    padding: 20,
  },

  loadingText: {
    marginTop: 12,
    color: "#667085",
    fontWeight: "700",
  },

  error: {
    color: "#9B2226",
    fontWeight: "800",
    textAlign: "center",
  },
});
