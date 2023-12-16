import { StatusBar } from "expo-status-bar";
import { StyleSheet, Pressable, Text, View } from "react-native";
import { useRealmAuthTriggers } from "../hooks/useRealmAuthTriggers";

export function LoginScreen() {
  const { logInSuccess, registerSuccessfully } = useRealmAuthTriggers();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ fontSize: 32, fontWeight: "bold" }}>
          Log or Register
        </Text>
      </View>
      <StatusBar style="auto" />
      <View style={styles.main}>
        <View style={styles.section}>
          <Pressable onPress={registerSuccessfully}>
            <Text>Register</Text>
          </Pressable>
        </View>
        <View style={styles.separator} />
        <View style={styles.section}>
         <Pressable onPress={logInSuccess}>
            <Text>Log in</Text>
          </Pressable> 
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  title: {
    textAlign: "center",
    fontSize: 20,
  },
  subtitle: {
    marginVertical: 10,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "normal",
  },
  info: {
    textAlign: "center",
    fontStyle: "italic",
  },
  main: {
    marginTop: 20,
  },
  section: {
    marginVertical: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
  separator: {
    height: 1,
  },
  button: {
    marginVertical: 8,
  },
});
