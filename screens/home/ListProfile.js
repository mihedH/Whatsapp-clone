import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableHighlight, StyleSheet, ImageBackground } from "react-native";
import { app } from '../../config'; 
import { getDatabase, ref, onValue, get, serverTimestamp } from 'firebase/database';
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

// Get database instance
const database = getDatabase(app);
const ref_les_profils = ref(database, "/lesprefix");

export default function ListProfile(props) {
  const currentId = props.route.params.currentId;
  const [data, setData] = useState([]);
  const [currentUser, setCurrentUser] = useState(currentId);

  useEffect(() => {
    // Fetch user profiles and their online status
    const fetchProfiles = async () => {
      try {
        const snapshot = await get(ref_les_profils);
        const profiles = [];
        snapshot.forEach((unProfil) => {
          const user = unProfil.val();
          if (user.id !== currentId) {
            // Fetch online status for each user
            const userStatusRef = ref(database, `/status/${user.id}`);
            get(userStatusRef).then((statusSnapshot) => {
              const status = statusSnapshot.val();
              user.isOnline = status && status.state === "online"; // Check if user is online
              profiles.push(user); // Add profile with online status
              // Only update state after collecting all profiles
              if (profiles.length === snapshot.size - 1) { 
               setData(profiles); // Set the state with all profiles at once
}            });
          } else {
            setCurrentUser(unProfil.val());
          }
        });
      } catch (error) {
        console.error('Error fetching profiles :', error);
      }
    };

    fetchProfiles();

    return () => {
      // Cleanup if necessary
    };
  }, [currentId]);

  return (
    <LinearGradient
      colors={["#74a4b8", "#e4f7f1"]}
      style={styles.container}
    >
          <Text style={styles.textstyle}>List Profils</Text>
      <FlatList
      keyExtractor={(item) => item.id}
        data={data}
        renderItem={({ item }) => {
          return (
            <TouchableHighlight
              onPress={() => {
                props.navigation.navigate("Chat", { profile: item, currentId: currentId });
              }}
              underlayColor="#ddd"
              style={styles.contactContainer}
              // key={item.id}
            >
              <View style={styles.contactInner}>
                {/* Profile Image */}
                <Image
                  source={
                    item.urlImage
                      ? { uri: item.urlImage }
                      : require("../../assets/profil.png")
                  }
                  style={styles.profileImage}
                />
                {/* Contact Info */}
                <View style={styles.textContainer}>
                  <Text style={styles.contactName}>{item.nom}</Text>
                  <Text style={styles.contactPseudo}>{item.pseudo}</Text>
                </View>
                {/* Green Dot for online status */}
                {item.isOnline && (
                  <View style={styles.onlineDot}></View>
                )}
              </View>
            </TouchableHighlight>
          );
        }}
        style={styles.listContainer}
      ></FlatList>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  textstyle: {
    fontSize: 40,
    fontFamily: "serif",
    color: "#f4f0e7",
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 20,
  },
  listContainer: {
    width: "100%",
    // padding: 10,
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(248, 248, 248, 0.3)",
    marginBottom: 1,
    borderRadius: 8,
    padding: 12,

  },
  contactInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
    backgroundColor: "#ddd",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  contactPseudo: {
    fontSize: 14,
    color: "#95a5af",
    marginTop: 2,
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "green",
    position: "absolute",
    top: 10,
    right: 10,
  },
});
