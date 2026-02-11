// app/personal/(detail)/_layout.tsx
import { Stack } from 'expo-router';

export default function MemoLayout() {
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
                name="editMemo"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="addMemo"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
}