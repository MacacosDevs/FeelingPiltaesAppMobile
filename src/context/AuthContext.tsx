import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../api/auth';
import { actualizarPerfil, obtenerPerfil, subirFoto, type ImageAsset } from '../api/usuarios';
import type { UsuarioResponse } from '../api/types';

const TOKEN_STORAGE_KEY = 'feelingpilates.token';

type AuthContextValue = {
  token: string | null;
  user: UsuarioResponse | null;
  isLoading: boolean;
  // La URL de la foto no cambia entre subidas (siempre /api/usuarios/{id}/foto),
  // así que <Image> la cachearía indefinidamente sin este valor para invalidarla.
  photoVersion: number;
  login: (correo: string, contrasena: string) => Promise<void>;
  registrar: (correo: string, contrasena: string, nombre: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (nombre: string, telefono: string, descripcion: string) => Promise<void>;
  updatePhoto: (asset: ImageAsset) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UsuarioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Cualquier carga fresca del perfil recibe un valor nuevo, para que <Image>
  // nunca reutilice una entrada de caché de una versión anterior de la foto
  // (incluye el arranque de la app, no solo la subida de una foto nueva).
  const [photoVersion, setPhotoVersion] = useState(() => Date.now());

  const applyUser = useCallback((nuevoUsuario: UsuarioResponse) => {
    setUser(nuevoUsuario);
    setPhotoVersion(Date.now());
  }, []);

  useEffect(() => {
    (async () => {
      const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        try {
          applyUser(await obtenerPerfil(storedToken));
          setToken(storedToken);
        } catch {
          // token expirado/inválido: se trata como sesión cerrada
          await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    })();
  }, [applyUser]);

  const login = useCallback(async (correo: string, contrasena: string) => {
    const response = await authApi.login(correo, contrasena);
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    applyUser(await obtenerPerfil(response.token));
    setToken(response.token);
  }, [applyUser]);

  const registrar = useCallback(async (correo: string, contrasena: string, nombre: string) => {
    const response = await authApi.registrar(correo, contrasena, nombre);
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    applyUser(await obtenerPerfil(response.token));
    setToken(response.token);
  }, [applyUser]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (nombre: string, telefono: string, descripcion: string) => {
      if (!token) {
        throw new Error('No hay sesión activa');
      }
      const response = await actualizarPerfil(token, {
        nombre,
        telefono: telefono || null,
        fotoUrl: user?.fotoUrl ?? null,
        descripcion: descripcion || null,
      });
      setUser(response);
    },
    [token, user],
  );

  const updatePhoto = useCallback(
    async (asset: ImageAsset) => {
      if (!token) {
        throw new Error('No hay sesión activa');
      }
      const response = await subirFoto(token, asset);
      applyUser(response);
    },
    [token, applyUser],
  );

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      photoVersion,
      login,
      registrar,
      logout,
      updateProfile,
      updatePhoto,
    }),
    [token, user, isLoading, photoVersion, login, registrar, logout, updateProfile, updatePhoto],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
