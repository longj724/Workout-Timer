import { View } from 'react-native';
import React from 'react';
import { useOAuth } from '@clerk/clerk-expo';

import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { useUser } from '@clerk/clerk-expo';
import { useGetWorkouts } from '~/hooks/useGetWorkouts';

export default function MyWorkouts() {
  const { user } = useUser();
  const { startOAuthFlow: startGoogleFlow } = useOAuth({
    strategy: 'oauth_google',
  });
  const { startOAuthFlow: startAppleFlow } = useOAuth({
    strategy: 'oauth_apple',
  });

  const { data: workouts, isLoading, error } = useGetWorkouts();

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
          Create Custom Workouts
        </Text>
        <Text className="text-muted-foreground text-center mb-6">
          Sign in to create and manage your personal workout routines
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

  if (isLoading) {
    return (
      <View className="flex-1 bg-background p-4 items-center justify-center">
        <Text>Loading workouts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background p-4 items-center justify-center">
        <Text>Error loading workouts</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold mb-4">My Workouts</Text>
      {workouts?.length === 0 ? (
        <Text className="text-muted-foreground text-center">
          You haven't created any workouts yet
        </Text>
      ) : (
        workouts?.map((workout) => (
          <View key={workout.id} className="bg-card rounded-lg p-4 mb-4">
            <Text className="text-lg font-semibold">{workout.name}</Text>
            {workout.description && (
              <Text className="text-muted-foreground mt-1">
                {workout.description}
              </Text>
            )}
          </View>
        ))
      )}
    </View>
  );
}
