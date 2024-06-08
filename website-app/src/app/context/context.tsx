"use client";
import React, { createContext, useState, ReactNode } from 'react';
interface MyContextProps {
  userId: number;
  setUserId: React.Dispatch<React.SetStateAction<number>>;
}

const MyContext = createContext<MyContextProps | undefined>(undefined);
export const MyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<number>(401);
  return (
    <MyContext.Provider value={{ userId, setUserId }}>
      {children}
    </MyContext.Provider>
  );
};

export default MyContext;
