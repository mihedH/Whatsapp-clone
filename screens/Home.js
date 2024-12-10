import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import ListProfile from '../screens/home/ListProfile'
import MyProfile from './home/MyProfile';
import Group from './home/Group';
import Icon from "react-native-vector-icons/MaterialIcons";
import { app } from '../config'; 
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth(app);
const Tab = createMaterialBottomTabNavigator();

export default function Home(props) {
  const currentId = props.route.params.currentId;

  const [isProfileSaved, setIsProfileSaved] = useState(false);

  const handleProfileSave = (status) => {
    setIsProfileSaved(status);  // This function is used to update the profile saved status
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        props.navigation.replace("Auth");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="ListProfile"
        component={ListProfile}
        initialParams={{ currentId: currentId }}
        listeners={{
          tabPress: e => {
            const cameFromNewUser = props.route.params.cameFromNewUser;
            if (cameFromNewUser && !isProfileSaved) {
              e.preventDefault();
              alert("Please fill and save your profile before switching tabs.");
            }
          },
        }}
        options={{
          tabBarIcon: () => <Icon name="list" size={24} />,
        }}
      />
      <Tab.Screen
        name="Group"
        component={Group}
        listeners={{
          tabPress: e => {
            const cameFromNewUser = props.route.params.cameFromNewUser;
            if (cameFromNewUser && !isProfileSaved) {
              e.preventDefault();
              alert("Please fill and save your profile before switching tabs.");
            }
          },
        }}
        options={{
          tabBarIcon: () => <Icon name="group" size={24} />,
        }}
      />
      <Tab.Screen
        name="MyProfile"
        initialParams={{
          currentId: currentId,
          cameFromNewUser: props.route.params.cameFromNewUser,
        }}
        listeners={{
          tabPress: e => {
            const cameFromNewUser = props.route.params.cameFromNewUser;
            if (cameFromNewUser && !isProfileSaved) {
              e.preventDefault();
              alert("Please fill and save your profile before switching tabs.");
            }
          },
        }}
        options={{
          tabBarIcon: () => <Icon name="person" size={24} />,
        }}
        children={(props) => <MyProfile {...props} onProfileSave={handleProfileSave} />}
      />
    </Tab.Navigator>
  );
}
