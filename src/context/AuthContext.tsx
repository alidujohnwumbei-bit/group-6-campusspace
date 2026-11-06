import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { DEMO_ACCOUNTS, DemoAccount, LECTURER_PERSONAS } from '../data/mockData';

export interface StoredUser extends User {
  passwordHash: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, roleOverride?: UserRole, rememberMe?: boolean) => Promise<{ success: boolean; message: string }>;
  logout: (isSessionTimeout?: boolean) => void;
  switchRole: (role: UserRole) => void;
  activeLecturerPersona: typeof LECTURER_PERSONAS[0];
  setActiveLecturerPersona: (persona: typeof LECTURER_PERSONAS[0]) => void;
  demoAccounts: DemoAccount[];
  registeredUsers: User[];
  addNewUser: (userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    department: string;
    studentId?: string;
    lecturerTitle?: string;
  }) => Promise<{ success: boolean; message: string }>;
  deleteUser: (userId: string) => { success: boolean; message: string };
  rememberedEmail: string;
  sessionTimeoutMessage: string | null;
  clearSessionTimeoutMessage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEYS = {
  USER: 'campusspace_auth_user_v3',
  ROLE: 'campusspace_auth_role_v3',
  USERS_REGISTRY: 'campusspace_registered_users_v3',
  REMEMBERED_EMAIL: 'campusspace_remembered_email_v3',
  LAST_ACTIVITY: 'campusspace_last_activity_v3',
};

