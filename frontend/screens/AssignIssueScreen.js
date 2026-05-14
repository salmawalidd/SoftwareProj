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
          `http://192.168.1.25:8000/api/issues/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const issueData = await issueResponse.json();

        const workersResponse = await fetch(
          "http://192.168.1.25:8000/api/manager/workers",
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
        setWorkers(workersData);
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
        `http://192.168.1.25:8000/api/issues/${id}/assign`,
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Assign Issue</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Issue Details</Text>

        <Text style={styles.label}>Category</Text>
        <Text style={styles.value}>{issue?.category}</Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{issue?.description}</Text>

        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>{issue?.location}</Text>

        <Text style={styles.label}>Current Status</Text>
        <Text style={styles.value}>{issue?.status}</Text>

        <Text style={styles.label}>Currently Assigned</Text>
        <Text style={styles.value}>
          {issue?.assign_worker || "Not assigned"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Available Workers</Text>

        {workers.length === 0 ? (
          <Text style={styles.emptyText}>No workers available.</Text>
        ) : (
          workers.map((worker) => (
            <TouchableOpacity
              key={worker.id}
              style={[
                styles.workerButton,
                selectedWorker === worker.name && styles.selectedWorkerButton,
              ]}
              onPress={() => setSelectedWorker(worker.name)}
            >
              <Text
                style={[
                  styles.workerName,
                  selectedWorker === worker.name && styles.selectedWorkerName,
                ]}
              >
                {worker.name}
              </Text>

              <Text
                style={[
                  styles.workerEmail,
                  selectedWorker === worker.name && styles.selectedWorkerEmail,
                ]}
              >
                {worker.email}
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
        onPress={handleAssign}
        disabled={assigning}
      >
        <Text style={styles.assignButtonText}>
          {assigning ? "Assigning..." : "Confirm Assignment"}
        </Text>
      </TouchableOpacity>
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
    marginBottom: 18,
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
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

  workerButton: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    marginBottom: 10,
  },

  selectedWorkerButton: {
    backgroundColor: "#0B6E4F",
    borderColor: "#0B6E4F",
  },

  workerName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  selectedWorkerName: {
    color: "#fff",
  },

  workerEmail: {
    fontSize: 13,
    color: "#667085",
    marginTop: 4,
  },

  selectedWorkerEmail: {
    color: "#EAF4EF",
  },

  assignButton: {
    backgroundColor: "#0B6E4F",
    padding: 16,
    borderRadius: 14,
    marginTop: 4,
    marginBottom: 25,
  },

  disabledButton: {
    opacity: 0.7,
  },

  assignButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },

  emptyText: {
    color: "#667085",
    fontSize: 15,
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