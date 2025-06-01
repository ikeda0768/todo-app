import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [taskText, setTaskText] = useState('');
  const [taskMemo, setTaskMemo] = useState('');
  const [taskPriority, setTaskPriority] = useState('中');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskList, setTaskList] = useState([]);
  const [editingDateId, setEditingDateId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTemp, setEditTemp] = useState({});
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}（${['日','月','火','水','木','金','土'][now.getDay()]}）${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const handleAddTask = () => {
    if (taskText.trim() === '') return;
    const newTask = {
      id: Date.now(),
      text: taskText,
      memo: taskMemo,
      priority: taskPriority,
      dueDate: taskDueDate,
    };
    setTaskList([...taskList, newTask]);
    setTaskText('');
    setTaskMemo('');
    setTaskPriority('中');
    setTaskDueDate('');
  };

  const handleDeleteTask = (id) => {
    setTaskList(taskList.filter((task) => task.id !== id));
  };

  const handlePostponeTask = (id) => {
    const newList = taskList.map((task) => {
      if (task.id === id && task.dueDate) {
        const date = new Date(task.dueDate);
        date.setDate(date.getDate() + 1);
        return { ...task, dueDate: date.toISOString().slice(0, 10) };
      }
      return task;
    });
    setTaskList(newList);
  };

  const handleChangeDueDate = (id, newDate) => {
    setTaskList(taskList.map((task) => task.id === id ? { ...task, dueDate: newDate } : task));
    setEditingDateId(null);
  };

  const handleEditField = (field, value) => {
    setEditTemp({ ...editTemp, [field]: value });
  };

  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditTemp({ text: task.text, memo: task.memo, priority: task.priority });
  };

  const handleSaveEdit = (id) => {
    setTaskList(taskList.map((task) => task.id === id ? { ...task, ...editTemp } : task));
    setEditingTaskId(null);
    setEditTemp({});
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditTemp({});
  };

  const sortedTaskList = [...taskList].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

   return (
    <div className="container">
      <h1>📅 今日のタスク</h1>
      <p>{formattedDate}</p>

      <div className="input-area">
        <input className="input-text" type="text" value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="タスク名" />
        <textarea className="input-memo" value={taskMemo} onChange={(e) => setTaskMemo(e.target.value)} placeholder="メモ（任意）" />
        <select className="input-select" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
          <option value="高">高</option>
          <option value="中">中</option>
          <option value="低">低</option>
        </select>
        <input className="input-date" type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
        <button className="add-button" onClick={handleAddTask}>＋</button>
      </div>

      <ul className="task-list">
        {sortedTaskList.map((task) => (
          <li key={task.id}>
            {editingTaskId === task.id ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editTemp.text || ''}
                  onChange={(e) => handleEditField('text', e.target.value)}
                />
                <textarea
                  value={editTemp.memo || ''}
                  onChange={(e) => handleEditField('memo', e.target.value)}
                />
                <select
                  value={editTemp.priority || '中'}
                  onChange={(e) => handleEditField('priority', e.target.value)}
                >
                  <option value="高">高</option>
                  <option value="中">中</option>
                  <option value="低">低</option>
                </select>
                <div className="task-buttons-top">
                  <button onClick={() => handleSaveEdit(task.id)}>💾 更新</button>
                  <button onClick={handleCancelEdit}>✖ キャンセル</button>
                </div>
              </div>
            ) : (
              <div className={`task-item ${task.priority === '高' ? 'high' : task.priority === '中' ? 'medium' : 'low'}`}>
                <div className="task-header">
                  <div>
                    <strong>{task.text}</strong>
                  </div>
                  <div className="task-buttons-top">
                    <button className="done-button" onClick={() => handleDeleteTask(task.id)}>✔ 完了</button>
                    <button className="edit-button" onClick={() => handleStartEdit(task)}>✏ 編集</button>
                  </div>
                </div>
                {task.memo && <p className="task-memo">🗒 {task.memo}</p>}
                {task.dueDate && <p className="task-date">📅 対応期限：{task.dueDate}</p>}
                <div className="task-buttons-bottom">
                  <button onClick={() => handlePostponeTask(task.id)}>📅 翌日に移動</button>
                  <button onClick={() => setEditingDateId(task.id)}>📅 指定日へ変更</button>
                  {editingDateId === task.id && (
                    <input
                      type="date"
                      value={task.dueDate}
                      onChange={(e) => handleChangeDueDate(task.id, e.target.value)}
                    />
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>


      {taskList.length === 0 && <p className="no-tasks">今日のタスクはありません。</p>}
    </div>
  );
}

export default App;