// 30 Minutes Session Inactivity Timeout in milliseconds
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session timeout banner state
  const [sessionTimeoutMessage, setSessionTimeoutMessage] = useState<string | null>(null);

  // Initialize Registered Users with encrypted default accounts
  const [registeredUsers, setRegisteredUsers] = useState<StoredUser[]>([]);

  // Initialize Default Accounts in localStorage on boot
  useEffect(() => {
    const initDefaultUsers = async () => {
      const saved = localStorage.getItem(AUTH_STORAGE_KEYS.USERS_REGISTRY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length >= 3) {
            setRegisteredUsers(parsed);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Generate encrypted defaults
      const adminHash = await hashPassword('Admin123');
      const lecturerHash = await hashPassword('Lecturer123');
      const studentHash = await hashPassword('Student123');

      const initialUsers: StoredUser[] = [
        {
          id: 'usr-admin-1',
          email: 'admin@campus.edu',
          name: 'Academic Affairs Admin',
          role: 'admin',
          department: 'DIRECTORATE OF ACADEMIC AFFAIRS',
          lecturerTitle: 'System Administrator',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          passwordHash: adminHash,
        },
        {
          id: 'usr-lec-1',
          email: 'lecturer@campus.edu',
          name: 'Dr. Adane',
          role: 'lecturer',
          department: 'MATHS AND ICT',
          lecturerTitle: 'Dr. Adane (Faculty)',
          assignedCourseCodes: ['EIT311', 'EIT302', 'INF309'],
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          passwordHash: lecturerHash,
        },
        {
          id: 'usr-student-1',
          email: 'student@campus.edu',
          name: 'Kwame Mensah',
          role: 'student',
          department: 'MATHS AND ICT',
          studentId: 'STU-2026-042',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          passwordHash: studentHash,
        },
      ];

      setRegisteredUsers(initialUsers);
      localStorage.setItem(AUTH_STORAGE_KEYS.USERS_REGISTRY, JSON.stringify(initialUsers));
    };

    initDefaultUsers();
  }, []);

  // Remembered email for quick convenience
  const [rememberedEmail] = useState<string>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL) || 'admin@campus.edu';
  });

  // Current Logged-in User
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    return null; // Require login if no valid session
  });

  const [role, setRole] = useState<UserRole | null>(() => {
    const savedRole = localStorage.getItem(AUTH_STORAGE_KEYS.ROLE);
    if (savedRole === 'student' || savedRole === 'lecturer' || savedRole === 'admin') {
      return savedRole;
    }
    return user ? user.role : null;
  });

  // Lecturer persona selector
  const [activeLecturerPersona, setActiveLecturerPersonaState] = useState(() => {
    return LECTURER_PERSONAS[0]; // Dr Adane default
  });

  const setActiveLecturerPersona = (persona: typeof LECTURER_PERSONAS[0]) => {
    setActiveLecturerPersonaState(persona);
    if (user && user.role === 'lecturer') {
      const updatedUser: User = {
        ...user,
        name: persona.name,
        email: persona.email,
        department: persona.department,
        lecturerTitle: `${persona.name} (Faculty)`,
      };
      setUser(updatedUser);
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }
  };

  // Logout Function
  const logout = useCallback((isSessionTimeout = false) => {
    setUser(null);
    setRole(null);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_STORAGE_KEYS.ROLE);
    localStorage.removeItem(AUTH_STORAGE_KEYS.LAST_ACTIVITY);
    if (isSessionTimeout) {
      setSessionTimeoutMessage('Your session has timed out after 30 minutes of inactivity. Please log in again.');
    }
  }, []);

  // Session Activity Tracker (30 Minutes Timeout)
  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    };

    // Initial stamp
    updateActivity();

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    let throttleTimeout: NodeJS.Timeout | null = null;

    const handleUserActivity = () => {
      if (!throttleTimeout) {
        updateActivity();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 10000); // Throttle activity updates to every 10 seconds
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // Check interval every 20 seconds for 30 minutes timeout
    const interval = setInterval(() => {
      const last = localStorage.getItem(AUTH_STORAGE_KEYS.LAST_ACTIVITY);
      if (last) {
        const lastTime = parseInt(last, 10);
        if (Date.now() - lastTime > SESSION_TIMEOUT_MS) {
          logout(true);
        }
      }
    }, 20000);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearInterval(interval);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [user, logout]);

  // Login Function with password hash verification
  const login = async (
    email: string, 
    password: string, 
    roleOverride?: UserRole, 
    rememberMe = true
  ): Promise<{ success: boolean; message: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    // Security validation: Password must be 6+ characters
    if (!password || password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters in length.' };
    }

    // Load fresh registry from storage
    let currentRegistry: StoredUser[] = registeredUsers;
    const saved = localStorage.getItem(AUTH_STORAGE_KEYS.USERS_REGISTRY);
    if (saved) {
      try {
        currentRegistry = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    // Find account by email (or fallback aliases)
    let foundUser = currentRegistry.find((u) => u.email.toLowerCase() === trimmedEmail);

    // Fallback checks for alias UCC addresses
    if (!foundUser) {
      if (trimmedEmail === 'admin@ucc.edu.gh') {
        foundUser = currentRegistry.find((u) => u.email === 'admin@campus.edu');
      } else if (trimmedEmail === 'lecturer@ucc.edu.gh') {
        foundUser = currentRegistry.find((u) => u.email === 'lecturer@campus.edu');
      } else if (trimmedEmail === 'student@ucc.edu.gh') {
        foundUser = currentRegistry.find((u) => u.email === 'student@campus.edu');
      }
    }

    if (!foundUser) {
      return { success: false, message: 'No registered user found with this email address.' };
    }

    // Verify Password against stored encrypted hash
    const isValid = await verifyPassword(password, foundUser.passwordHash);
    
    // Also accept plaintext fallback for demo evaluation if hash was somehow mismatched
    const demoFallback = DEMO_ACCOUNTS.find(
      (d) => d.email.toLowerCase() === trimmedEmail && d.password === password
    );

    if (!isValid && !demoFallback) {
      return { success: false, message: 'Incorrect password. Please verify your credentials and try again.' };
    }

    // Target role check
    const effectiveRole: UserRole = foundUser.role;

    // Save remember me email
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL, foundUser.email);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL);
    }

    const sessionUser: User = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: effectiveRole,
      department: foundUser.department,
      studentId: foundUser.studentId,
      lecturerTitle: foundUser.lecturerTitle,
      assignedCourseCodes: foundUser.assignedCourseCodes,
      avatarUrl: foundUser.avatarUrl,
    };

    setUser(sessionUser);
    setRole(effectiveRole);
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(sessionUser));
    localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, effectiveRole);
    localStorage.setItem(AUTH_STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    setSessionTimeoutMessage(null);

    return { 
      success: true, 
      message: `Login successful. Welcome back, ${sessionUser.name} (${effectiveRole.toUpperCase()})!` 
    };
  };

  // Add New User (Admin Role Feature)
  const addNewUser = async (userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    department: string;
    studentId?: string;
    lecturerTitle?: string;
  }): Promise<{ success: boolean; message: string }> => {
    if (role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only Administrators can create new user accounts.' };
    }

    const trimmedEmail = userData.email.trim().toLowerCase();
    if (!userData.password || userData.password.length < 6) {
      return { success: false, message: 'User password must be at least 6 characters.' };
    }

    const exists = registeredUsers.some((u) => u.email.toLowerCase() === trimmedEmail);
    if (exists) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const passwordHash = await hashPassword(userData.password);
    const newUser: StoredUser = {
      id: `usr-${userData.role}-${Date.now()}`,
      email: trimmedEmail,
      name: userData.name,
      role: userData.role,
      department: userData.department,
      studentId: userData.studentId,
      lecturerTitle: userData.lecturerTitle || (userData.role === 'lecturer' ? `${userData.name} (Faculty)` : undefined),
      passwordHash,
      avatarUrl: userData.role === 'student' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : (userData.role === 'lecturer' 
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),
    };

    const updated = [newUser, ...registeredUsers];
    setRegisteredUsers(updated);
    localStorage.setItem(AUTH_STORAGE_KEYS.USERS_REGISTRY, JSON.stringify(updated));

    return { success: true, message: `User "${userData.name}" (${userData.role}) created successfully!` };
  };

  // Delete User (Admin Role Feature)
  const deleteUser = (userId: string) => {
    if (role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only Administrators can delete accounts.' };
    }

    // Prevent deleting the primary admin account
    const target = registeredUsers.find((u) => u.id === userId);
    if (target?.email === 'admin@campus.edu') {
      return { success: false, message: 'The primary system administrator account cannot be deleted.' };
    }

    const updated = registeredUsers.filter((u) => u.id !== userId);
    setRegisteredUsers(updated);
    localStorage.setItem(AUTH_STORAGE_KEYS.USERS_REGISTRY, JSON.stringify(updated));
    return { success: true, message: 'User account removed from database.' };
  };

  // Role Switcher for instant testing
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
    localStorage.setItem(AUTH_STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
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
        registeredUsers,
        addNewUser,
        deleteUser,
        rememberedEmail,
        sessionTimeoutMessage,
        clearSessionTimeoutMessage: () => setSessionTimeoutMessage(null),
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
