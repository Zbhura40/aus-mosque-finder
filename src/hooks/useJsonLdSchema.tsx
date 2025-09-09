import { useEffect } from 'react';
import { injectJsonLdSchema } from '@/lib/json-ld-schema';

export const useJsonLdSchema = (schema: object | null) => {
  useEffect(() => {
    if (schema) {
      injectJsonLdSchema(schema);
    }

    // Cleanup function to remove schema when component unmounts
    return () => {
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [schema]);
};