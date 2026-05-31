export const NAVIGATION_ITEMS = [
  { id: 'admin', label: 'Administration', icon: 'Shield', roles: ['admin'] },
  { id: 'supervision', label: 'Supervision', icon: 'Visiblity', roles: ['admin', 'supervisor'] },
  { id: 'teacher', label: 'Teachers', icon: 'UserCircle', roles: ['admin', 'teacher'] },
  { id: 'trainee', label: 'Trainees', icon: 'GraduationCap', roles: ['admin', 'trainee'] },
  { id: 'parent', label: 'Parent Portal', icon: 'Heart', roles: ['admin', 'parent'] },
];

export const ATTENDANCE_COLORS = {
  present: 'bg-green-500',
  absent: 'bg-red-500',
  excused: 'bg-blue-500',
  suspended: 'bg-purple-500',
  late: 'bg-yellow-500',
  dropped: 'bg-gray-500'
};

export const COLORS = {
  primary: '#0F172A', // Slate 900 / High Density Deep Blue
  gold: '#FBBF24',    // Amber 400
  accent: '#D97706',  // Amber 600
  bg: '#F8FAFC',      // Slate 50
  white: '#FFFFFF'
};
