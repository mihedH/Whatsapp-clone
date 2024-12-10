import React, { useState, useEffect } from "react";
import { BackHandler, Alert, Image, ImageBackground, StyleSheet, Text, TextInput, TouchableHighlight } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { app, supabase } from "../../config";
import { getDatabase, get, ref, set, child, serverTimestamp } from "firebase/database";  // Firebase v9+ imports
import { initializeApp } from "firebase/app";  // Ensure Firebase initialization

const database = getDatabase(app);

export default function MyProfile(props) {
  const currentId = props.route.params.currentId;
  const cameFromNewUser = props.route.params.cameFromNewUser;
  const isProfileSaved = props.route.params.isProfileSaved;

  const [nom, setNom] = useState("");
  const [pseudo, setpseudo] = useState("");
  const [telephone, setTelephone] = useState("");
  const [isDefaultImage, setisDefaultImage] = useState(true);
  const [uriLocalImage, setUriLocalImage] = useState(null);
  const [isSaved, setIsSaved] = useState(false); // Track if profile is saved

  // Fetch user data from Firebase
  useEffect(() => {
    // Define the reference to the user's profile
    const ref_unprofil = ref(database, `/lesprefix/unprofil_${currentId}`);

    get(ref_unprofil).then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        setNom(data.nom || "");
        setpseudo(data.pseudo || "");
        setTelephone(data.telephone || "");
        if (data.urlImage) {
          setUriLocalImage(data.urlImage);
          setisDefaultImage(false);
        }
      }
    }).catch((error) => {
      console.error("Error fetching data:", error);
    });

    // Intercept back button press
    const backAction = () => {
      if (cameFromNewUser && !isSaved) {
        alert("Please fill and save your profile before switching tabs.");
        return true; 
      }
      return false; 
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, [cameFromNewUser, isSaved, currentId]);

  const uploadImageToStorage = async (uriLocal) => {
    const response = await fetch(uriLocal);
    const blob = await response.blob();
    const arraybuffer = await new Response(blob).arrayBuffer();

    // Upload to storage
    await supabase.storage.from("WhatsappCloneStorage").upload(currentId, arraybuffer, {
      upsert: true,
    });

    const { data } = supabase.storage.from("WhatsappCloneStorage").getPublicUrl(currentId);
    const result = data.publicUrl;
    return result;
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setUriLocalImage(result.assets[0].uri);
      setisDefaultImage(false);
      setIsSaved(false); // Mark as unsaved
    }
  };

  const saveProfile = async () => {
    if (!nom || !pseudo || !telephone) {
      alert("Please fill all fields before saving.");
      return;
    }

    let urlImage = isDefaultImage ? null : await uploadImageToStorage(uriLocalImage);

    // Define the reference to save user profile
    const ref_unprofil = ref(database, `/lesprefix/unprofil_${currentId}`);

    set(ref_unprofil, {
      id: currentId,
      nom,
      pseudo,
      telephone,
      urlImage,
    })
      .then(() => {
        alert("Profile updated successfully!");
        setIsSaved(true); // Mark as saved
        props.onProfileSave(true); // Notify parent component (Home) that the profile is saved
      })
      .catch((error) => {
        alert("Error saving profile: " + error.message);
      });
  };



  return (
    <ImageBackground source={require("../../assets/imgbleu.jpg")} style={styles.container}>
      <Text style={styles.textstyle}>My Account</Text>
      <TouchableHighlight onPress={pickImage}>
        <Image
          source={isDefaultImage ? require("../../assets/profil.png") : { uri: uriLocalImage }}
          style={{
            height: 200,
            width: 200,
            borderRadius: 100,
          }}
        />
      </TouchableHighlight>
      <TextInput
        value={nom}
        onChangeText={(text) => {
          setNom(text);
          setIsSaved(false); // Mark as unsaved when any field changes
        }}
        textAlign="center"
        placeholderTextColor="#fff"
        placeholder="Nom"
        keyboardType="default"
        style={styles.textinputstyle}
      />
      <TextInput
        value={pseudo}
        onChangeText={(text) => {
          setpseudo(text);
          setIsSaved(false); // Mark as unsaved when any field changes
        }}
        textAlign="center"
        placeholderTextColor="#fff"
        placeholder="Pseudo"
        keyboardType="default"
        style={styles.textinputstyle}
      />
      <TextInput
        value={telephone}
        onChangeText={(text) => {
          setTelephone(text);
          setIsSaved(false); // Mark as unsaved when any field changes
        }}
        placeholderTextColor="#fff"
        textAlign="center"
        placeholder="Numero"
        style={styles.textinputstyle}
      />
      <TouchableHighlight
        onPress={saveProfile}
        activeOpacity={0.5}
        underlayColor="#DDDDDD"
        style={{
          marginBottom: 10,
          borderColor: "#00f",
          borderWidth: 2,
          backgroundColor: "#08f6",
          textstyle: "italic",
          fontSize: 24,
          height: 60,
          width: "50%",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 5,
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#FFF", fontSize: 24 }}>Save</Text>
      </TouchableHighlight>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  textinputstyle: {
    fontWeight: "bold",
    backgroundColor: "#0004",
    fontSize: 20,
    color: "#fff",
    width: "75%",
    height: 50,
    borderRadius: 10,
    margin: 5,
  },
  textstyle: {
    fontSize: 40,
    fontFamily: "serif",
    color: "#07f",
    fontWeight: "bold",
  },
  container: {
    color: "blue",
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
