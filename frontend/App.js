import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import DashboardScreen from "./screens/DashboardScreen";
import SubmitIssueScreen from "./screens/SubmitIssueScreen";
import SuccessScreen from "./screens/SuccessScreen";
import MyIssuesScreen from "./screens/MyIssuesScreen";
import MyIssueDetailsScreen from "./screens/MyIssueDetailsScreen";
import ManagerIssuesScreen from "./screens/ManagerIssuesScreen";
import ManagerIssueDetailsScreen from "./screens/ManagerIssueDetailsScreen";
import AssignIssueScreen from "./screens/AssignIssueScreen";
import UpdateStatusScreen from "./screens/UpdateStatusScreen";
import AssignedIssuesScreen from "./screens/AssignedIssuesScreen";
import WorkIssueScreen from "./screens/WorkIssueScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />

        <Stack.Screen name="Register" component={RegisterScreen} />

        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        <Stack.Screen name="Dashboard" component={DashboardScreen} />

        <Stack.Screen name="SubmitIssue" component={SubmitIssueScreen} />

        <Stack.Screen name="Success" component={SuccessScreen} />

        <Stack.Screen
          name="MyIssues"
          component={MyIssuesScreen}
          options={{ title: "My Issues" }}
        />

        <Stack.Screen
          name="MyIssueDetails"
          component={MyIssueDetailsScreen}
          options={{ title: "Issue Details" }}
        />

        <Stack.Screen
          name="ManagerIssues"
          component={ManagerIssuesScreen}
          options={{ title: "All Issues" }}
        />

        <Stack.Screen
          name="ManagerIssueDetails"
          component={ManagerIssueDetailsScreen}
          options={{ title: "Manager Issue Details" }}
        />

        <Stack.Screen
          name="AssignIssue"
          component={AssignIssueScreen}
          options={{ title: "Assign Issue" }}
        />

        <Stack.Screen
          name="UpdateStatus"
          component={UpdateStatusScreen}
          options={{ title: "Update Status" }}
        />

        <Stack.Screen
          name="AssignedIssues"
          component={AssignedIssuesScreen}
          options={{ title: "Assigned Issues" }}
        />

        <Stack.Screen
          name="WorkIssue"
          component={WorkIssueScreen}
          options={{ title: "Work Issue" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}