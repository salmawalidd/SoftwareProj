import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function SuccessScreen({ route, navigation }) {

  const { trackingId } = route.params;

  return (

    <View style={styles.container}>

      <Text style={styles.checkmark}>
        ✓
      </Text>

      <Text style={styles.title}>
        Issue Submitted Successfully
      </Text>

      <Text style={styles.tracking}>
        Tracking ID: #{trackingId}
      </Text>

      <TouchableOpacity
        style={styles.button}
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
    alignItems: "center",
    padding: 25,
    backgroundColor: "#fff",
  },

  checkmark: {
    fontSize: 80,
    color: "#0B6E4F",
    marginBottom: 20,
    fontWeight: "bold",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0B6E4F",
    marginBottom: 15,
  },

  tracking: {
    fontSize: 18,
    color: "#333",
    marginBottom: 35,
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#0B6E4F",
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 10,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

});