import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../context/AuthContext";
import KialLogo from "../../components/ui/KialLogo";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.error || "Failed to sign in");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Full Screen Gradient */}
      <LinearGradient
        colors={["#DC2626", "#B91C1C"]} // Tailwind red-600 to red-700
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Abstract Glow inside header */}
        <View style={styles.headerGlow} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Branding Section - Centered */}
          <View style={styles.brandingContainer}>
            <View style={styles.logoWrapper}>
              <KialLogo width={76} height={76} color="#FFFFFF" brandColor="#FFFFFF" />
            </View>
            
          </View>

          {/* Form Section */}
          <View style={styles.formWrapper}>
            
            {error ? (
              <View style={styles.alertBox}>
                <Ionicons name="alert-circle" size={18} color="#FFFFFF" />
                <Text style={styles.alertText}>{error}</Text>
              </View>
            ) : null}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ID</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={18} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="officer@kial.aero"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIconContainer}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={18} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Keep Me Signed In */}
            <TouchableOpacity 
              style={styles.checkboxRow} 
              onPress={() => setKeepSignedIn(!keepSignedIn)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, keepSignedIn && styles.checkboxChecked]}>
                {keepSignedIn && <Ionicons name="checkmark" size={14} color="#DC2626" />}
              </View>
              <Text style={styles.checkboxLabel}>Keep me signed in</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleLogin} 
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#DC2626" />
              ) : (
                <View style={styles.submitContent}>
                  <Text style={styles.submitText}>Access Dashboard</Text>
                  <Ionicons name="arrow-forward" size={18} color="#DC2626" style={styles.submitIcon} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} KIAL SECURITY DEPT.
          </Text>
          
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B91C1C",
  },
  gradientBackground: {
    flex: 1,
  },
  headerGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 125,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
  },
  
  // Branding
  brandingContainer: {
    marginBottom: 32,
    alignItems: "center", // Centers the logo and title
  },
  logoWrapper: {
    width: 110, 
    height: 110, 
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16, 
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 16, 
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 2, // Added slightly more tracking since it's a standalone acronym now
    textAlign: "center",
  },

  // Form Wrapper
  formWrapper: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    padding: 24,
    marginBottom: 24,
  },

  // Alert Box
  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  alertText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },

  // Inputs
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    borderRadius: 12,
    height: 54,
    borderWidth: 1,
    outline: "none",
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    outline: "none",
    color: "#FFFFFF",
    height: "100%",
    paddingRight: 16,
  },
  eyeIconContainer: {
    paddingHorizontal: 16,
    height: "100%",
    justifyContent: "center",
  },

  // Checkbox
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#FFFFFF",
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Button
  submitButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: "#DC2626",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  submitIcon: {
    marginLeft: 8,
  },

  // Footer
  footerText: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 20,
  },
});