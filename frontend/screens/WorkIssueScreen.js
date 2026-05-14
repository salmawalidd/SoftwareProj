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

export default function WorkIssueScreen({ route }) {
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
        `http://192.168.1.25:8000/api/issues/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setIssue(data);
    } catch (error) {
      console.log("FETCH ISSUE ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `http://192.168.1.25:8000/api/issues/${id}/status`,
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
    if (!comment) {
      Alert.alert("Error", "Enter a comment first");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `http://192.168.1.25:8000/api/issues/${id}/comments`,
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
      Alert.alert(
        "Permission needed",
        "Please allow photo access"
      );
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
        `http://192.168.1.25:8000/api/issues/${id}/photo`,
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0B6E4F" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {issue?.category}
      </Text>

      <View style={styles.statusBox}>
        <Text style={styles.statusText}>
          {issue?.status}
        </Text>
      </View>

      {issue?.photo ? (
        <Image
          source={{ uri: issue.photo.trim() }}
          style={styles.image}
        />
      ) : null}

      <View style={styles.card}>
        <Text style={styles.label}>Description</Text>

        <Text style={styles.value}>
          {issue?.description}
        </Text>

        <Text style={styles.label}>Location</Text>

        <Text style={styles.value}>
          {issue?.location}
        </Text>

        <Text style={styles.label}>Assigned Worker</Text>

        <Text style={styles.value}>
          {issue?.assign_worker || "Not assigned"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Comments</Text>

        <Text style={styles.value}>
          {issue?.comments || "No comments yet"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Add update comment..."
          value={comment}
          onChangeText={setComment}
        />

        <TouchableOpacity
          style={styles.commentButton}
          onPress={addComment}
        >
          <Text style={styles.buttonText}>
            Add Comment
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Completion Photo
        </Text>

        {issue?.completion_photo ? (
          <Image
            source={{
              uri: issue.completion_photo.trim(),
            }}
            style={styles.image}
          />
        ) : null}

        {!issue?.completion_photo && completionPhoto ? (
          <Image
            source={{ uri: completionPhoto }}
            style={styles.image}
          />
        ) : null}

        <TouchableOpacity
          style={styles.commentButton}
          onPress={pickCompletionPhoto}
        >
          <Text style={styles.buttonText}>
            Upload Completion Photo
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Update Status
        </Text>

        {issue?.status === "pending" && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              updateStatus("in progress")
            }
          >
            <Text style={styles.buttonText}>
              Mark In Progress
            </Text>
          </TouchableOpacity>
        )}

        {issue?.status === "in progress" && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              updateStatus("resolved")
            }
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
    backgroundColor: "#DCEBFF",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 30,
    marginBottom: 18,
  },

  statusText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0B2F24",
    textTransform: "capitalize",
  },

  image: {
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
    marginBottom: 8,
    lineHeight: 22,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    backgroundColor: "#fff",
  },

  commentButton: {
    backgroundColor: "#0B6E4F",
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
  },

  actionButton: {
    backgroundColor: "#0B6E4F",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "800",
  },

  resolvedBox: {
    backgroundColor: "#FEF3C7",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  resolvedText: {
    color: "#92400E",
    fontWeight: "700",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F8F7",
  },
});