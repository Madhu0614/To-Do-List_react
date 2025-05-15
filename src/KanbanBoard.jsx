import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './KanbanBoard.css';
import './sidebar.css';

const supabaseUrl = "https://ufgtavicqxafflqviucf.supabase.co";
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZ3RhdmljcXhhZmZscXZpdWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NDY0MzcsImV4cCI6MjA1ODQyMjQzN30.-zCF5IGYW5SOO16YC_5J-2X-tUWe7vTAzn83mmjeoDw';
const supabase = createClient(supabaseUrl, supabaseKey);

const statuses = [
  { key: "todo", label: "To Do", colorClass: "todo", icon: "📝" },
  { key: "inProgress", label: "In Progress", colorClass: "inprogress", icon: "⏳" },
  { key: "completed", label: "Completed", colorClass: "done", icon: "✅" },
];

function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [draggedId, setDraggedId] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState(statuses[0].key);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error) setTasks(data || []);
  };

  const addTask = async () => {
    if (!newTaskText.trim()) return alert("Please enter a task description");

    const newTask = {
      text: newTaskText.trim(),
      status: newTaskStatus,
      date: new Date().toISOString().split("T")[0],
    };

    const { error } = await supabase.from("tasks").insert([newTask]);
    if (!error) {
      setNewTaskText('');
      setNewTaskStatus(statuses[0].key);
      fetchTasks();
    }
  };

  const deleteTask = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) fetchTasks();
  };

  const updateTaskStatus = async (id, status) => {
    const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
    if (!error) fetchTasks();
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("taskId", id);
    setDraggedId(id);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("taskId");
    updateTaskStatus(id, newStatus);
    setDraggedId(null);
  };

  const renderTasks = (statusKey) => {
    const filtered = tasks.filter((task) => task.status === statusKey);
    if (filtered.length === 0) return <p className="empty-state">No tasks here</p>;

    return (
      <ul className="task-list">
        {filtered.map((task) => (
          <li
            key={task.id}
            className={`task-card ${statusKey} ${draggedId === task.id ? "dragging" : ""}`}
            draggable
            onDragStart={(e) => handleDragStart(e, task.id)}
            onDragEnd={() => setDraggedId(null)}
          >
            <div className="task-content">
              <span className="task-icon">{statuses.find(s => s.key === statusKey)?.icon}</span>
              <span>{task.text}</span>
              <span className="task-date">{task.date}</span>
            </div>
            <button onClick={() => deleteTask(task.id)} className="delete-btn" title="Delete">
              ✕
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">KanbanApp</h2>
        <div className="sidebar-user">
          <img src="/user-icon.png" alt="User" />
          <span className="user-name">John Doe</span>
        </div>
        <nav className="sidebar-nav">
          <a href="#">📋 Dashboard</a>
          <a href="#">⚙️ Settings</a>
          <a href="#">🔒 Logout</a>
        </nav>
      </aside>

      <div className="container">
        <h2 className="board-title">Kanban Board</h2>

        <div className="add-task-form">
          <input
            type="text"
            placeholder="Enter new task description..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
          />
          <select
            value={newTaskStatus}
            onChange={(e) => setNewTaskStatus(e.target.value)}
          >
            {statuses.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <button onClick={addTask} className="add-task-btn">
            Add Task
          </button>
        </div>

        <div className="columns">
          {statuses.map(({ key, label, colorClass, icon }) => (
            <div
              key={key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, key)}
              className={`column ${colorClass}`}
            >
              <div className="column-header">
                <h3>{icon} {label}</h3>
              </div>
              {renderTasks(key)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default KanbanBoard;