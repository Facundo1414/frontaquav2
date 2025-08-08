//import { ExcelRow } from '@/components/extra/typesSendFilterProcessPage';
'use client'
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface GlobalContextType {
  //excelFileByUser: { data: ExcelRow[]; fileName: string; isSentOrUsed: boolean } | null;
  //setExcelFileByUser: (file: { data: ExcelRow[]; fileName: string; isSentOrUsed: boolean } | null) => void;
  accessToken: string;
  setAccessToken: (token: string) => void;
  refreshToken: string;
  setRefreshToken: (token: string) => void;
  getToken: () => string;
  usernameGlobal: string;
  setUsernameGlobal: (username: string) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  //const [excelFileByUser, setExcelFileByUserState] = useState<{ data: ExcelRow[]; fileName: string; isSentOrUsed: boolean } | null>(null);
  const [accessToken, setAccessTokenState] = useState<string>('');
  const [refreshToken, setRefreshTokenState] = useState<string>('');
  const [usernameGlobal, setUsernameGlobal] = useState('');

  // Sincronizar accessToken con localStorage al cargar la app
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken') ?? '';
    const storedRefreshToken = localStorage.getItem('refreshToken') ?? '';
    setAccessTokenState(storedAccessToken);
    setRefreshTokenState(storedRefreshToken);

    const storedUsername = localStorage.getItem('username') ?? '';
    setUsernameGlobal(storedUsername);
  }, []);

  // Guardar accessToken en localStorage cuando cambia
  useEffect(() => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    else localStorage.removeItem('accessToken');
  }, [accessToken]);

  // Guardar refreshToken en localStorage cuando cambia
  useEffect(() => {
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    else localStorage.removeItem('refreshToken');
  }, [refreshToken]);

  // Guardar username en localStorage cuando cambia
  useEffect(() => {
    if (usernameGlobal) localStorage.setItem('username', usernameGlobal);
    else localStorage.removeItem('username');
  }, [usernameGlobal]);

//   const setExcelFileByUser = (file: { data: ExcelRow[]; fileName: string; isSentOrUsed: boolean } | null) => {
//     setExcelFileByUserState(file);
//   };

  const getToken = () => accessToken;

  return (
    <GlobalContext.Provider
      value={{
        // excelFileByUser,
        // setExcelFileByUser,
        accessToken,
        setAccessToken: setAccessTokenState,
        refreshToken,
        setRefreshToken: setRefreshTokenState,
        getToken,
        usernameGlobal,
        setUsernameGlobal,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalContext debe ser usado dentro de un GlobalProvider');
  }
  return context;
};
