// External D
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { useOAuth } from '@clerk/clerk-expo';

// Internal Dependencies
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { useUser } from '@clerk/clerk-expo';

const History = () => {
  const router = useRouter();
  const { user } = useUser();
  const { startOAuthFlow: startGoogleFlow } = useOAuth({
    strategy: 'oauth_google',
  });
  const { startOAuthFlow: startAppleFlow } = useOAuth({
    strategy: 'oauth_apple',
  });

  const onSignInWithGoogle = async () => {
    try {
      const { createdSessionId, setActive } = await startGoogleFlow();
      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  };

  const onSignInWithApple = async () => {
    try {
      const { createdSessionId, setActive } = await startAppleFlow();
      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  };

  if (!user) {
    return (
      <View className="flex-1 bg-background p-4 items-center justify-center">
        <Text className="text-2xl font-bold text-center mb-4">
          Track Your Fitness Journey
        </Text>
        <Text className="text-muted-foreground text-center mb-6">
          Sign in to view your workout history and track your progress
        </Text>
        <View className="flex-col gap-4 w-full max-w-xs">
          <Button
            variant="default"
            onPress={onSignInWithGoogle}
            className="flex-row items-center justify-center gap-2"
          >
            <Text>Continue with Google</Text>
          </Button>
          <Button
            variant="default"
            onPress={onSignInWithApple}
            className="flex-row items-center justify-center gap-2"
          >
            <Text>Continue with Apple</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold mb-4">My Workouts</Text>
      {/* Add your workout history list here */}
    </View>
  );
};

export default History;
