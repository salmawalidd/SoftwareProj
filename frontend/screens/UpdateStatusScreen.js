import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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
        `http://192.168.1.25:8000/api/issues/${id}/status`,
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
        Alert.alert("Error", data.message || "Failed to update status");
        return;
      }

      Alert.alert("Success", "Issue status updated successfully");

      navigation.goBack();
    } catch (error) {
      console.log("UPDATE STATUS ERROR:", error);
      Alert.alert("Error", "Network error while updating status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Status</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Current Status</Text>
        <Text style={styles.currentStatus}>{currentStatus}</Text>

        <Text style={styles.label}>Allowed Next Status</Text>

        {nextStatuses.length === 0 ? (
          <Text style={styles.emptyText}>
            This issue cannot be updated further.
          </Text>
        ) : (
          nextStatuses.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                selectedStatus === status && styles.selectedStatusButton,
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  selectedStatus === status && styles.selectedStatusButtonText,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.updateButton,
          loading && styles.disabledButton,
        ]}
        onPress={handleUpdateStatus}
        disabled={loading || nextStatuses.length === 0}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.updateButtonText}>Confirm Update</Text>
        )}
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

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0B2F24",
    marginBottom: 18,
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    color: "#667085",
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 10,
  },

  currentStatus: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    textTransform: "capitalize",
    marginBottom: 12,
  },

  statusButton: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    marginBottom: 10,
  },

  selectedStatusButton: {
    backgroundColor: "#0B6E4F",
    borderColor: "#0B6E4F",
  },

  statusButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    textTransform: "capitalize",
  },

  selectedStatusButtonText: {
    color: "#fff",
  },

  updateButton: {
    backgroundColor: "#0B6E4F",
    padding: 16,
    borderRadius: 14,
  },

  disabledButton: {
    opacity: 0.7,
  },

  updateButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },

  emptyText: {
    color: "#667085",
    fontSize: 15,
    marginTop: 6,
  },
});