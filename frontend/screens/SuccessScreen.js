import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function SuccessScreen({
  route,
  navigation,
}) {
  const { trackingId } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.successCircle}>
        <Text style={styles.checkmark}>✓</Text>
      </View>

      <Text style={styles.title}>
        Issue Submitted Successfully
      </Text>

      <Text style={styles.subtitle}>
        Your maintenance request has been received and sent to the facility
        management team for review.
      </Text>

      <View style={styles.trackingCard}>
        <Text style={styles.trackingLabel}>
          TRACKING ID
        </Text>

        <Text style={styles.tracking}>
          #{trackingId}
        </Text>

        <Text style={styles.trackingInfo}>
          Use this ID to track your issue status inside the app.
        </Text>
      </View>

      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📩</Text>

          <Text style={styles.infoText}>
            Your issue was submitted successfully.
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🛠️</Text>

          <Text style={styles.infoText}>
            A facility manager will review and assign the issue.
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>

          <Text style={styles.infoText}>
            You can monitor updates from the “My Issues” screen.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("Dashboard")}
      >
        <Text style={styles.buttonText}>
          Back to Dashboard
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F6F8F7",
  },

  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E8F5EF",
    borderWidth: 4,
    borderColor: "#0B6E4F",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 28,
  },

  checkmark: {
    fontSize: 60,
    color: "#0B6E4F",
    fontWeight: "900",
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    color: "#0B2F24",
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    color: "#667085",
    marginBottom: 28,
    paddingHorizontal: 10,
  },

  trackingCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    marginBottom: 18,
    elevation: 3,
  },

  trackingLabel: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  tracking: {
    fontSize: 34,
    fontWeight: "900",
    color: "#0B6E4F",
    marginBottom: 10,
  },

  trackingInfo: {
    color: "#667085",
    textAlign: "center",
    lineHeight: 20,
    fontSize: 13,
  },

  infoBox: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 24,
    elevation: 2,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  infoIcon: {
    fontSize: 18,
    marginRight: 12,
    marginTop: 1,
  },

  infoText: {
    flex: 1,
    color: "#475467",
    lineHeight: 22,
    fontSize: 14,
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#0B6E4F",
    paddingVertical: 17,
    borderRadius: 18,
    elevation: 3,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
  },
});
