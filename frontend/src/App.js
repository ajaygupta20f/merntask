import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import TaskList from './components/TaskList';
import './App.css';

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <div className="App">
      {currentUser ? <TaskList /> : <Auth />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
