"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  email: string;
  nombre: string;
  createdAt: string;
  role: string;
  profileImageUrl: string;
  coverImageUrl: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Validar token al cargar
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    const validateToken = async () => {
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!res.ok) {
          throw new Error("Token inválido o expirado");
        }

        const userData = await res.json();
        setToken(storedToken);
        setUser(userData);
      } catch (error) {
        console.error("Error al validar el token:", error);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [API_URL]);

  // Login actualizado
  const login = async (email: string, password: string) => {
    setLoading(true);

    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setLoading(false);
      throw new Error("Credenciales incorrectas");
    }

    const data = await res.json();

    setToken(data.token);
    localStorage.setItem("token", data.token);

    // Ahora obtenemos los datos del usuario
    try {
      const profileRes = await fetch(`${API_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (!profileRes.ok) throw new Error("No se pudo obtener perfil");

      const userData = await profileRes.json();
      setUser(userData);
    } catch (error) {
      console.error("Error al obtener perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: any) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) throw new Error("Error al registrarse");
    const data = await res.json();
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const updateUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("No se pudo obtener el perfil actualizado");

      const userData = await res.json();
      setUser(userData); // Actualizar el usuario en el contexto
    } catch (error) {
      console.error("Error al actualizar el usuario en el contexto:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, register, loading, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return context;
};
