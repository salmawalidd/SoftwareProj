import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UpdateStatusScreen({ route, navigation }) {
  const { id, currentStatus } = route.params;

  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const getNextStatuses = () => {
    if (currentStatus === "pending") {
      return ["in progress"];
    }

    if (currentStatus === "in progress") {
      return ["resolved"];
    }

    if (currentStatus === "resolved") {
      return ["closed"];
    }

    return [];
  };

  const nextStatuses = getNextStatuses();

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      Alert.alert("Error", "Please select a status first");
      return;
    }

    try {
      setLoading(true);

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
            status: selectedStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Error",
          data.message || "Failed to update status"
        );
        return;
      }

      Alert.alert(
        "Success",
        "Issue status updated successfully"
      );

      navigation.goBack();
    } catch (error) {
      console.log("UPDATE STATUS ERROR:", error);

      Alert.alert(
        "Error",
        "Network error while updating status"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const normalized = status?.toLowerCase();

    if (normalized === "pending") {
      return {
        background: "#FFF4D6",
        border: "#FACC15",
      };
    }

    if (normalized === "in progress") {
      return {
        background: "#DCEBFF",
        border: "#3B82F6",
      };
    }

    if (normalized === "resolved") {
      return {
        background: "#DFF5E8",
        border: "#22C55E",
      };
    }

    if (normalized === "closed") {
      return {
        background: "#E5E7EB",
        border: "#111827",
      };
    }

    return {
      background: "#F3F4F6",
      border: "#D1D5DB",
    };
  };

  const currentStatusStyle = getStatusStyle(currentStatus);

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

        <Text style={styles.headerTag}>STATUS MANAGEMENT</Text>

        <Text style={styles.headerTitle}>
          Update Issue Status
        </Text>

        <Text style={styles.headerSubtitle}>
          Move the maintenance request through the next workflow stage.
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Current Status
          </Text>

          <View
            style={[
              styles.currentStatusBox,
              {
                backgroundColor: currentStatusStyle.background,
                borderColor: currentStatusStyle.border,
              },
            ]}
          >
            <Text style={styles.currentStatusText}>
              ● {currentStatus}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            Allowed Next Status
          </Text>

          {nextStatuses.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>✅</Text>

              <Text style={styles.emptyTitle}>
                No further updates
              </Text>

              <Text style={styles.emptyText}>
                This issue has already completed the workflow.
              </Text>
            </View>
          ) : (
            nextStatuses.map((status) => {
              const statusStyle = getStatusStyle(status);

              return (
                <TouchableOpacity
                  key={status}
                  activeOpacity={0.85}
                  style={[
                    styles.statusButton,
                    {
                      borderColor: statusStyle.border,
                    },
                    selectedStatus === status &&
                      styles.selectedStatusButton,
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: statusStyle.border,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.statusButtonText,
                      selectedStatus === status &&
                        styles.selectedStatusButtonText,
                    ]}
                  >
                    {status}
                  </Text>

                  {selectedStatus === status && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.updateButton,
            (loading || nextStatuses.length === 0) &&
              styles.disabledButton,
          ]}
          activeOpacity={0.85}
          onPress={handleUpdateStatus}
          disabled={loading || nextStatuses.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>
              Confirm Update
            </Text>
          )}
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

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 3,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
  },

  currentStatusBox: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 2,
    marginBottom: 24,
  },

  currentStatusText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    textTransform: "capitalize",
  },

  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: "#F9FAFB",
    marginBottom: 12,
  },

  selectedStatusButton: {
    backgroundColor: "#0B6E4F",
    borderColor: "#0B6E4F",
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },

  statusButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    textTransform: "capitalize",
  },

  selectedStatusButtonText: {
    color: "#fff",
  },

  checkMark: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },

  updateButton: {
    backgroundColor: "#0B6E4F",
    paddingVertical: 17,
    borderRadius: 18,
    elevation: 3,
  },

  disabledButton: {
    opacity: 0.7,
  },

  updateButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },

  emptyBox: {
    backgroundColor: "#F9FAFB",
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 36,
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
