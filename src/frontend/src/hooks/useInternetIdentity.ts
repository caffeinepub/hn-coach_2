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
  // Store authClient in a ref to prevent re-render loops
  const authClientRef = useRef<AuthClient | null>(null);
  const initializedRef = useRef(false);
  // Capture createOptions in a ref so the effect doesn't re-run when it changes
  const createOptionsRef = useRef(createOptions);

  const [identity, setIdentity] = useState<Identity | undefined>(undefined);
  const [loginStatus, setStatus] = useState<Status>("initializing");
  const [loginError, setError] = useState<Error | undefined>(undefined);

  const setErrorMessage = useCallback((message: string) => {
    setStatus("loginError");
    setError(new Error(message));
  }, []);

  const handleLoginSuccess = useCallback(() => {
    const latestIdentity = authClientRef.current?.getIdentity();
    if (!latestIdentity) {
      setErrorMessage("Identity not found after successful login");
      return;
    }
    setIdentity(latestIdentity);
    setStatus("success");
  }, [setErrorMessage]);

  const handleLoginError = useCallback(
    (maybeError?: string) => {
      setErrorMessage(maybeError ?? "Login failed");
    },
    [setErrorMessage],
  );

  const login = useCallback(() => {
    if (!authClientRef.current) {
      setErrorMessage(
        "AuthClient is not initialized yet, make sure to call `login` on user interaction e.g. click.",
      );
      return;
    }

    // Do NOT block returning users — just open the login popup
    const options: AuthClientLoginOptions = {
      identityProvider: DEFAULT_IDENTITY_PROVIDER,
      onSuccess: handleLoginSuccess,
      onError: handleLoginError,
      maxTimeToLive: ONE_HOUR_IN_NANOSECONDS * BigInt(24 * 30), // 30 days
    };

    setStatus("logging-in");
    void authClientRef.current.login(options);
  }, [handleLoginError, handleLoginSuccess, setErrorMessage]);

  const clear = useCallback(() => {
    if (!authClientRef.current) {
      setErrorMessage("Auth client not initialized");
      return;
    }

    void authClientRef.current
      .logout()
      .then(() => {
        authClientRef.current = null;
        initializedRef.current = false;
        setIdentity(undefined);
        setStatus("idle");
        setError(undefined);
      })
      .catch((unknownError: unknown) => {
        setStatus("loginError");
        setError(
          unknownError instanceof Error
            ? unknownError
            : new Error("Logout failed"),
        );
      });
  }, [setErrorMessage]);

  // Runs exactly once on mount using the ref guard
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    void (async () => {
      try {
        setStatus("initializing");
        const client = await createAuthClient(createOptionsRef.current);
        authClientRef.current = client;
        const isAuthenticated = await client.isAuthenticated();
        if (isAuthenticated) {
          const loadedIdentity = client.getIdentity();
          setIdentity(loadedIdentity);
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
    // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally empty — runs once via ref guard
  }, []);

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
