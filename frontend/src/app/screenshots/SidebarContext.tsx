"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type SidebarContextValue = {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
};

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

//custom React context provider component, ensure a shared sidebar state ({isOpen, toggle(), close()}) is available to all components nested inside it
export function SidebarProvider({ children } : { children: ReactNode }) {
    
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen((prev) => !prev);
    const close = () => setIsOpen(false);

    //value = {expression {javascript object literal}}
    return (
        <SidebarContext.Provider value={ {isOpen, toggle, close} }>
            {children}
        </SidebarContext.Provider>
    );
}

//consumer of the Context
//custom hook for consuming that Context
//to ensure Context isn't called by a component that isn't actually inside the SidebarProvider
export function useSidebar() {
    const context = useContext(SidebarContext);
    
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }

    return context;
}
