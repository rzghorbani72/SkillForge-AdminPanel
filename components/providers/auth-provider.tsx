'use client';
import React, { createContext, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({
  children,
  value
}: {
  children: React.ReactNode;
  value: any;
}) => {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
