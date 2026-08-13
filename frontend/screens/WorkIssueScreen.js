import React, { useEffect, useState } from "react";
import {
  View,
  Text,
 StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import supabase from "../services/supabase";
import { decode } from "base64-arraybuffer";

export default function WorkIssueScreen({ route, navigation }) {
  const { id } = route.params;

  const [issue, setIssue] = useState(null);
  const [comment, setComment] = useState("");
  const [completionPhoto, setCompletionPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssue();
  }, []);

  const fetchIssue = async () => {
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
        Alert.alert(
          "Error",
          data.message || "Failed to load issue details"
        );
        return;
      }

      setIssue(data);
    } catch (error) {
      console.log("FETCH ISSUE ERROR:", error);
      Alert.alert("Error", "Network error while loading issue");
    } finally {
      setLoading(false);
    }
  };

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
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message);
        return;
      }

      Alert.alert("Success", "Status updated");
      fetchIssue();
    } catch (error) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  const addComment = async () => {
    if (!comment.trim()) {
      Alert.alert("Error", "Enter a comment first");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `http://192.168.1.20:8000/api/issues/${id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ comment }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message);
        return;
      }

      Alert.alert("Success", "Comment added");
      setComment("");
      fetchIssue();
    } catch (error) {
      Alert.alert("Error", "Failed to add comment");
    }
  };

  const pickCompletionPhoto = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const selectedPhoto = result.assets[0].uri;
      const selectedPhotoBase64 = result.assets[0].base64;

      setCompletionPhoto(selectedPhoto);

      uploadCompletionPhoto(selectedPhotoBase64);
    }
  };

  const uploadCompletionPhoto = async (photoBase64) => {
    try {
      if (!photoBase64) {
        Alert.alert("Error", "Image data not found");
        return;
      }

      const token = await AsyncStorage.getItem("token");

      const fileName = `completion-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("issue-photos")
        .upload(fileName, decode(photoBase64), {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        console.log("COMPLETION PHOTO ERROR:", uploadError);
        Alert.alert("Error", "Failed to upload image");
        return;
      }

      const { data } = supabase.storage
        .from("issue-photos")
        .getPublicUrl(fileName);

      const uploadedPhotoUrl = data.publicUrl;

      const response = await fetch(
        `http://192.168.1.20:8000/api/issues/${id}/photo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            photo: uploadedPhotoUrl,
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Error",
          responseData.message || "Failed to upload photo"
        );
        return;
      }

      Alert.alert("Success", "Completion photo uploaded");
      fetchIssue();
    } catch (error) {
      console.log("UPLOAD COMPLETION PHOTO ERROR:", error);
      Alert.alert("Error", "Failed to upload completion photo");
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

    return {
      label: "Pending",
      icon: "●",
      style: styles.pending,
      strip: "#FACC15",
    };
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0B6E4F" />
        <Text style={styles.loadingText}>Loading work issue...</Text>
      </View>
    );
  }

  const statusData = getStatusData(issue?.status);

  const issuePhoto =
    issue?.photo?.trim() || issue?.photo_url?.trim() || null;

  const completionPhotoUrl =
    issue?.completion_photo?.trim() || completionPhoto || null;

  return (
    <ScrollView
      style={styles.screen}
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

        <Text style={styles.headerTag}>WORKER TASK</Text>

        <Text style={styles.headerTitle}>
          {issue?.category || "Assigned Issue"}
        </Text>

        <Text style={styles.headerSubtitle}>
          Review issue details and update work progress.
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

          <Text style={styles.issueId}>#{issue?.id || id}</Text>
        </View>

        {issuePhoto ? (
          <Image
            source={{ uri: issuePhoto }}
            style={styles.image}
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
          <Text style={styles.sectionTitle}>Issue Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>
              {issue?.description || "Not available"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>
              {issue?.location || "Not available"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Assigned Worker</Text>
            <Text style={styles.value}>
              {issue?.assign_worker || "Not assigned"}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Work Comments</Text>

          <Text style={styles.commentsText}>
            {issue?.comments || "No comments yet"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Add update comment..."
            placeholderTextColor="#98A2B3"
            value={comment}
            onChangeText={setComment}
            multiline
          />

          <TouchableOpacity
            style={styles.commentButton}
            activeOpacity={0.85}
            onPress={addComment}
          >
            <Text style={styles.buttonText}>Add Comment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Completion Photo</Text>

          {completionPhotoUrl ? (
            <Image
              source={{ uri: completionPhotoUrl }}
              style={styles.image}
            />
          ) : (
            <View style={styles.noImageBoxSmall}>
              <Text style={styles.noImageIcon}>🛠️</Text>
              <Text style={styles.noImageText}>
                No completion photo uploaded yet
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.commentButton}
            activeOpacity={0.85}
            onPress={pickCompletionPhoto}
          >
            <Text style={styles.buttonText}>
              Upload Completion Photo
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Update Status</Text>

          {issue?.status === "pending" && (
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.85}
              onPress={() => updateStatus("in progress")}
            >
              <Text style={styles.buttonText}>
                Mark In Progress
              </Text>
            </TouchableOpacity>
          )}

          {issue?.status === "in progress" && (
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.85}
              onPress={() => updateStatus("resolved")}
            >
              <Text style={styles.buttonText}>
                Mark Resolved
              </Text>
            </TouchableOpacity>
          )}

          {issue?.status === "resolved" && (
            <View style={styles.resolvedBox}>
              <Text style={styles.resolvedText}>
                Waiting for manager to close this issue.
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F8F7",
  },

  container: {
    paddingBottom: 40,
  },

  header: {
    backgroundColor: "#0B6E4F",
    paddingTop: 52,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
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
    marginBottom: 6,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 6,
  },

  headerSubtitle: {
    color: "#E3F3EC",
    fontSize: 14,
    lineHeight: 20,
  },

  content: {
    paddingHorizontal: 18,
    marginTop: -10,
    paddingBottom: 40,
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

  image: {
    width: "100%",
    height: 220,
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

  noImageBoxSmall: {
    backgroundColor: "#F9FAFB",
    height: 130,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
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

  commentsText: {
    color: "#475467",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 14,
    padding: 14,
    minHeight: 72,
    textAlignVertical: "top",
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },

  commentButton: {
    backgroundColor: "#0B6E4F",
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 12,
  },

  actionButton: {
    backgroundColor: "#0B6E4F",
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 4,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 15,
  },

  resolvedBox: {
    backgroundColor: "#FEF3C7",
    padding: 15,
    borderRadius: 16,
    marginTop: 4,
  },

  resolvedText: {
    color: "#92400E",
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 20,
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
});
