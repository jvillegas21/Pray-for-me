import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
// @ts-expect-error navigation types will resolve
import { useRoute } from '@react-navigation/native';

type Study = {
  title: string;
  steps: string[];
};

type RouteParams = {
  study: Study;
};

const BibleStudyScreen: React.FC = () => {
  const route = useRoute();
  const { study } = (route.params || {}) as RouteParams;
  const [completed, setCompleted] = useState<boolean[]>(() => study.steps.map(() => false));

  const toggleStep = (index: number) => {
    setCompleted((prev) => {
      const newArr = [...prev];
      newArr[index] = !newArr[index];
      return newArr;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{study.title}</Text>
      <FlatList
        data={study.steps}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => toggleStep(index)}>
            <View style={styles.stepRow}>
              <Text style={[styles.checkbox, completed[index] && styles.checked]}>✓</Text>
              <Text style={styles.stepText}>{item}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  checked: {
    backgroundColor: '#4caf50',
    color: '#fff',
  },
  stepText: { flex: 1, fontSize: 16 },
});

export default BibleStudyScreen;