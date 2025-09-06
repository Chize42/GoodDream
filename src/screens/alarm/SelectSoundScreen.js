import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';

const SOUNDS = ['Good Morning', 'Sleepy Sheep', 'Rose', 'Shimmer', 'Smooth Wave', 'Wood'];

export default function SelectSoundScreen({ navigation, route }) {
  const current = route.params?.current || SOUNDS[0];
  const [selected, setSelected] = useState(current);

  const onGoBack = () => {
    navigation.navigate('AddEditAlarm', { selectedSound: selected });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack}>
          <Image source={{ uri: 'https://i.ibb.co/Dg5C8MzW/Arrow.png' }} style={styles.icon} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>알림음</Text>
      </View>

      <FlatList
        data={SOUNDS}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => setSelected(item)}>
            <View style={[styles.radio, selected === item && styles.radioSelected]}>
              {selected === item ? <View style={styles.radioInner} /> : null}
            </View>
            <Text style={[styles.soundName, selected === item && styles.soundSelected]}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: 12, 
    paddingTop: 20, 
    paddingBottom: 8,
    backgroundColor: '#111'
  },
  icon: { 
    width: 28, 
    height: 28 
  },
  backArrow: { 
    fontSize: 32, 
    color: '#fff', 
    marginRight: 4 
  },
  headerTitle: { 
    flex: 1, 
    fontSize: 22, 
    color: 'white', 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginRight: 36 
  },
  row: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 18,
    paddingHorizontal: 24, 
    borderBottomWidth: 1, 
    borderColor: '#222'
  },
  radio: {
    width: 22, 
    height: 22, 
    borderRadius: 11, 
    borderWidth: 2,
    borderColor: '#888', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 16
  },
  radioSelected: {
    borderColor: '#347CFF'
  },
  radioInner: {
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    backgroundColor: '#347CFF'
  },
  soundName: {
    color: '#fff',
    fontSize: 16
  },
  soundSelected: {
    color: '#347CFF',
    fontWeight: 'bold'
  },
});
