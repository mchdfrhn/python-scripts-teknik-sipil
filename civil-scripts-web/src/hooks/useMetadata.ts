import { useState, useEffect } from "react";
import { api, type Metadata } from "@/lib/api";

export function useMetadata() {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    api.getMetadata()
      .then(data => {
        setMetadata(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch metadata:", err);
        setError(err);
        setIsLoading(false);
      });
  }, []);

  return { metadata, isLoading, error };
}
