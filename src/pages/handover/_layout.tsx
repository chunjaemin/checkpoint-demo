// app/personal/(detail)/_layout.tsx
import { Stack } from 'expo-router';

export default function DetailStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="detail"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="addHandover"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="editHandover"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}