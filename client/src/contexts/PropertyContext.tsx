import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface PropertyContextType {
  activePropertyId: number | undefined;
  activePropertyAddress: string | undefined;
  setActiveProperty: (id: number | undefined, address?: string) => void;
  clearActiveProperty: () => void;
}

const PropertyContext = createContext<PropertyContextType>({
  activePropertyId: undefined,
  activePropertyAddress: undefined,
  setActiveProperty: () => {},
  clearActiveProperty: () => {},
});

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [activePropertyId, setActivePropertyId] = useState<number | undefined>(undefined);
  const [activePropertyAddress, setActivePropertyAddress] = useState<string | undefined>(undefined);

  const setActiveProperty = useCallback((id: number | undefined, address?: string) => {
    setActivePropertyId(id);
    setActivePropertyAddress(address);
  }, []);

  const clearActiveProperty = useCallback(() => {
    setActivePropertyId(undefined);
    setActivePropertyAddress(undefined);
  }, []);

  return (
    <PropertyContext.Provider
      value={{ activePropertyId, activePropertyAddress, setActiveProperty, clearActiveProperty }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

export function useActiveProperty() {
  return useContext(PropertyContext);
}
