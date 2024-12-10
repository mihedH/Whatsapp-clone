import { View, Text, ImageBackground, Image, StyleSheet } from 'react-native'
import React from 'react'

export default function Group() {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/constructionPage.png')} style={{ width: '100%',height:'70%'}}></Image>
      <Text style={styles.textstyle}>page under construction</Text>
    </View>
  )
}
const styles = StyleSheet.create( {
  container: {
    color: "blue",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textstyle: {
    fontSize: 40,
    textAlign: "center",
    fontFamily: "serif",
    color: "#3f5779",
    fontWeight: "bold",
  },
});