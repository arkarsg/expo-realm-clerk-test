import React from 'react';
import { Stack } from 'expo-router';

const PublicLayout = () => {
	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: '#6c47ff'
				},
				headerTintColor: '#fff',
				headerBackTitle: 'Back'
			}}
		>
			<Stack.Screen
				name="ClerkLogIn"
				options={{
					headerTitle: 'Clerk Auth App'
				}}
			></Stack.Screen>
			<Stack.Screen
				name="ClerkRegister"
				options={{
					headerTitle: 'Create Account'
				}}
			></Stack.Screen>
			{/* <Stack.Screen
				name="LogIn"
				options={{
					headerTitle: 'Realm Register/ Login'
				}}
			></Stack.Screen> */}
		</Stack>
	);
};

export default PublicLayout;
