//import { ExcelRow } from '@/components/extra/typesSendFilterProcessPage';
'use client'
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { tokenManager } from '@/lib/tokenManager';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { Socket } from 'socket.io-client';

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
  userId: string; // 🆕 User ID (UID) from Supabase
  setUserId: (id: string) => void;
  socket: Socket | null; // 🆕 WebSocket global
  connected: boolean; // 🆕 Estado de conexión
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  //const [excelFileByUser, setExcelFileByUserState] = useState<{ data: ExcelRow[]; fileName: string; isSentOrUsed: boolean } | null>(null);
  const [accessToken, setAccessTokenState] = useState<string>('');
  const [refreshToken, setRefreshTokenState] = useState<string>('');
  const [usernameGlobal, setUsernameGlobal] = useState('');
  const [userId, setUserId] = useState<string>(''); // 🆕 User ID state

  // 🆕 WebSocket global inicializado UNA VEZ al montar el provider
  const { socket, connected } = useWebSocket();

  // Sincronizar accessToken con localStorage al cargar la app
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken') ?? '';
    const storedRefreshToken = localStorage.getItem('refreshToken') ?? '';
    setAccessTokenState(storedAccessToken);
    setRefreshTokenState(storedRefreshToken);

    const storedUsername = localStorage.getItem('username') ?? '';
    setUsernameGlobal(storedUsername);

    const storedUserId = localStorage.getItem('userId') ?? ''; // 🆕 Load userId
    setUserId(storedUserId);

    // Inicializar el token manager
    tokenManager.init();
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

  // Guardar userId en localStorage cuando cambia 🆕
  useEffect(() => {
    if (userId) localStorage.setItem('userId', userId);
    else localStorage.removeItem('userId');
  }, [userId]);

  // 🆕 Suscribir automáticamente al usuario cuando el socket esté conectado
  useEffect(() => {
    if (!socket || !connected || !userId) {
      if (!socket) console.log('⏳ [GlobalContext] Socket no inicializado aún');
      if (!connected) console.log('⏳ [GlobalContext] Socket no conectado aún');
      if (!userId) console.log('⏳ [GlobalContext] UserId no disponible aún');
      return;
    }

    console.log('✅ [GlobalContext] Suscribiendo usuario al WebSocket:', userId);
    console.log('🆔 [GlobalContext] Socket ID:', socket.id);
    console.log('🔌 [GlobalContext] Socket connected:', socket.connected);
    console.log('📡 [GlobalContext] Emitiendo whatsapp:subscribe...');
    
    // ✅ Callback como tercer parámetro para recibir acknowledgment
    socket.emit('whatsapp:subscribe', { userId }, (response: any) => {
      console.log('✅ [GlobalContext] Suscripción confirmada:', response);
    });

    return () => {
      console.log('🔌 [GlobalContext] Usuario desconectado del WebSocket');
    };
  }, [socket, connected, userId]);

  // Función mejorada para setear tokens
  const setAccessToken = (token: string) => {
    setAccessTokenState(token);
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (token && refreshTokenValue) {
      // Usar el token manager para manejar la expiración automáticamente
      tokenManager.setTokens(token, refreshTokenValue);
    }
  };

  const setRefreshToken = (token: string) => {
    setRefreshTokenState(token);
    const accessTokenValue = localStorage.getItem('accessToken');
    if (token && accessTokenValue) {
      // Usar el token manager para manejar la expiración automáticamente
      tokenManager.setTokens(accessTokenValue, token);
    }
  };

//   const setExcelFileByUser = (file: { data: ExcelRow[]; fileName: string; isSentOrUsed: boolean } | null) => {
//     setExcelFileByUserState(file);
//   };

  const getToken = () => tokenManager.getAccessToken() || '';

  return (
    <GlobalContext.Provider
      value={{
        // excelFileByUser,
        // setExcelFileByUser,
        accessToken,
        setAccessToken,
        refreshToken,
        setRefreshToken,
        getToken,
        usernameGlobal,
        setUsernameGlobal,
        userId, // 🆕 Export userId
        setUserId, // 🆕 Export setUserId
        socket, // 🆕 Export socket global
        connected, // 🆕 Export estado de conexión
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
