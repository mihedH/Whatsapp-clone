import React from 'react';
import { Button, ImageBackground, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { app } from '../config'; // Import the initialized Firebase app



const auth = getAuth(app);

export default function NewUser(props) {
  let email, pwd;

  return (
    <ImageBackground source={require('../assets/sea.jpg')} style={styles.container}>
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
            color="#007fad" 
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
    backgroundColor: 'rgba(187,226,237,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    height: 400,
    width: '80%',
    borderRadius: 15,
    boxShadow: '0 7px 10px rgba(0, 0, 0, 0.3)',
},
  headerText: {
    fontSize: 34,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "#007fad",
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
