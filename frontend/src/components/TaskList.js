import React, { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [buttonLoading, setButtonLoading] = useState({});

  const { userProfile, logout } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const setButtonLoadingState = (buttonId, isLoading) => {
    setButtonLoading(prev => ({
      ...prev,
      [buttonId]: isLoading
    }));
  };

  useEffect(() => {
    
    if (userProfile) {
      setTimeout(() => {
        fetchTasks();
      }, 500);
    }
  }, [userProfile]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching tasks...');
      const response = await taskAPI.getTasks();
      console.log('Tasks fetched:', response.data);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(`Failed to fetch tasks: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    setButtonLoadingState('add-task', true);
    try {
      const response = await taskAPI.createTask(newTask);
      setTasks([response.data, ...tasks]);
      setNewTask({ title: '', description: '' });
      setError('');
    } catch (error) {
      setError('Failed to create task');
    } finally {
      setButtonLoadingState('add-task', false);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    setButtonLoadingState(`update-${taskId}`, true);
    try {
      const response = await taskAPI.updateTask(taskId, updates);
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data : task
      ));
      setEditingTask(null);
      setError('');
    } catch (error) {
      setError('Failed to update task');
    } finally {
      setButtonLoadingState(`update-${taskId}`, false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) return;

    setButtonLoadingState(`delete-${taskId}`, true);
    try {
      await taskAPI.deleteTask(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
      setError('');
    } catch (error) {
      console.error('Delete task error:', error);
      if (error.response?.status === 403) {
        setError('Access denied: Only administrators can delete tasks');
      } else {
        setError(`Failed to delete task: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setButtonLoadingState(`delete-${taskId}`, false);
    }
  };

  const toggleComplete = (task) => {
    handleUpdateTask(task._id, { completed: !task.completed });
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Task App</h1>
        <div style={styles.userInfo}>
          <span>Welcome, {userProfile?.email} 
            <span style={{
              ...styles.roleTag,
              backgroundColor: userProfile?.role === 'admin' ? '#dc3545' : '#28a745'
            }}>
              {userProfile?.role}
            </span>
          </span>
          <button 
            onClick={async () => {
              setLogoutLoading(true);
              try {
                await logout();
              } finally {
                setLogoutLoading(false);
              }
            }}
            disabled={logoutLoading}
            style={{
              ...styles.logoutButton,
              opacity: logoutLoading ? 0.6 : 1,
              cursor: logoutLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {logoutLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      {userProfile?.role !== 'admin' && (
        <div style={styles.infoMessage}>
          <strong>Note:</strong> Only administrators can delete tasks. You can create, edit, and mark tasks as complete.
        </div>
      )}

      {/* Create Task Form */}
      <form onSubmit={handleCreateTask} style={styles.form}>
        <div style={styles.inputGroup}>
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            style={styles.input}
          />
          <button 
            type="submit" 
            disabled={buttonLoading['add-task']}
            style={{
              ...styles.addButton,
              opacity: buttonLoading['add-task'] ? 0.6 : 1,
              cursor: buttonLoading['add-task'] ? 'not-allowed' : 'pointer'
            }}
          >
            {buttonLoading['add-task'] ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </form>

      {/* Task List */}
      <div style={styles.taskList}>
        {loading ? (
          <div>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={styles.emptyState}>No tasks yet. Create your first task!</div>
        ) : (
          tasks.map(task => (
            <div key={task._id} style={{
              ...styles.taskItem,
              ...(task.completed ? styles.completedTask : {})
            }}>
              {editingTask === task._id ? (
                <EditTaskForm
                  task={task}
                  onSave={(updates) => handleUpdateTask(task._id, updates)}
                  onCancel={() => setEditingTask(null)}
                  isLoading={buttonLoading[`update-${task._id}`]}
                />
              ) : (
                <>
                  <div style={styles.taskContent}>
                    <h3 style={styles.taskTitle}>{task.title}</h3>
                    {task.description && (
                      <p style={styles.taskDescription}>{task.description}</p>
                    )}
                    <small style={styles.taskMeta}>
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                      {userProfile?.role === 'admin' && (
                        <span> | User: {task.userId}</span>
                      )}
                    </small>
                  </div>
                  <div style={styles.taskActions}>
                    <button
                      onClick={() => toggleComplete(task)}
                      disabled={buttonLoading[`update-${task._id}`]}
                      style={{
                        ...styles.actionButton,
                        backgroundColor: task.completed ? '#28a745' : '#6c757d',
                        opacity: buttonLoading[`update-${task._id}`] ? 0.6 : 1,
                        cursor: buttonLoading[`update-${task._id}`] ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {buttonLoading[`update-${task._id}`] 
                        ? 'Updating...' 
                        : (task.completed ? 'Completed' : 'Mark Complete')
                      }
                    </button>
                    <button
                      onClick={() => setEditingTask(task._id)}
                      disabled={buttonLoading[`update-${task._id}`] || (userProfile?.role === 'admin' && buttonLoading[`delete-${task._id}`])}
                      style={{
                        ...styles.actionButton,
                        opacity: (buttonLoading[`update-${task._id}`] || (userProfile?.role === 'admin' && buttonLoading[`delete-${task._id}`])) ? 0.6 : 1,
                        cursor: (buttonLoading[`update-${task._id}`] || (userProfile?.role === 'admin' && buttonLoading[`delete-${task._id}`])) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    {userProfile?.role === 'admin' && (
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        disabled={buttonLoading[`delete-${task._id}`]}
                        style={{
                          ...styles.actionButton,
                          backgroundColor: '#dc3545',
                          opacity: buttonLoading[`delete-${task._id}`] ? 0.6 : 1,
                          cursor: buttonLoading[`delete-${task._id}`] ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {buttonLoading[`delete-${task._id}`] ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const EditTaskForm = ({ task, onSave, onCancel, isLoading }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, description });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.editForm}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={styles.input}
        required
        disabled={isLoading}
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={styles.input}
        placeholder="Description"
        disabled={isLoading}
      />
      <div style={styles.editActions}>
        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            ...styles.saveButton,
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          disabled={isLoading}
          style={{
            ...styles.cancelButton,
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Segoe UI, Roboto, sans-serif',
    color: '#333'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '20px',
    background: 'linear-gradient(135deg, #007bff, #00c6ff)',
    borderRadius: '12px',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  roleTag: {
    marginLeft: '8px',
    padding: '4px 10px',
    borderRadius: '14px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#ff4d4f',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  form: {
    marginBottom: '25px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 3px 8px rgba(0,0,0,0.1)'
  },
  inputGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  input: {
    flex: 1,
    minWidth: '200px',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  },
  addButton: {
    padding: '12px 22px',
    background: 'linear-gradient(135deg, #00c6ff, #007bff)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'transform 0.2s ease'
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  taskItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  completedTask: {
    opacity: 0.8,
    backgroundColor: '#f0fdf4',
    textDecoration: 'line-through'
  },
  taskContent: {
    flex: 1
  },
  taskTitle: {
    margin: '0 0 6px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#222'
  },
  taskDescription: {
    margin: '0 0 6px 0',
    color: '#666'
  },
  taskMeta: {
    color: '#999',
    fontSize: '13px'
  },
  taskActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  actionButton: {
    padding: '8px 14px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  editForm: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  editActions: {
    display: 'flex',
    gap: '10px'
  },
  saveButton: {
    padding: '8px 14px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  cancelButton: {
    padding: '8px 14px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  error: {
    color: '#d32f2f',
    padding: '12px',
    backgroundColor: '#ffebee',
    borderRadius: '6px',
    marginBottom: '20px',
    fontWeight: '500'
  },
  infoMessage: {
    color: '#01579b',
    padding: '12px',
    backgroundColor: '#e3f2fd',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #90caf9'
  },
  emptyState: {
    textAlign: 'center',
    color: '#777',
    padding: '50px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '500',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
  }
};



export default TaskList;