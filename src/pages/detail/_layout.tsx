// app/personal/(detail)/_layout.tsx
import { Stack } from 'expo-router';

export default function DetailStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="personalScheduleDetail"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="teamUserDetail"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="teamUserDetailEdit"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="teamUserScheduleList"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="personalTotalSalary"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="personalPlaceSalary"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="teamInfo"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="workplaceSalaryDetail"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="memberSalaryDetail"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}