import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DEMO_ACCOUNTS, DemoAccount, LECTURER_PERSONAS } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, roleOverride?: UserRole) => { success: boolean; message: string };
  logout: () => void;
  switchRole: (role: UserRole) => void;
  activeLecturerPersona: typeof LECTURER_PERSONAS[0];
  setActiveLecturerPersona: (persona: typeof LECTURER_PERSONAS[0]) => void;
  demoAccounts: DemoAccount[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEYS = {
  USER: 'ucc_auth_user_v2',
  ROLE: 'ucc_auth_role_v2',
  LECTURER: 'ucc_auth_lecturer_persona_v2',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    // Default to student demo account on fresh load so user can immediately experience the system,
    // or return null if user explicitly logged out
    const savedRole = localStorage.getItem(AUTH_STORAGE_KEYS.ROLE);
    if (savedRole === 'none') return null;

    // Default active session for instant responsiveness
    const defaultDemo = DEMO_ACCOUNTS[0]; // Student Kwame Mensah
    return {
      id: 'usr-student-1',
      email: defaultDemo.email,
      name: defaultDemo.name,
      role: defaultDemo.role,
      department: defaultDemo.department,
      studentId: defaultDemo.studentId,
      avatarUrl: defaultDemo.avatarUrl,
    };
  });

  const [role, setRole] = useState<UserRole | null>(() => {
    const savedRole = localStorage.getItem(AUTH_STORAGE_KEYS.ROLE);
    if (savedRole === 'none') return null;
    if (savedRole === 'student' || savedRole === 'lecturer' || savedRole === 'admin') {
      return savedRole;
    }
    return user ? user.role : 'student';
  });

  const [activeLecturerPersona, setActiveLecturerPersonaState] = useState(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEYS.LECTURER);
    if (saved) {
      try {
        const found = LECTURER_PERSONAS.find((p) => p.name === saved);
        if (found) return found;
      } catch (e) {
        console.error(e);
      }
    }
    return LECTURER_PERSONAS[0]; // Dr Adane default
  });

  const setActiveLecturerPersona = (persona: typeof LECTURER_PERSONAS[0]) => {
    setActiveLecturerPersonaState(persona);
    localStorage.setItem(AUTH_STORAGE_KEYS.LECTURER, persona.name);
    // If current role is lecturer, update user name/email to match
    if (user && user.role === 'lecturer') {
      const updatedUser: User = {
        ...user,
        name: persona.name,
        email: persona.email,
        department: persona.department,
        lecturerTitle: `${persona.name} (${persona.courseCode})`,
      };
      setUser(updatedUser);
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }
  };

  const login = (email: string, password: string, roleOverride?: UserRole): { success: boolean; message: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    const matchedDemo = DEMO_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === trimmedEmail && acc.password === password
    );

    if (matchedDemo) {
      const newUser: User = {
        id: `usr-${matchedDemo.role}-${Date.now()}`,
        email: matchedDemo.email,
        name: matchedDemo.name,
        role: matchedDemo.role,
        department: matchedDemo.department,
        studentId: matchedDemo.studentId,
        lecturerTitle: matchedDemo.lecturerTitle,
        assignedCourseCodes: matchedDemo.assignedCourseCodes,
        avatarUrl: matchedDemo.avatarUrl,
      };

      setUser(newUser);
      setRole(matchedDemo.role);
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(newUser));
      localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, matchedDemo.role);
      return { success: true, message: `Welcome back, ${matchedDemo.name}! Logged in as ${matchedDemo.role.toUpperCase()}.` };
    }

    // If roleOverride provided or email matches domain format
    const targetRole: UserRole = roleOverride || (trimmedEmail.includes('admin') ? 'admin' : (trimmedEmail.includes('lecturer') ? 'lecturer' : 'student'));
    
    // Validate credentials check
    if (!password || password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const fallbackDemo = DEMO_ACCOUNTS.find((a) => a.role === targetRole) || DEMO_ACCOUNTS[0];
    const newUser: User = {
      id: `usr-${targetRole}-${Date.now()}`,
      email: trimmedEmail,
      name: trimmedEmail.split('@')[0].toUpperCase(),
      role: targetRole,
      department: fallbackDemo.department,
      studentId: targetRole === 'student' ? 'PS/ITC/23/0099' : undefined,
      lecturerTitle: targetRole === 'lecturer' ? 'Visiting Lecturer' : undefined,
      avatarUrl: fallbackDemo.avatarUrl,
    };

    setUser(newUser);
    setRole(targetRole);
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(newUser));
    localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, targetRole);
    return { success: true, message: `Logged in successfully as ${targetRole.toUpperCase()}.` };
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, 'none');
  };

  const switchRole = (newRole: UserRole) => {
    const demo = DEMO_ACCOUNTS.find((d) => d.role === newRole) || DEMO_ACCOUNTS[0];
    const newUser: User = {
      id: `usr-${newRole}-${Date.now()}`,
      email: demo.email,
      name: demo.name,
      role: newRole,
      department: demo.department,
      studentId: demo.studentId,
      lecturerTitle: demo.lecturerTitle,
      assignedCourseCodes: demo.assignedCourseCodes,
      avatarUrl: demo.avatarUrl,
    };

    setUser(newUser);
    setRole(newRole);
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(newUser));
    localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user && !!role,
        login,
        logout,
        switchRole,
        activeLecturerPersona,
        setActiveLecturerPersona,
        demoAccounts: DEMO_ACCOUNTS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
