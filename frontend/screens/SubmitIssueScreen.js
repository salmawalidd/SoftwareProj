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
        "http://192.168.1.20:8000/api/issues",
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
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTag}>COMMUNITY MEMBER</Text>

        <Text style={styles.headerTitle}>Submit Issue</Text>

        <Text style={styles.headerSubtitle}>
          Report maintenance problems with accurate details and photo evidence.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Issue Information</Text>

        <Text style={styles.label}>Category</Text>

        <View style={styles.categoryContainer}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.85}
              style={[
                styles.categoryButton,
                category === item && styles.selectedCategoryButton,
              ]}
              onPress={() => setCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item && styles.selectedCategoryText,
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
          placeholder="Describe the issue in detail..."
          placeholderTextColor="#98A2B3"
          value={description}
          onChangeText={setDescription}
          maxLength={300}
          multiline
        />

        <Text style={styles.characterCount}>
          {description.length} / 300 characters
        </Text>

        <Text style={styles.sectionTitle}>Location Details</Text>

        <Text style={styles.label}>Building</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Building A"
          placeholderTextColor="#98A2B3"
          value={building}
          onChangeText={setBuilding}
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Floor</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. 2"
              placeholderTextColor="#98A2B3"
              value={floor}
              onChangeText={setFloor}
            />
          </View>

          <View style={styles.halfInput}>
            <Text style={styles.label}>Room</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. 101"
              placeholderTextColor="#98A2B3"
              value={room}
              onChangeText={setRoom}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Photo Evidence</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.uploadBox}
          onPress={pickImage}
        >
          <Text style={styles.uploadIcon}>📷</Text>

          <Text style={styles.uploadTitle}>
            {photo ? "Change Issue Photo" : "Upload Issue Photo"}
          </Text>

          <Text style={styles.uploadSubtitle}>
            JPG or PNG photo showing the issue
          </Text>
        </TouchableOpacity>

        {photo && (
          <View style={styles.previewCard}>
            <Image source={{ uri: photo }} style={styles.previewImage} />

            <View style={styles.photoBadge}>
              <Text style={styles.photoBadgeText}>Photo selected</Text>
            </View>
          </View>
        )}

        <View style={styles.dateBox}>
          <Text style={styles.dateText}>Submitted on: {today}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Submit Issue</Text>
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

  formCard: {
    backgroundColor: "#fff",
    marginHorizontal: 18,
    marginTop: -18,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111827",
    marginTop: 8,
    marginBottom: 14,
  },

  label: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 7,
    color: "#475467",
    letterSpacing: 0.4,
  },

  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  categoryButton: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    marginRight: 8,
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
  },

  selectedCategoryButton: {
    backgroundColor: "#0B6E4F",
    borderColor: "#0B6E4F",
  },

  categoryText: {
    color: "#475467",
    fontWeight: "800",
    fontSize: 13,
  },

  selectedCategoryText: {
    color: "#fff",
  },

  input: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },

  textArea: {
    height: 120,
    textAlignVertical: "top",
    marginBottom: 6,
  },

  characterCount: {
    textAlign: "right",
    color: "#667085",
    fontSize: 12,
    marginBottom: 18,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  halfInput: {
    width: "48%",
  },

  uploadBox: {
    borderWidth: 1.5,
    borderColor: "#0B6E4F",
    borderStyle: "dashed",
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: "center",
    backgroundColor: "#ECFDF3",
    marginBottom: 16,
  },

  uploadIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  uploadTitle: {
    color: "#0B6E4F",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 4,
  },

  uploadSubtitle: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  previewCard: {
    marginBottom: 18,
  },

  previewImage: {
    width: "100%",
    height: 190,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
  },

  photoBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#D1FAE5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginTop: 10,
  },

  photoBadgeText: {
    color: "#0B6E4F",
    fontWeight: "900",
    fontSize: 12,
  },

  dateBox: {
    backgroundColor: "#F2F4F7",
    padding: 13,
    borderRadius: 14,
    marginBottom: 18,
  },

  dateText: {
    color: "#475467",
    fontWeight: "800",
    textAlign: "center",
  },

  button: {
    backgroundColor: "#0B6E4F",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 4,
    marginBottom: 6,
    elevation: 3,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },
});
