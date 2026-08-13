import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MyIssueDetailsScreen({ route, navigation }) {
  const { id } = route.params;

  const [issue, setIssue] = useState(null);
  const [error, setError] = useState("");

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

  useEffect(() => {
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
          setError(
            data.message || "Failed to load issue details"
          );
          return;
        }

        setIssue(data);
      } catch (err) {
        console.log("ISSUE DETAILS ERROR:", err);

        setError(
          "Network error while loading issue details"
        );
      }
    };

    fetchIssueDetails();
  }, [id]);

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

  const issuePhoto =
    issue?.photo?.trim() ||
    issue?.photo_url?.trim() ||
    null;

  const completionPhoto =
    issue?.completion_photo?.trim() ||
    null;

  const statusData = getStatusData(issue.status);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTag}>ISSUE DETAILS</Text>

        <Text style={styles.headerTitle}>
          {issue.category || "Maintenance Issue"}
        </Text>

        <Text style={styles.headerSubtitle}>
          Review submitted information, status updates, and facility management
          progress.
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
            source={{ uri: issuePhoto }}
            style={styles.issueImage}
            resizeMode="cover"
            onError={(e) => {
              console.log("IMAGE LOAD ERROR:", e.nativeEvent);
              console.log("FAILED PHOTO URL:", issuePhoto);
            }}
          />
        ) : (
          <View style={styles.noImageBox}>
            <Text style={styles.noImageIcon}>📷</Text>
            <Text style={styles.noImageText}>
              No issue photo available
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Issue Information
          </Text>

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
              <Text style={styles.label}>Assigned Worker</Text>
              <Text style={styles.value}>
                {issue.assign_worker || "Not assigned"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Comments / Updates
          </Text>

          <Text style={styles.commentsText}>
            {issue.comments ||
              issue.updates ||
              "No comments or updates yet."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Completion Photo
          </Text>

          {completionPhoto ? (
            <Image
              source={{ uri: completionPhoto }}
              style={styles.completionImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImageBoxSmall}>
              <Text style={styles.noImageIcon}>🛠️</Text>
              <Text style={styles.noImageText}>
                No completion photo uploaded yet.
              </Text>
            </View>
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
    paddingTop: 58,
    paddingHorizontal: 24,
    paddingBottom: 52,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    alignSelf: "flex-start",
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
    height: 220,
    borderRadius: 22,
    marginBottom: 14,
    backgroundColor: "#E5E7EB",
  },

  completionImage: {
    width: "100%",
    height: 190,
    borderRadius: 18,
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

  noImageBoxSmall: {
    backgroundColor: "#F9FAFB",
    height: 130,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  noImageIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  noImageText: {
    color: "#667085",
    fontWeight: "800",
    textAlign: "center",
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
