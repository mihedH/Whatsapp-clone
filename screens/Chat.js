import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { app, supabase } from '../config';
import { getDatabase, ref, push, set, onValue, child } from 'firebase/database';
import * as Location from 'expo-location';
import * as ImagePicker from "expo-image-picker";

import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons
//import buffer
import { Buffer } from 'buffer';


const database = getDatabase(app);


export default function Chat(props) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [location, setLocation] = useState(null);
  const [file, setFile] = useState(null);

  const profile = props.route.params.profile;
  const currentId = props.route.params.currentId;
  const idDiscussion = currentId > profile.id ? currentId + profile.id : profile.id + currentId;

  const ref_uneDiscussion = ref(database, `/lesDiscussions/${idDiscussion}`);

  useEffect(() => {
    const messagesListener = onValue(ref_uneDiscussion, (snapshot) => {
      const fetchedMessages = [];
      snapshot.forEach((childSnapshot) => {
        if (childSnapshot.key !== "typing") {
          fetchedMessages.push(childSnapshot.val());
        }
      });
      setMessages(fetchedMessages.reverse());
    });

    const typingListener = onValue(child(ref_uneDiscussion, "typing"), (snapshot) => {
      if (snapshot.val() && snapshot.val() !== currentId) {
        setIsTyping(true);
      } else {
        setIsTyping(false);
      }
    });

    return () => {
      messagesListener();
      typingListener();
    };
  }, []);

  const handleInputChange = (text) => {
    setInputText(text);
    if (text) {
      set(ref(database, `/lesDiscussions/${idDiscussion}/typing`), currentId)
        .catch((error) => {
          console.error("Error setting typing status:", error);
        });
    } else {
      set(ref(database, `/lesDiscussions/${idDiscussion}/typing`), null)
        .catch((error) => {
          console.error("Error clearing typing status:", error);
        });
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === "" && !location && !file) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: currentId,
      date: new Date().toISOString(),
      receiver: profile.id,
      location: location || null,
      file: file || null,
    };

    const newMessageRef = ref(database, `/lesDiscussions/${idDiscussion}`);
    const newMessageKey = push(newMessageRef).key;

    set(ref(database, `/lesDiscussions/${idDiscussion}/${newMessageKey}`), newMessage)
      .then(() => {
        set(ref(database, `/lesDiscussions/${idDiscussion}/typing`), null);
        setInputText("");
        setLocation(null); // Clear location after sending
        setFile(null); // Clear file after sending
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        Alert.alert("Error", "Failed to send the message.");
      });
  };
  const sendLocation = async () => {
    // Ask for location permissions
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission denied", "Location permission is required.");
      return;
    }
  
    // Get user's current location
    const userLocation = await Location.getCurrentPositionAsync({});
    const message = {
      id: Date.now().toString(),
      text: "Shared Location",
      sender: currentId,
      date: new Date().toISOString(),
      receiver: profile.id,
      location: userLocation.coords,
    };
  
    setLocation(userLocation.coords); // Save location for sending
    sendMessageWithDetails(message);
  };
  
  const sendFile = async () => {
    try {
      // Use ImagePicker to select an image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,  // Restrict to images only
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });
  
      // Log the result to see what is returned
      console.log("Image picker result:", result);
  
      // Check if the user canceled the image picker or if the result is invalid
      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.error("Invalid or canceled image selection");
        Alert.alert("Error", "No valid image was selected.");
        return; // Exit if no image was selected or picker was canceled
      }
  
      // Get the selected image URI
      const uriLocal = result.assets[0].uri;
      const response = await fetch(uriLocal);
      const blob = await response.blob();
      const arraybuffer = await new Response(blob).arrayBuffer();
      // Extract the file extension from the image name (assume it has a proper extension)
      await supabase.storage.from("WhatsappCloneStorage").upload(currentId, arraybuffer, {
        upsert: true,
      });
  
      const { data } = supabase.storage.from("WhatsappCloneStorage").getPublicUrl(currentId);
      const publicImageUrl = data.publicUrl;

  
      // Upload the image and get the public URL
  
      // Log the public URL
      console.log("Public Image URL:", publicImageUrl);
  
      // Create the message with the public URL
      const message = {
        id: Date.now().toString(),
        text: "Shared Image",  // You can modify this as needed
        sender: currentId,
        date: new Date().toISOString(),
        receiver: profile.id,
        file: publicImageUrl,  // Set the public URL of the image to be sent
      };
  
      // Log the message object
      console.log("Message object:", message);
  
      // Send the message with the public URL
      sendMessageWithDetails(message); // Send the message with the image URL
      setFile(publicImageUrl); // Update the state with the image public URL
    } catch (error) {
      console.error("Error sending file:", error);
      Alert.alert("Error", error.message || "Failed to send the file.");
    }
  };
  
  
  const sendMessageWithDetails = (message) => {
    const newMessageRef = ref(database, `/lesDiscussions/${idDiscussion}`);
    const newMessageKey = push(newMessageRef).key;

    set(ref(database, `/lesDiscussions/${idDiscussion}/${newMessageKey}`), message)
      .then(() => {
        set(ref(database, `/lesDiscussions/${idDiscussion}/typing`), null);
        setInputText("");
        setLocation(null);
        setFile(null);
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        Alert.alert("Error", "Failed to send the message.");
      });
  };

  const openUrl = (url) => {
    Linking.openURL(url).catch((err) => console.error("Failed to open URL", err));
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === currentId;
    const formattedDate = new Date(item.date).toLocaleTimeString();

    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
        {item.location && (
          <TouchableOpacity onPress={() => openUrl(`https://maps.google.com/?q=${item.location.latitude},${item.location.longitude}`)}>
            <Text style={styles.messageText}>Location: {item.location.latitude}, {item.location.longitude}</Text>
          </TouchableOpacity>
        )}
        {item.file && (
          <TouchableOpacity onPress={() => openUrl(item.file)}>
            <Text style={styles.messageText}>View File</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.timestamp}>{formattedDate}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flexGrow}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          inverted
        />
        {isTyping && <Text style={styles.typingIndicator}>Typing...</Text>}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={handleInputChange}
          />
          <TouchableOpacity onPress={sendLocation} style={styles.iconButton}>
            <MaterialCommunityIcons name="map-marker" size={30} color="#0F52BA" />
          </TouchableOpacity>
          <TouchableOpacity onPress={sendFile} style={styles.iconButton}>
            <MaterialCommunityIcons name="file" size={30} color="#0F52BA" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  flexGrow: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  messageContainer: {
    maxWidth: "75%",
    borderRadius: 20,
    padding: 10,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0F52BA",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "gray",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    color: "#ccc",
    alignSelf: "flex-end",
    marginTop: 5,
  },
  typingIndicator: {
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 10,
    color: "gray",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  iconButton: {
    marginLeft: 10,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#0F52BA",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

