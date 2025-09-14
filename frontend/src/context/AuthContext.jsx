import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  // check existing session (httpOnly cookie)
  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => {})
      .finally(() => setBooting(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
  };

  const register = async (email, password) => {
    const { data } = await api.post('/auth/register', { email, password });
    setUser(data);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, booting, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
