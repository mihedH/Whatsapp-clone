import { View, Text } from 'react-native'
import React from 'react'
import Auth from './screens/Auth'
import NewUser from './screens/NewUser'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Home from './screens/Home'
import Chat from './screens/Chat'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
<NavigationContainer>
<Stack.Navigator screenOptions={{headerShown:false}}>
<Stack.Screen name='Auth' component={Auth}></Stack.Screen>
<Stack.Screen name='NewUser' component={NewUser} options={{headerShown:true}}></Stack.Screen>
<Stack.Screen name='Home' component={Home}></Stack.Screen>
<Stack.Screen name="Chat" component={Chat}></Stack.Screen>
</Stack.Navigator>
</NavigationContainer>
  )
}