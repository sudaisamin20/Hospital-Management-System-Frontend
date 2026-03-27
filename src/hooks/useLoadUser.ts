import { useEffect } from 'react';
import { loadUser } from '../features/auth/authSlice';
import type { User } from '../features/auth/authTypes';
import { useAppDispatch } from './useAppDispatch';

export const useLoadUser = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('authToken');

    if (savedUser && savedToken) {
      try {
        const user: User = JSON.parse(savedUser);
        user.token = savedToken;
        dispatch(loadUser(user));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }
  }, [dispatch]);
};
