import {
  AuthClient,
  type AuthClientCreateOptions,
  type AuthClientLoginOptions,
} from "@dfinity/auth-client";
import type { Identity } from "@icp-sdk/core/agent";
import {
  type PropsWithChildren,
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { loadConfig } from "../config";

export type Status =
  | "initializing"
  | "idle"
  | "logging-in"
  | "success"
  | "loginError";

export type InternetIdentityContext = {
  identity?: Identity;
  login: () => void;
  clear: () => void;
  loginStatus: Status;
  isInitializing: boolean;
  isLoginIdle: boolean;
  isLoggingIn: boolean;
  isLoginSuccess: boolean;
  isLoginError: boolean;
  loginError?: Error;
};

const ONE_HOUR_IN_NANOSECONDS = BigInt(3_600_000_000_000);
const DEFAULT_IDENTITY_PROVIDER = process.env.II_URL;

type ProviderValue = InternetIdentityContext;
const InternetIdentityReactContext = createContext<ProviderValue | undefined>(
  undefined,
);

async function createAuthClient(
  createOptions?: AuthClientCreateOptions,
): Promise<AuthClient> {
  const config = await loadConfig();
  const options: AuthClientCreateOptions = {
    idleOptions: {
      disableDefaultIdleCallback: true,
      disableIdle: true,
      ...createOptions?.idleOptions,
    },
    loginOptions: {
      derivationOrigin: config.ii_derivation_origin,
    },
    ...createOptions,
  };
  return AuthClient.create(options);
}

function assertProviderPresent(
  context: ProviderValue | undefined,
): asserts context is ProviderValue {
  if (!context) {
    throw new Error(
      "InternetIdentityProvider is not present. Wrap your component tree with it.",
    );
  }
}

export const useInternetIdentity = (): InternetIdentityContext => {
  const context = useContext(InternetIdentityReactContext);
  assertProviderPresent(context);
  return context;
};

export function InternetIdentityProvider({
  children,
  createOptions,
}: PropsWithChildren<{
  children: ReactNode;
  createOptions?: AuthClientCreateOptions;
}>) {
  // Store authClient in a ref — never causes re-renders, never triggers effect re-runs
  const authClientRef = useRef<AuthClient | null>(null);
  const initializedRef = useRef(false);

  const [identity, setIdentity] = useState<Identity | undefined>(undefined);
  const [loginStatus, setStatus] = useState<Status>("initializing");
  const [loginError, setError] = useState<Error | undefined>(undefined);

  const setErrorMessage = useCallback((message: string) => {
    setStatus("loginError");
    setError(new Error(message));
  }, []);

  // Run EXACTLY ONCE on mount — empty deps array, ref guard as double protection
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs once on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    void (async () => {
      try {
        const client = await createAuthClient(createOptions);
        authClientRef.current = client;
        const isAuthenticated = await client.isAuthenticated();
        if (isAuthenticated) {
          setIdentity(client.getIdentity());
        }
      } catch (unknownError) {
        setStatus("loginError");
        setError(
          unknownError instanceof Error
            ? unknownError
            : new Error("Initialization failed"),
        );
      } finally {
        setStatus("idle");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — must only run once

  const login = useCallback(() => {
    const authClient = authClientRef.current;
    if (!authClient) {
      setErrorMessage("Auth not ready yet. Please try again.");
      return;
    }
    // Never block returning users — let II handle session validation
    const options: AuthClientLoginOptions = {
      identityProvider: DEFAULT_IDENTITY_PROVIDER,
      onSuccess: () => {
        const id = authClientRef.current?.getIdentity();
        if (!id) {
          setErrorMessage("Identity not found after login");
          return;
        }
        setIdentity(id);
        setStatus("success");
      },
      onError: (maybeError?: string) => {
        setErrorMessage(maybeError ?? "Login failed");
      },
      maxTimeToLive: ONE_HOUR_IN_NANOSECONDS * BigInt(24 * 30),
    };
    setStatus("logging-in");
    void authClient.login(options);
  }, [setErrorMessage]);

  const clear = useCallback(() => {
    const authClient = authClientRef.current;
    if (!authClient) {
      setErrorMessage("Auth client not initialized");
      return;
    }
    void authClient
      .logout()
      .then(() => {
        setIdentity(undefined);
        setStatus("idle");
        setError(undefined);
        authClientRef.current = null;
        initializedRef.current = false;
        // Re-initialize after logout so login works again
        void createAuthClient(createOptions).then((c) => {
          authClientRef.current = c;
          initializedRef.current = true;
        });
      })
      .catch((unknownError: unknown) => {
        setStatus("loginError");
        setError(
          unknownError instanceof Error
            ? unknownError
            : new Error("Logout failed"),
        );
      });
  }, [setErrorMessage, createOptions]);

  const value = useMemo<ProviderValue>(
    () => ({
      identity,
      login,
      clear,
      loginStatus,
      isInitializing: loginStatus === "initializing",
      isLoginIdle: loginStatus === "idle",
      isLoggingIn: loginStatus === "logging-in",
      isLoginSuccess: loginStatus === "success",
      isLoginError: loginStatus === "loginError",
      loginError,
    }),
    [identity, login, clear, loginStatus, loginError],
  );

  return createElement(InternetIdentityReactContext.Provider, {
    value,
    children,
  });
}
