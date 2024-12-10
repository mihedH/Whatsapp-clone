import React from 'react';
import { Button, ImageBackground, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { app } from '../config'; // Import the initialized Firebase app



const auth = getAuth(app);

export default function NewUser(props) {
  let email, pwd;

  return (
    <ImageBackground source={require('../assets/background.jpg')} style={styles.container}>
      <View style={styles.container2}>
        <Text style={styles.headerText}>Create account</Text>
        
        <TextInput
          style={styles.textInputStyle}
          keyboardType="email-address"
          placeholder="Enter your email"
          onChangeText={(text) => { email = text; }}
        />
        
        <TextInput
          style={styles.textInputStyle}
          secureTextEntry
          placeholder="Enter your password"
          onChangeText={(text) => { pwd = text; }}
        />
        
        <TextInput
          style={styles.textInputStyle}
          secureTextEntry
          placeholder="Confirm your password"
          onChangeText={(text) => { pwd = text; }}
        />
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Submit" 
            color="#87A878" 
            onPress={() => {
              createUserWithEmailAndPassword(auth,email, pwd)
                .then(() => {
                  const currentId = auth.currentUser.uid;
                  // Navigate to MyProfile with cameFromNewUser flag
                  props.navigation.replace("Home", { 
                    screen: "MyProfile",
                    currentId: currentId,
                    cameFromNewUser: true, // Flag indicating the user came from NewUser
                  });
                })
                .catch((error) => {
                  alert(error);
                });
            }} 
          />
          <Button 
            title="Exit" 
            color="#bb0a21"
            onPress={() => props.navigation.goBack()} 
          />
        </View>
      </View>
      <StatusBar style="dark" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  container2: {
    backgroundColor: "#212738",
    alignItems: "center",
    justifyContent: "center",
    height: 350,
    width: '80%',
    borderRadius: 15,
  },
  headerText: {
    fontSize: 34,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "#b7d2e7",
    marginBottom: 9,
  },
  textInputStyle: {
    height: 45,
    width: "90%",
    paddingLeft: 15,
    backgroundColor: "white",
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 22,
    marginTop: 20,
  },
});
