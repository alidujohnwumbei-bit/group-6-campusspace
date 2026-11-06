import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { LECTURER_PERSONAS } from '../data/mockData';

export type CampusRole = 'Student' | 'Lecturer' | 'Administrator';

export interface CampusUserAccount {
  name: string;
  email: string;
  password: string;
  role: CampusRole;
  id?: string;
  department?: string;
  studentId?: string;
  lecturerTitle?: string;
  assignedCourseCodes?: string[];
  avatarUrl?: string;
}

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: CampusRole | string) => Promise<{ success: boolean; message: string }>;
  signup: (name: string, email: string, password: string, role: CampusRole | string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  // Dashboard & persona helpers
  switchRole: (newRole: UserRole | CampusRole) => void;
  activeLecturerPersona: typeof LECTURER_PERSONAS[0];
  setActiveLecturerPersona: (persona: typeof LECTURER_PERSONAS[0]) => void;
  registeredUsers: User[];
  addNewUser: (userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    department?: string;
    studentId?: string;
    lecturerTitle?: string;
  }) => Promise<{ success: boolean; message: string }>;
  deleteUser: (userId: string) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// LocalStorage Keys
const STORAGE_KEY_USER = 'campusUser';
const STORAGE_KEY_USERS_LIST = 'campusUsers';

