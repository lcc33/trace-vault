"use client";

import React from 'react';
import { dark } from "@clerk/themes";
import { ClerkProvider } from '@clerk/nextjs';

interface Props {
    children: React.ReactNode;
}

const Providers = ({ children }: Props) => {
    return (
        <ClerkProvider>
            {children}
        </ClerkProvider>
    )
};

export default Providers
