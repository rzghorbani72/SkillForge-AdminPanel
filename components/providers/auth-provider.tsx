'use client';
import React, { createContext, useContext } from 'react';

const AuthContext = createContext<unknown>(null);

export const AuthProvider = ({
  children,
  value
}: {
  children: React.ReactNode;
  value: unknown;
}) => {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