// Default Accounts for instant testing
const DEFAULT_ACCOUNTS: CampusUserAccount[] = [
  {
    name: 'System Administrator',
    email: 'admin@campus.edu',
    password: 'Admin123',
    role: 'Administrator',
    id: 'usr-admin-1',
    department: 'DIRECTORATE OF ACADEMIC AFFAIRS',
    lecturerTitle: 'System Administrator',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dr. Adane',
    email: 'lecturer@campus.edu',
    password: 'Lecturer123',
    role: 'Lecturer',
    id: 'usr-lec-1',
    department: 'MATHS AND ICT',
    lecturerTitle: 'Dr. Adane (Faculty)',
    assignedCourseCodes: ['EIT311', 'EIT302', 'INF309'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Kwame Mensah',
    email: 'student@campus.edu',
    password: 'Student123',
    role: 'Student',
    id: 'usr-student-1',
    department: 'MATHS AND ICT',
    studentId: 'PS/ITC/23/0042',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initialize Users in localStorage key 'campusUsers'
  const [campusUsers, setCampusUsers] = useState<CampusUserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS_LIST);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure default admin exists
          const hasAdmin = parsed.some((u) => u.email?.toLowerCase() === 'admin@campus.edu');
          if (!hasAdmin) {
            const merged = [...parsed, DEFAULT_ACCOUNTS[0]];
            localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading campusUsers:', e);
    }

    // Default Seed on First Load
    localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(DEFAULT_ACCOUNTS));
    return DEFAULT_ACCOUNTS;
  });

  // 2. Manage User State from key 'campusUser'
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading campusUser:', e);
    }
    return null;
  });

  // Keep active lecturer persona in sync
  const [activeLecturerPersona, setActiveLecturerPersonaState] = useState(() => {
    return LECTURER_PERSONAS[0];
  });

  const setActiveLecturerPersona = (persona: typeof LECTURER_PERSONAS[0]) => {
    setActiveLecturerPersonaState(persona);
    if (user && (user.role === 'Lecturer' || user.role === 'lecturer')) {
      const updatedUser: User = {
        ...user,
        name: persona.name,
        email: persona.email,
        department: persona.department,
        lecturerTitle: `${persona.name} (Faculty)`,
      };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    }
  };

  // Helper to normalize role
  const normalizeRole = (r?: string | null): CampusRole => {
    if (!r) return 'Student';
    const low = r.toLowerCase();
    if (low.includes('admin')) return 'Administrator';
    if (low.includes('lec') || low.includes('fac')) return 'Lecturer';
    return 'Student';
  };

  // 3. Login function
  const login = async (
    email: string,
    password: string,
    requestedRole?: CampusRole | string
  ): Promise<{ success: boolean; message: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return { success: false, message: 'Please enter your email address.' };
    }
    if (!password) {
      return { success: false, message: 'Please enter your password.' };
    }

    // Read fresh users list from localStorage
    let currentUsers: CampusUserAccount[] = campusUsers;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS_LIST);
      if (saved) {
        currentUsers = JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }

    // Find account by email (or fallback aliases)
    let found = currentUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!found) {
      if (trimmedEmail === 'admin@ucc.edu.gh') {
        found = currentUsers.find((u) => u.email.toLowerCase() === 'admin@campus.edu');
      } else if (trimmedEmail === 'lecturer@ucc.edu.gh') {
        found = currentUsers.find((u) => u.email.toLowerCase() === 'lecturer@campus.edu');
      } else if (trimmedEmail === 'student@ucc.edu.gh') {
        found = currentUsers.find((u) => u.email.toLowerCase() === 'student@campus.edu');
      }
    }

    if (!found) {
      return { success: false, message: 'No registered user found with this email address.' };
    }

    // Verify Password
    if (found.password !== password) {
      return { success: false, message: 'Incorrect password. Please verify your credentials.' };
    }

    // If role requested, verify matching
    if (requestedRole) {
      const normRequested = normalizeRole(requestedRole);
      const normFound = normalizeRole(found.role);
      if (normRequested !== normFound) {
        return {
          success: false,
          message: `Account is registered as ${normFound}, but ${normRequested} was selected.`,
        };
      }
    }

    const sessionUser: User = {
      id: found.id || `usr-${Date.now()}`,
      name: found.name,
      email: found.email,
      role: normalizeRole(found.role),
      department: found.department || (normalizeRole(found.role) === 'Administrator' ? 'Directorate of Academic Affairs' : 'Maths and ICT'),
      studentId: found.studentId || (normalizeRole(found.role) === 'Student' ? 'PS/ITC/23/0042' : undefined),
      lecturerTitle: found.lecturerTitle || (normalizeRole(found.role) === 'Lecturer' ? `${found.name} (Faculty)` : undefined),
      assignedCourseCodes: found.assignedCourseCodes,
      avatarUrl: found.avatarUrl,
    };

    // Save to localStorage key 'campusUser'
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(sessionUser));
    setUser(sessionUser);

    return {
      success: true,
      message: `Welcome back, ${sessionUser.name}!`,
    };
  };

  // 4. Signup function
  const signup = async (
    name: string,
    email: string,
    password: string,
    roleInput: CampusRole | string
  ): Promise<{ success: boolean; message: string }> => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      return { success: false, message: 'Full name is required.' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, message: 'Valid email address is required.' };
    }
    if (!password || password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    let currentUsers: CampusUserAccount[] = campusUsers;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS_LIST);
      if (saved) {
        currentUsers = JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }

    // Check if email already exists
    const exists = currentUsers.some((u) => u.email.toLowerCase() === trimmedEmail);
    if (exists) {
      return { success: false, message: 'An account with this email address already exists. Please log in.' };
    }

    const assignedRole = normalizeRole(roleInput);

    const newAccount: CampusUserAccount = {
      id: `usr-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      password: password,
      role: assignedRole,
      department: assignedRole === 'Administrator' ? 'Directorate of Academic Affairs' : 'Maths and ICT',
      studentId: assignedRole === 'Student' ? `STU-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      lecturerTitle: assignedRole === 'Lecturer' ? `${trimmedName} (Faculty)` : undefined,
      avatarUrl:
        assignedRole === 'Student'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : assignedRole === 'Lecturer'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    };

    const updatedUsers = [...currentUsers, newAccount];
    setCampusUsers(updatedUsers);
    localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(updatedUsers));

    // Save session in localStorage key 'campusUser'
    const sessionUser: User = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      role: assignedRole,
      department: newAccount.department,
      studentId: newAccount.studentId,
      lecturerTitle: newAccount.lecturerTitle,
      avatarUrl: newAccount.avatarUrl,
    };

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(sessionUser));
    setUser(sessionUser);

    return {
      success: true,
      message: 'Account created successfully!',
    };
  };

  // 5. Logout function
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  }, []);

  // Quick switch role for testing
  const switchRole = (newRole: UserRole | CampusRole) => {
    const target = normalizeRole(newRole);
    const demo = DEFAULT_ACCOUNTS.find((d) => d.role === target) || DEFAULT_ACCOUNTS[0];

    const sessionUser: User = {
      id: demo.id,
      email: demo.email,
      name: demo.name,
      role: target,
      department: demo.department,
      studentId: demo.studentId,
      lecturerTitle: demo.lecturerTitle,
      assignedCourseCodes: demo.assignedCourseCodes,
      avatarUrl: demo.avatarUrl,
    };

    setUser(sessionUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(sessionUser));
  };

  // Add New User (Admin console)
  const addNewUser = async (userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    department?: string;
    studentId?: string;
    lecturerTitle?: string;
  }): Promise<{ success: boolean; message: string }> => {
    return signup(userData.name, userData.email, userData.password, userData.role);
  };

  // Delete User (Admin console)
  const deleteUser = (userId: string) => {
    const target = campusUsers.find((u) => u.id === userId);
    if (target?.email === 'admin@campus.edu') {
      return { success: false, message: 'The primary system administrator cannot be deleted.' };
    }

    const updated = campusUsers.filter((u) => u.id !== userId);
    setCampusUsers(updated);
    localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(updated));
    return { success: true, message: 'User removed successfully.' };
  };

  const registeredUsers: User[] = campusUsers.map((u) => ({
    id: u.id || u.email,
    name: u.name,
    email: u.email,
    role: normalizeRole(u.role),
    department: u.department,
    studentId: u.studentId,
    lecturerTitle: u.lecturerTitle,
    avatarUrl: u.avatarUrl,
  }));

  const effectiveRole: UserRole | null = user
    ? (user.role.toLowerCase() as UserRole)
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: effectiveRole,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        switchRole,
        activeLecturerPersona,
        setActiveLecturerPersona,
        registeredUsers,
        addNewUser,
        deleteUser,
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
