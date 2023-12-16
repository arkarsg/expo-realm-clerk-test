// app/_layout.js

import "react-native-get-random-values";
import { AppProvider, RealmProvider, UserProvider, useApp } from "@realm/react";
import { Task } from "./models/Task";
import { logger } from "./utils/logger";
import Realm, { SyncError, OpenRealmBehaviorType } from "realm";
import { LoginScreen } from "./(public)/RealmLogin";
import { AuthResultBoundary } from "./components/AuthResultBoundary";
import * as SecureStore from "expo-secure-store";
import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/clerk-expo";
import ClerkLogIn from "./(public)/ClerkLogIn";
import { TaskScreen } from "./(auth)/TaskScreen";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      console.log("🛑 Could not get token from SecureStore");
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.log("🛑 Error saving token");
    }
  },
};

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const segments = useSegments();
  const router = useRouter();
  const app = useApp();

  async function getRealmStatus() {
    try {
      const userStatus = await app.currentUser;
      if (userStatus === null) {
        return false;
      } else {
        const userStatus = await app.currentUser!.isLoggedIn;
        return userStatus;
      }
    } catch (err) {
      console.log("🛑 Failed to fetch user", err);
    }
  }

  const [isRealmLoggedIn, setRealmLoggedIn] = useState(false);

  useEffect(() => {
    getRealmStatus()
      .then((res) => {
        setRealmLoggedIn(res!);
      })
      .catch((err) => {
        console.log(err);
      });
    if (!isLoaded) return;
    const inTabsGroup = segments[0] === "(auth)";

    if (isSignedIn && !inTabsGroup && isRealmLoggedIn) {
      router.replace("/TaskScreen");
    } else if (!isSignedIn && !isRealmLoggedIn) {
      router.replace("/ClerkLogIn");
    }
  }, [isSignedIn]);

  return <Slot />;
};

export default function RootLayout() {
  // To diagnose and troubleshoot errors while in development, set the log level to `debug`
  // or `trace`. For production deployments, decrease the log level for improved performance.
  // logLevels = ["all", "trace", "debug", "detail", "info", "warn", "error", "fatal", "off"];
  // You may import `NumericLogLevel` to get them as numbers starting from 0 (`all`).
  Realm.setLogLevel("error");
  Realm.setLogger((logLevel, message) => {
    const formattedMessage = `Log level: ${logLevel} - Log message: ${message}`;
    if (logLevel === "all") {
      logger.error(formattedMessage);
    } else {
      logger.info(formattedMessage);
    }
  });

  /**
   * The sync error listener - Will be invoked when various synchronization errors occur.
   *
   * @note
   * To trigger, for instance, a session level sync error, you may modify the Document
   * Permissions in Atlas App Services to NOT allow `Delete`, then rerun this app and
   * try to delete a product.
   * For how to modify the rules and permissions, see:
   * {@link https://www.mongodb.com/docs/atlas/app-services/rules/roles/#define-roles---permissions}.
   *
   * For detailed error codes, see:
   * {@link https://github.com/realm/realm-core/blob/master/doc/protocol.md#error-codes}.
   * Examples:
   * - 202 (Access token expired)
   * - 225 (Invalid schema change)
   */
  function handleSyncError(
    session: Realm.App.Sync.SyncSession,
    error: SyncError
  ): void {
    // Please note that frequent logging to the `console` greatly decreases
    // performance and blocks the UI thread. If the user is offline, syncing
    // will not be possible and this callback will be called frequently. Thus,
    // when in production, use another preferred logging mechanism.
    logger.error(error);
  }

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <AppProvider id={process.env.EXPO_PUBLIC_ATLAS_APP_ID!}>
        <AuthResultBoundary>
          <UserProvider fallback={InitialLayout}>
            <RealmProvider
              schema={[Task]}
              sync={{
                flexible: true,
                initialSubscriptions: {
                  update: (mutableSubs, realm) => {
                    mutableSubs.add(realm.objects(Task));
                  },
                },
                onError: handleSyncError,
                newRealmFileBehavior: {
                  type: OpenRealmBehaviorType.DownloadBeforeOpen,
                },
                existingRealmFileBehavior: {
                  type: OpenRealmBehaviorType.OpenImmediately,
                },
              }}
            >
              <InitialLayout />
            </RealmProvider>
          </UserProvider>
        </AuthResultBoundary>
      </AppProvider>
    </ClerkProvider>
  );
}
