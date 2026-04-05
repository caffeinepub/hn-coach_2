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
  const [authClient, setAuthClient] = useState<AuthClient | undefined>(
    undefined,
  );
  const [identity, setIdentity] = useState<Identity | undefined>(undefined);
  const [loginStatus, setStatus] = useState<Status>("initializing");
  const [loginError, setError] = useState<Error | undefined>(undefined);
  // Guard to ensure we only initialize once on mount
  const initRef = useRef(false);
  // Capture createOptions in a ref so we can use it without adding it to deps
  const createOptionsRef = useRef(createOptions);

  const setErrorMessage = useCallback((message: string) => {
    setStatus("loginError");
    setError(new Error(message));
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once on mount only
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    let cancelled = false;
    void (async () => {
      try {
        setStatus("initializing");
        const client = await createAuthClient(createOptionsRef.current);
        if (cancelled) return;
        setAuthClient(client);
        const isAuthenticated = await client.isAuthenticated();
        if (cancelled) return;
        if (isAuthenticated) {
          setIdentity(client.getIdentity());
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
  }, []);

  const login = useCallback(() => {
    if (!authClient) {
      setErrorMessage(
        "AuthClient is not initialized yet, make sure to call `login` on user interaction e.g. click.",
      );
      return;
    }

    const options: AuthClientLoginOptions = {
      identityProvider: DEFAULT_IDENTITY_PROVIDER,
      onSuccess: () => {
        const latestIdentity = authClient.getIdentity();
        if (!latestIdentity) {
          setErrorMessage("Identity not found after successful login");
          return;
        }
        setIdentity(latestIdentity);
        setStatus("success");
      },
      onError: (maybeError?: string) => {
        setErrorMessage(maybeError ?? "Login failed");
      },
      maxTimeToLive: ONE_HOUR_IN_NANOSECONDS * BigInt(24 * 30), // 30 days
    };

    setStatus("logging-in");
    void authClient.login(options);
  }, [authClient, setErrorMessage]);

  const clear = useCallback(() => {
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
      })
      .catch((unknownError: unknown) => {
        setStatus("loginError");
        setError(
          unknownError instanceof Error
            ? unknownError
            : new Error("Logout failed"),
        );
      });
  }, [authClient, setErrorMessage]);

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
