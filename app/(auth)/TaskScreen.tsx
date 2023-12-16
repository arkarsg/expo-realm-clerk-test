// /app/index.js

import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
  FlatList,
} from "react-native";
import { useQuery } from "@realm/react";
import { Task } from "../models/Task";
import { useState } from "react";
import { useRealm } from "@realm/react";

export function TaskScreen() {
  // ref to hold description
  const [description, setDescription] = useState("");
  const realm = useRealm();

  // get the tasks
  const tasks = useQuery(Task);

  const createNewTask = () => {
    realm.write(() => {
      const newTask = new Task(realm, description);
      setDescription("");
      return newTask;
    });
  };

  return (
    <View style={{ height: Dimensions.get("screen").height - 132 }}>
      <Text style={styles.title}>TASK LIST</Text>
      {/* input for description */}
      <TextInput
        placeholder="Enter New Task"
        autoCapitalize="none"
        nativeID="description"
        multiline={true}
        numberOfLines={8}
        value={description}
        onChangeText={(text) => {
          setDescription(text);
        }}
        style={styles.textInput}
      />
      {/*  button to save the new task */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          createNewTask();
        }}
      >
        <Text style={styles.buttonText}>SAVE TASK</Text>
      </TouchableOpacity>
      {/*  Flat list display of tasks */}
      <FlatList
        data={tasks.sorted("createdAt")}
        keyExtractor={(item) => item._id.toHexString()}
        renderItem={({ item }) => {
          return (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                margin: 16,
              }}
            >
              <Pressable
                onPress={() =>
                  realm.write(() => {
                    item.isComplete = !item.isComplete;
                  })
                }
              >
                <Text>{item.isComplete ? "✅" : "☑️"}</Text>
              </Pressable>
              <Text style={{ paddingHorizontal: 10, fontSize: 16 }}>{item.description}</Text>
              <Pressable
                onPress={() => {
                  realm.write(() => {
                    realm.delete(item);
                  });
                }}
              >
                <Text>{"🗑️"}</Text>
              </Pressable>
            </View>
          );
        }}
      ></FlatList>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  title: {
    fontSize: 18,
    margin: 16,
    fontWeight: "700",
  },
  label: {
    marginBottom: 8,
    fontSize: 18,
    fontWeight: "500",
    // color: "#455fff",
  },
  textInput: {
    fontSize: 20,
    borderWidth: 1,
    borderRadius: 4,
    // borderColor: "#455fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 0,
    marginHorizontal: 16,
  },
  button: {
    backgroundColor: "grey",
    padding: 10,
    borderRadius: 5,
    marginTop: 8,
    marginLeft: 16,
    marginBottom: 8,
    width: 120,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 12,
  },
});
