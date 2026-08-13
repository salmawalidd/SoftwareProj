import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AssignIssueScreen({ route, navigation }) {
  const { id } = route.params;

  const [issue, setIssue] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const issueResponse = await fetch(
          `http://192.168.1.20:8000/api/issues/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const issueData = await issueResponse.json();

        const workersResponse = await fetch(
          "http://192.168.1.20:8000/api/manager/workers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const workersData = await workersResponse.json();

        if (!issueResponse.ok) {
          setError(issueData.message || "Failed to load issue");
          return;
        }

        if (!workersResponse.ok) {
          setError(workersData.message || "Failed to load workers");
          return;
        }

        setIssue(issueData);
        setWorkers(Array.isArray(workersData) ? workersData : []);
      } catch (err) {
        console.log("ASSIGN SCREEN ERROR:", err);
        setError("Network error while loading assignment data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleAssign = async () => {
    if (!selectedWorker) {
      Alert.alert("Error", "Please select a worker first");
      return;
    }

    try {
      setAssigning(true);

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `http://192.168.1.20:8000/api/issues/${id}/assign`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            workerName: selectedWorker,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to assign issue");
        return;
      }

      Alert.alert("Success", "Issue assigned successfully");

      navigation.navigate("ManagerIssues");
    } catch (err) {
      console.log("ASSIGN ISSUE ERROR:", err);
      Alert.alert("Error", "Network error while assigning issue");
    } finally {
      setAssigning(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "W";

    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusLabel = (status) => {
    if (!status) return "Pending";

    return status.replace("_", " ");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0B6E4F" />
        <Text style={styles.loadingText}>Loading assignment data...</Text>
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

        <Text style={styles.headerTag}>FACILITY MANAGER</Text>

        <Text style={styles.headerTitle}>Assign Issue</Text>

        <Text style={styles.headerSubtitle}>
          Select a worker and assign this maintenance request for handling.
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.issueSummaryCard}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.smallLabel}>Issue Category</Text>
              <Text style={styles.issueTitle}>
                {issue?.category || "Issue"}
              </Text>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {getStatusLabel(issue?.status)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.smallLabel}>Description</Text>
          <Text style={styles.value}>
            {issue?.description || "Not available"}
          </Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.smallLabel}>Location</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {issue?.location || "Not available"}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.smallLabel}>Assigned</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {issue?.assign_worker || "Not assigned"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.workerCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Workers</Text>

            <Text style={styles.workerCount}>
              {workers.length} found
            </Text>
          </View>

          {workers.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>👷</Text>
              <Text style={styles.emptyTitle}>No workers available</Text>
              <Text style={styles.emptyText}>
                Add worker accounts before assigning issues.
              </Text>
            </View>
          ) : (
            workers.map((worker) => (
              <TouchableOpacity
                key={worker.id}
                activeOpacity={0.85}
                style={[
                  styles.workerButton,
                  selectedWorker === worker.name &&
                    styles.selectedWorkerButton,
                ]}
                onPress={() => setSelectedWorker(worker.name)}
              >
                <View
                  style={[
                    styles.avatar,
                    selectedWorker === worker.name &&
                      styles.selectedAvatar,
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      selectedWorker === worker.name &&
                        styles.selectedAvatarText,
                    ]}
                  >
                    {getInitials(worker.name)}
                  </Text>
                </View>

                <View style={styles.workerInfo}>
                  <Text
                    style={[
                      styles.workerName,
                      selectedWorker === worker.name &&
                        styles.selectedWorkerName,
                    ]}
                  >
                    {worker.name}
                  </Text>

                  <Text
                    style={[
                      styles.workerEmail,
                      selectedWorker === worker.name &&
                        styles.selectedWorkerEmail,
                    ]}
                  >
                    {worker.email}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.checkMark,
                    selectedWorker === worker.name &&
                      styles.selectedCheckMark,
                  ]}
                >
                  ✓
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.assignButton,
            assigning && styles.disabledButton,
          ]}
          activeOpacity={0.85}
          onPress={handleAssign}
          disabled={assigning}
        >
          <Text style={styles.assignButtonText}>
            {assigning ? "Assigning..." : "Confirm Assignment"}
          </Text>
        </TouchableOpacity>
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

  issueSummaryCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
    elevation: 3,
  },

  summaryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  smallLabel: {
    fontSize: 12,
    color: "#667085",
    fontWeight: "900",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  issueTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },

  statusBadge: {
    backgroundColor: "#FFF4D6",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0B2F24",
    textTransform: "capitalize",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },

  value: {
    fontSize: 15,
    color: "#111827",
    lineHeight: 22,
    fontWeight: "600",
    marginBottom: 14,
  },

  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoBox: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  infoValue: {
    color: "#111827",
    fontWeight: "800",
    fontSize: 13,
    lineHeight: 19,
  },

  workerCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111827",
  },

  workerCount: {
    color: "#0B6E4F",
    backgroundColor: "#ECFDF3",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontWeight: "900",
    fontSize: 12,
  },

  workerButton: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  selectedWorkerButton: {
    backgroundColor: "#0B6E4F",
    borderColor: "#0B6E4F",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F5EF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  selectedAvatar: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  avatarText: {
    color: "#0B6E4F",
    fontWeight: "900",
    fontSize: 14,
  },

  selectedAvatarText: {
    color: "#fff",
  },

  workerInfo: {
    flex: 1,
  },

  workerName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 3,
  },

  selectedWorkerName: {
    color: "#fff",
  },

  workerEmail: {
    fontSize: 13,
    color: "#667085",
    fontWeight: "600",
  },

  selectedWorkerEmail: {
    color: "#EAF4EF",
  },

  checkMark: {
    color: "#D0D5DD",
    fontSize: 20,
    fontWeight: "900",
    marginLeft: 8,
  },

  selectedCheckMark: {
    color: "#fff",
  },

  assignButton: {
    backgroundColor: "#0B6E4F",
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 2,
    marginBottom: 10,
    elevation: 3,
  },

  disabledButton: {
    opacity: 0.7,
  },

  assignButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },

  emptyBox: {
    backgroundColor: "#F9FAFB",
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 34,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },

  emptyText: {
    color: "#667085",
    textAlign: "center",
    lineHeight: 20,
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
