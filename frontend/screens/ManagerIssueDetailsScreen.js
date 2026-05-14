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
        `http://192.168.1.25:8000/api/issues/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to load issue details"
        );
        return;
      }

      setIssue(data);
    } catch (err) {
      console.log(
        "MANAGER ISSUE DETAILS ERROR:",
        err
      );

      setError(
        "Network error while loading issue details"
      );
    }
  };

  useEffect(() => {
    fetchIssueDetails();
  }, [id]);

  const updateStatus = async (status) => {
    try {
      const token =
        await AsyncStorage.getItem(
          "token"
        );

      const response = await fetch(
        `http://192.168.1.25:8000/api/issues/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Error",
          data.message
        );

        return;
      }

      Alert.alert(
        "Success",
        "Status updated"
      );

      fetchIssueDetails();
    } catch (error) {
      console.log(
        "STATUS UPDATE ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Failed to update status"
      );
    }
  };

  const getStatusData = (status) => {
    const normalized =
      status?.toLowerCase();

    if (normalized === "pending") {
      return {
        icon: "🟡",
        style: styles.pending,
      };
    }

    if (
      normalized === "in progress" ||
      normalized === "in_progress"
    ) {
      return {
        icon: "🔵",
        style: styles.inProgress,
      };
    }

    if (normalized === "resolved") {
      return {
        icon: "🟢",
        style: styles.resolved,
      };
    }

    if (normalized === "closed") {
      return {
        icon: "⚫",
        style: styles.closed,
      };
    }

    return {
      icon: "🟡",
      style: styles.pending,
    };
  };

  const formatDate = (dateValue) => {
    if (!dateValue)
      return "Not available";

    const date = new Date(dateValue);

    if (isNaN(date.getTime()))
      return "Not available";

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  if (!issue && !error) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#0B6E4F"
        />

        <Text style={styles.loadingText}>
          Loading issue details...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error}
        </Text>
      </View>
    );
  }

  const statusData = getStatusData(
    issue.status
  );

  const issuePhoto =
    issue?.photo?.trim() ||
    issue?.photo_url?.trim() ||
    null;

  return (
    <ScrollView
      contentContainerStyle={
        styles.container
      }
    >
      <Text style={styles.title}>
        {issue.category ||
          "Issue Details"}
      </Text>

      <View
        style={[
          styles.statusBox,
          statusData.style,
        ]}
      >
        <Text style={styles.statusText}>
          {statusData.icon}{" "}
          {issue.status || "pending"}
        </Text>
      </View>

      {issuePhoto ? (
        <Image
          source={{
            uri: issuePhoto,
          }}
          style={styles.issueImage}
        />
      ) : null}

      <View style={styles.card}>
        <Text
          style={styles.sectionTitle}
        >
          Issue Information
        </Text>

        <Text style={styles.label}>
          Description
        </Text>

        <Text style={styles.value}>
          {issue.description ||
            "Not available"}
        </Text>

        <Text style={styles.label}>
          Location
        </Text>

        <Text style={styles.value}>
          {issue.location ||
            "Not available"}
        </Text>

        <Text style={styles.label}>
          Date Submitted
        </Text>

        <Text style={styles.value}>
          {formatDate(
            issue.created_at ||
              issue.date
          )}
        </Text>

        <Text style={styles.label}>
          Assigned Worker
        </Text>

        <Text style={styles.value}>
          {issue.assign_worker ||
            "Not assigned"}
        </Text>

        <Text style={styles.label}>
          Submitted By User ID
        </Text>

        <Text style={styles.value}>
          {issue.user_id ||
            "Not available"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text
          style={styles.sectionTitle}
        >
          Comments / Updates
        </Text>

        <Text style={styles.value}>
          {issue.comments ||
            issue.updates ||
            "No comments or updates yet."}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.assignButton}
        onPress={() =>
          navigation.navigate(
            "AssignIssue",
            {
              id: issue.id,
            }
          )
        }
      >
        <Text
          style={
            styles.assignButtonText
          }
        >
          Assign Worker
        </Text>
      </TouchableOpacity>

      {issue.status ===
        "pending" && (
        <TouchableOpacity
          style={
            styles.actionButton
          }
          onPress={() =>
            updateStatus(
              "in progress"
            )
          }
        >
          <Text
            style={
              styles.actionButtonText
            }
          >
            Mark In Progress
          </Text>
        </TouchableOpacity>
      )}

      {issue.status ===
        "in progress" && (
        <TouchableOpacity
          style={
            styles.actionButton
          }
          onPress={() =>
            updateStatus(
              "resolved"
            )
          }
        >
          <Text
            style={
              styles.actionButtonText
            }
          >
            Mark Resolved
          </Text>
        </TouchableOpacity>
      )}

      {issue.status ===
        "resolved" && (
        <TouchableOpacity
          style={
            styles.closeButton
          }
          onPress={() =>
            updateStatus("closed")
          }
        >
          <Text
            style={
              styles.actionButtonText
            }
          >
            Close Issue
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 22,
    backgroundColor: "#F6F8F7",
    flexGrow: 1,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0B2F24",
    marginBottom: 12,
  },

  statusBox: {
    alignSelf: "flex-start",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 18,
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
    fontWeight: "800",
    color: "#0B2F24",
    textTransform: "capitalize",
  },

  issueImage: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    marginBottom: 16,
    backgroundColor: "#E5E7EB",
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },

  label: {
    fontSize: 13,
    color: "#667085",
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 4,
  },

  value: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 6,
    lineHeight: 22,
  },

  assignButton: {
    backgroundColor: "#0B6E4F",
    padding: 16,
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 12,
  },

  assignButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },

  actionButton: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  closeButton: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 14,
    marginBottom: 30,
  },

  actionButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "800",
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
    fontWeight: "600",
  },

  error: {
    color: "#9B2226",
    fontWeight: "700",
    textAlign: "center",
  },
});