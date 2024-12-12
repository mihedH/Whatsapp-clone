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
  Image,
  ImageBackground,
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
   // Upload the image and get the public URL
      const { data } = supabase.storage.from("WhatsappCloneStorage").getPublicUrl(currentId);
      const publicImageUrl = data.publicUrl;

      // Log the public URL
      console.log("Public Image URL:", publicImageUrl);
  
      // Create the message with the public URL
      const message = {
        id: Date.now().toString(),
        text: "Shared Image",
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
      <View style={styles.header}>
        <Image
          source={
            profile.urlImage
              ? { uri: profile.urlImage }
              : require("../assets/profil.png")
          }
          style={styles.profileImage}
        />
         <View style={styles.nameAndDotContainer}>
        <View style={styles.textContainer}>
        <Text style={styles.headerText}>
           {profile.nom}
        </Text>
                  <Text style={styles.contactPseudo}>{profile.pseudo}</Text>
                </View>
          {/* Green Dot for online status */}
          {profile.isOnline && (
                  <View style={styles.onlineDot}></View>
                )}  
                </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flexGrow}>
      <ImageBackground source={require('../assets/coc.jpg')} style={styles.container}>
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
            <MaterialCommunityIcons name="map-marker" size={30} color="#3f5779" />
          </TouchableOpacity>
          <TouchableOpacity onPress={sendFile} style={styles.iconButton}>
            <MaterialCommunityIcons name="file" size={30} color="#3f5779" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
        </ImageBackground>
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
    backgroundColor: "#74a4b8",
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
    backgroundColor: "#3f5779",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#3f5779",
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    marginRight: 12,
  },
  contactPseudo: {
    fontSize: 14,
    color: "#95a5af",
    marginTop: 2,
    marginLeft: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10, 
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5, // Makes the dot circular
    backgroundColor: 'green',
    marginTop:10,
  },
  nameAndDotContainer: {
    flexDirection: 'row', // Align the name and dot horizontally
    alignItems: 'flex-start', // Vertically center the name and dot
  },
  textContainer: {
    marginRight: 5,
  },
});

