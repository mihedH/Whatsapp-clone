// auth.js
import React, { useState } from 'react';
import { BackHandler, Button, ImageBackground, StatusBar, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { app } from '../config'; // Import the initialized Firebase app

const auth = getAuth(app);
const database = getDatabase(app);

export default function Auth(props) {
    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');

    // Function to update user's status to online in Firebase
    const setUserOnlineStatus = (userId) => {
        const userStatusDatabaseRef = ref(database, `/status/${userId}`);

        // User status data to set online
        const isOnlineForDatabase = {
            state: 'online',
            last_changed: serverTimestamp(),
        };

        // Set the user status to online when they sign in
        set(userStatusDatabaseRef, isOnlineForDatabase);

        // Automatically set user to offline when they disconnect or log out
        onDisconnect(userStatusDatabaseRef).set({
            state: 'offline',
            last_changed: serverTimestamp(),
        });
    };

    return (
        <ImageBackground source={require('../assets/background.jpg')} style={styles.container}>
            <View style={styles.container2}>
                <Text style={styles.headerText}>Bienvenue</Text>
                <TextInput
                    style={styles.textInputStyle}
                    keyboardType="email-address"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.textInputStyle}
                    secureTextEntry
                    placeholder="Enter your password"
                    value={pwd}
                    onChangeText={setPwd}
                />
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={() => {
                            signInWithEmailAndPassword(auth, email, pwd)
                                .then(() => {
                                    const currentId = auth.currentUser.uid;

                                    // Set the user's online status when they log in
                                    setUserOnlineStatus(currentId);

                                    // Navigate to Home screen with currentUserId
                                    props.navigation.navigate('Home', { currentId });
                                })
                                .catch((error) => {
                                    Alert.alert('Error', error.message);
                                });
                        }}
                        title="Submit"
                    />
                    <Button
                        onPress={() => {
                            BackHandler.exitApp();
                        }}
                        title="Exit"
                        color="#bb0a21"
                    />
                </View>
                <Text style={styles.textStyle} onPress={() => { props.navigation.navigate('NewUser'); }}>
                    Create new account?
                </Text>
            </View>
            <StatusBar style="dark" />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container2: {
        backgroundColor: '#212738',
        alignItems: 'center',
        justifyContent: 'center',
        height: 350,
        width: '80%',
        borderRadius: 15,
    },
    headerText: {
        fontSize: 34,
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: '#b7d2e7',
    },
    textInputStyle: {
        height: 45,
        width: '90%',
        paddingLeft: 15,
        backgroundColor: 'white',
        marginTop: 10,
        marginBottom: 5,
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 22,
        marginTop: 20,
    },
    textStyle: {
        color: 'white',
        marginTop: 10,
    },
});
