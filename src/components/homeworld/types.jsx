export const Vec2 = (x, y) => ({ x, y });

export const defaultHomeLayout = {
  origin: 'front-door',
  size: { width: 12.0, height: 8.6 },
  doors: []
};

export const defaultColors = {
  doorClosed: '#22c55e',
  doorOpen: '#ef4444', 
  lockLocked: '#0ea5e9',
  lockUnlocked: '#a855f7',
  hover: '#ffffff22',
  background: '#00000044',
  outline: '#888888'
};