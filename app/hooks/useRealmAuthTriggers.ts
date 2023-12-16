// Adapted from
// https://github.com/realm/realm-js/blob/main/examples/rn-connection-and-error/frontend/app/hooks/useDemoAuthTriggers.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { AuthOperationName, useApp, useEmailPasswordAuth } from "@realm/react";

import { logger } from "../utils/logger";
import { getIntBetween } from "../utils/random";

const VALID_PASSWORD = "123456";

type EmailPasswordCredentials = {
  email: string;
  password: string;
};

function generateDummyEmail(): string {
  return `${getIntBetween(0, 100_000)}@email.com`;
}

function getNewValidCredentials(): EmailPasswordCredentials {
  return {
    email: generateDummyEmail(),
    password: VALID_PASSWORD,
  };
}

function getExistingCredentials(
  registeredEmail: string
): EmailPasswordCredentials {
  return {
    email: registeredEmail,
    password: VALID_PASSWORD,
  };
}

export function useRealmAuthTriggers() {
  const app = useApp();
  const { logIn, register, result } = useEmailPasswordAuth();
  const [pendingEmail, setPendingEmail] = useState<string>();

  const registeredEmail = useMemo(() => {
    const allUsers = Object.values(app.allUsers);
    return pendingEmail || allUsers[allUsers.length - 1]?.profile.email;
  }, [app.allUsers, pendingEmail]);

  const logAndLogIn = useCallback(
    (credentials: EmailPasswordCredentials) => {
      logger.info("Logging in ...");
      logIn(credentials);
    },
    [logIn]
  );

  const logInSuccess = useCallback(() => {
    if (!registeredEmail) {
      return Alert.alert("You need to register a user first");
    }
    logAndLogIn(getExistingCredentials(registeredEmail));
  }, [registeredEmail, logAndLogIn]);

  /**
   * Logs a message using a preferred logging mechanism before
   * proceeding to register the user to the App.
   */
  const logAndRegister = useCallback(
    (credentials: EmailPasswordCredentials) => {
      logger.info("Registering...");
      register(credentials);
    },
    [register]
  );

  const registerSuccessfully = useCallback(() => {
    const validCredentials = getNewValidCredentials();
    setPendingEmail(validCredentials.email);
    logAndRegister(validCredentials);
  }, [logAndRegister]);

  useEffect(() => {
    // We show an alert on the screen when a user has been registered. For your own
    // app, developers can choose to automatically log in users upon successful
    // registration using this pattern as well. Instead of showing an alert, you can
    // then call your log in method. (For this app, it would be `logInSuccessfully()`.)
    if (result.operation === AuthOperationName.Register && result.success) {
      Alert.alert("🥳 You are now registered and can log in!");
    }
  }, [result.operation, result.success]);

  return {
    logInSuccess,
    registerSuccessfully,
  };
}
