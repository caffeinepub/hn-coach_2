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
  /** The identity is available after successfully loading the identity from local storage
   * or completing the login process. */
  identity?: Identity;

  /** Connect to Internet Identity to login the user. */
  login: () => void;

  /** Clears the identity from the state and local storage. Effectively "logs the user out". */
  clear: () => void;

  /** The loginStatus of the login process. */
  loginStatus: Status;

  /** `loginStatus === "initializing"` */
  isInitializing: boolean;

  /** `loginStatus === "idle"` */
  isLoginIdle: boolean;

  /** `loginStatus === "logging-in"` */
  isLoggingIn: boolean;

  /** `loginStatus === "success"` */
  isLoginSuccess: boolean;

  /** `loginStatus === "loginError"` */
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
  const authClient = await AuthClient.create(options);
  return authClient;
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
  // Store authClient in a ref to avoid triggering re-renders or effect loops
  const authClientRef = useRef<AuthClient | null>(null);
  // Guard against running the init effect more than once
  const initializedRef = useRef(false);
  // Capture createOptions in a ref so it doesn't need to be in effect deps
  const createOptionsRef = useRef(createOptions);
  createOptionsRef.current = createOptions;

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
    const client = authClientRef.current;
    if (!client) {
      setErrorMessage(
        "AuthClient is not initialized yet, make sure to call login on user interaction.",
      );
      return;
    }

    const options: AuthClientLoginOptions = {
      identityProvider: DEFAULT_IDENTITY_PROVIDER,
      onSuccess: handleLoginSuccess,
      onError: handleLoginError,
      maxTimeToLive: ONE_HOUR_IN_NANOSECONDS * BigInt(24 * 30),
    };

    setStatus("logging-in");
    void client.login(options);
  }, [handleLoginError, handleLoginSuccess, setErrorMessage]);

  const clear = useCallback(() => {
    const client = authClientRef.current;
    if (!client) {
      setErrorMessage("Auth client not initialized");
      return;
    }

    void client
      .logout()
      .then(() => {
        setIdentity(undefined);
        authClientRef.current = null;
        initializedRef.current = false;
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

  // Initialize ONCE on mount. Empty deps array is intentional.
  // createOptions is captured via createOptionsRef to avoid re-runs.
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let cancelled = false;
    void (async () => {
      try {
        setStatus("initializing");
        const client = await createAuthClient(createOptionsRef.current);
        if (cancelled) return;
        authClientRef.current = client;

        const isAuthenticated = await client.isAuthenticated();
        if (cancelled) return;

        if (isAuthenticated) {
          const loadedIdentity = client.getIdentity();
          setIdentity(loadedIdentity);
        }
      } catch (unknownError) {
        if (!cancelled) {
          setStatus("loginError");
          setError(
            unknownError instanceof Error
              ? unknownError
              : new Error("Initialization failed"),
          );
        }
      } finally {
        if (!cancelled) setStatus("idle");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []); // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally empty -- init runs once only

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
