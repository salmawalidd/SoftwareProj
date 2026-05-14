import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "../services/supabase";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";

export default function SubmitIssueScreen({ navigation }) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);

  const categories = [
    "Maintenance",
    "Electrical",
    "Plumbing",
    "Cleaning",
    "Furniture",
    "Internet",
  ];

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const pickImage = async () => {
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
      setPhoto(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64);
    }
  };

  const uploadImageToSupabase = async () => {
    try {
      if (!photoBase64) {
        Alert.alert("Upload Error", "Image data not found");
        return null;
      }

      const fileName = `issue-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("issue-photos")
        .upload(fileName, decode(photoBase64), {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        console.log("SUPABASE UPLOAD ERROR:", uploadError);
        Alert.alert("Upload Error", "Failed to upload image");
        return null;
      }

      const { data } = supabase.storage
        .from("issue-photos")
        .getPublicUrl(fileName);

      console.log("PUBLIC PHOTO URL:", data.publicUrl);

      return data.publicUrl;
    } catch (error) {
      console.log("IMAGE UPLOAD ERROR:", error);
      Alert.alert("Upload Error", "Image upload failed");
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!category || !description || !building) {
      Alert.alert(
        "Error",
        "Please fill category, description, and building"
      );
      return;
    }

    if (description.length < 10) {
      Alert.alert(
        "Error",
        "Description must be at least 10 characters"
      );
      return;
    }

    if (!photo) {
      Alert.alert("Error", "Please upload an issue photo");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      const uploadedPhotoUrl = await uploadImageToSupabase();

      if (!uploadedPhotoUrl) {
        return;
      }

      const location = `${building}, Floor ${
        floor || "-"
      }, Room ${room || "-"}`;

      const response = await fetch(
        "http://192.168.1.25:8000/api/issues",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category,
            description,
            building,
            floor,
            room,
            location,
            photo: uploadedPhotoUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Error",
          data.message || "Failed to submit issue"
        );
        return;
      }

      const trackingId =
        data.trackingId ||
        data.id ||
        Math.floor(100000 + Math.random() * 900000);

      navigation.navigate("Success", {
        trackingId,
      });
    } catch (error) {
      console.log("SUBMIT ISSUE ERROR:", error);
      Alert.alert(
        "Error",
        "Network error while submitting issue"
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Submit Issue</Text>

      <Text style={styles.label}>Category</Text>

      <View style={styles.categoryContainer}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.categoryButton,
              category === item &&
                styles.selectedCategoryButton,
            ]}
            onPress={() => setCategory(item)}
          >
            <Text
              style={[
                styles.categoryText,
                category === item &&
                  styles.selectedCategoryText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Description</Text>

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the issue"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        maxLength={300}
        multiline
      />

      <Text style={styles.characterCount}>
        {description.length} / 300 characters
      </Text>

      <Text style={styles.label}>Building</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter building"
        placeholderTextColor="#888"
        value={building}
        onChangeText={setBuilding}
      />

      <Text style={styles.label}>Floor</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter floor"
        placeholderTextColor="#888"
        value={floor}
        onChangeText={setFloor}
      />

      <Text style={styles.label}>Room</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter room"
        placeholderTextColor="#888"
        value={room}
        onChangeText={setRoom}
      />

      <Text style={styles.label}>Issue Photo</Text>

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={pickImage}
      >
        <Text style={styles.uploadButtonText}>
          {photo ? "Change Photo" : "Upload Photo"}
        </Text>
      </TouchableOpacity>

      {photo && (
        <Image
          source={{ uri: photo }}
          style={styles.previewImage}
        />
      )}

      <View style={styles.dateBox}>
        <Text style={styles.dateText}>
          Submitted on: {today}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>
          Submit Issue
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: "#0B6E4F",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },

  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  categoryButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 10,
    backgroundColor: "#F5F5F5",
  },

  selectedCategoryButton: {
    backgroundColor: "#0B6E4F",
    borderColor: "#0B6E4F",
  },

  categoryText: {
    color: "#333",
    fontWeight: "600",
  },

  selectedCategoryText: {
    color: "white",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: "#F5F5F5",
  },

  textArea: {
    height: 90,
    textAlignVertical: "top",
    marginBottom: 6,
  },

  characterCount: {
    textAlign: "right",
    color: "#666",
    fontSize: 12,
    marginBottom: 18,
  },

  uploadButton: {
    borderWidth: 1,
    borderColor: "#0B6E4F",
    padding: 14,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#F5F5F5",
  },

  uploadButtonText: {
    color: "#0B6E4F",
    textAlign: "center",
    fontWeight: "bold",
  },

  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 18,
  },

  dateBox: {
    backgroundColor: "#EAF4EF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 18,
  },

  dateText: {
    color: "#0B6E4F",
    fontWeight: "600",
    textAlign: "center",
  },

  button: {
    backgroundColor: "#0B6E4F",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 25,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});