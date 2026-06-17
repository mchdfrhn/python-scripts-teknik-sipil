import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";

type ApiType = typeof api;
type ApiMethodName = keyof ApiType;

export function usePhysics<
  M extends ApiMethodName,
  TParams extends Parameters<ApiType[M]>[0],
  TResult extends Awaited<ReturnType<ApiType[M]>>
>(
  apiMethod: M,
  localCalc: ((params: TParams) => TResult | null) | null,
  params: TParams
) {
  const [result, setResult] = useState<TResult | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [verifiedParams, setVerifiedParams] = useState<string>("");

  const paramsKey = JSON.stringify(params);

  const localResult = useMemo(() => {
    return localCalc ? localCalc(params) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localCalc, paramsKey]);

  useEffect(() => {
    let active = true;

    const handler = setTimeout(() => {
      if (!active) return;
      setError(null);
      setIsValidating(true);
      
      const apiFn = api[apiMethod] as unknown as (p: TParams) => Promise<TResult>;
      
      apiFn(params)
        .then((backendResult) => {
          if (active) {
            setResult(backendResult);
            setVerifiedParams(paramsKey);
            setIsVerified(true);
            setIsValidating(false);
            setError(null);
          }
        })
        .catch((err: unknown) => {
          if (active) {
            console.warn("Backend calculation failed.", err);
            setError(err instanceof Error ? err : new Error(String(err)));
            setIsValidating(false);
            setIsVerified(false);
          }
        });
    }, 150);

    return () => {
      active = false;
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, apiMethod]);

  const isCurrentlyVerified = isVerified && paramsKey === verifiedParams;
  const activeResult = isCurrentlyVerified && result ? result : (localResult as TResult);

  return { result: activeResult, isVerified: isCurrentlyVerified, isValidating, error };
}
