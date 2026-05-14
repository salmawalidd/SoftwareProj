import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MyIssueDetailsScreen({ route }) {
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

  useEffect(() => {
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
            data.message || "Failed to load issue details"
          );
          return;
        }

        console.log("ISSUE DETAILS DATA:", data);
        console.log("ISSUE PHOTO:", data.photo);

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
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  const issuePhoto =
    issue?.photo?.trim() ||
    issue?.photo_url?.trim() ||
    null;

  const statusData = getStatusData(issue.status);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {issue.category}
      </Text>

      <View
        style={[
          styles.statusBox,
          statusData.style,
        ]}
      >
        <Text style={styles.statusText}>
          {statusData.icon} {issue.status}
        </Text>
      </View>

      {issuePhoto ? (
        <Image
          source={{ uri: issuePhoto }}
          style={styles.issueImage}
          resizeMode="cover"
          onError={(e) => {
            console.log(
              "IMAGE LOAD ERROR:",
              e.nativeEvent
            );
            console.log("FAILED PHOTO URL:", issuePhoto);
          }}
        />
      ) : (
        <View style={styles.noImageBox}>
          <Text style={styles.noImageText}>
            No photo available
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>
          Description
        </Text>

        <Text style={styles.value}>
          {issue.description}
        </Text>

        <Text style={styles.label}>
          Location
        </Text>

        <Text style={styles.value}>
          {issue.location}
        </Text>

        <Text style={styles.label}>
          Date Submitted
        </Text>

        <Text style={styles.value}>
          {formatDate(
            issue.created_at || issue.date
          )}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Comments / Updates
        </Text>

        <Text style={styles.value}>
          {issue.comments ||
            issue.updates ||
            "No comments or updates yet."}
        </Text>
      </View>
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

  noImageBox: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    marginBottom: 16,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  noImageText: {
    color: "#667085",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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