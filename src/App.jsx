import { useState, useRef } from "react";

const filters = ["All", "Active", "Done"];

export default function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Design something beautiful", done: false },
    { id: 2, text: "Finish the quarterly report", done: false },
    { id: 3, text: "Morning run — 5km", done: true },
  ]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);
  const nextId = useRef(100);

  const addTodo = () => {
    if (!input.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setTodos([
      { id: nextId.current++, text: input.trim(), done: false },
      ...todos,
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggle = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id) => setTodos(todos.filter((t) => t.id !== id));

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const confirmEdit = (id) => {
    if (!editText.trim()) return;
    setTodos(todos.map((t) => (t.id === id ? { ...t, text: editText.trim() } : t)));
    setEditingId(null);
  };

  const clearDone = () => setTodos(todos.filter((t) => !t.done));

  const filtered = todos.filter((t) => {
    if (filter === "Active") return !t.done;
    if (filter === "Done") return t.done;
    return true;
  });

  const doneCount = todos.filter((t) => t.done).length;
  const progress = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;

  return (
    <div style={styles.root}>
      <style>{css}</style>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.dateLabel}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <h1 style={styles.title}>My Tasks</h1>
          </div>
          <div style={styles.progressWrap}>
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="#1e1e2e" strokeWidth="5" />
              <circle
                cx="36" cy="36" r="30" fill="none"
                stroke="#FFD93D" strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={`${2 * Math.PI * 30 * (1 - progress / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 36 36)"
                style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)" }}
              />
            </svg>
            <span style={styles.progressText}>{progress}%</span>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.stats}>
          <span style={styles.statItem}>{todos.length} total</span>
          <span style={styles.dot}>·</span>
          <span style={{ ...styles.statItem, color: "#4ECDC4" }}>{todos.length - doneCount} active</span>
          <span style={styles.dot}>·</span>
          <span style={{ ...styles.statItem, color: "#95E1A3" }}>{doneCount} done</span>
        </div>

        {/* Input */}
        <div style={styles.inputRow} className={shake ? "shake" : ""}>
          <input
            ref={inputRef}
            style={styles.input}
            placeholder="Add a new task…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button style={styles.addBtn} onClick={addTodo} className="add-btn">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 4v14M4 11h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Filter tabs */}
        <div style={styles.filters}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                color: filter === f ? "#FFD93D" : "#555570",
                borderBottom: filter === f ? "2px solid #FFD93D" : "2px solid transparent",
              }}
            >
              {f}
            </button>
          ))}
          {doneCount > 0 && (
            <button onClick={clearDone} style={styles.clearBtn}>
              Clear done
            </button>
          )}
        </div>

        {/* Todo list */}
        <ul style={styles.list}>
          {filtered.length === 0 && (
            <li style={styles.empty}>
              {filter === "Done" ? "Nothing completed yet." : "All clear! 🎉"}
            </li>
          )}
          {filtered.map((todo) => (
            <li key={todo.id} style={styles.todoItem} className="todo-item">
              {/* Custom Checkbox */}
              <button
                onClick={() => toggle(todo.id)}
                style={{
                  ...styles.checkbox,
                  background: todo.done ? "#FFD93D" : "transparent",
                  borderColor: todo.done ? "#FFD93D" : "#444460",
                }}
                className="check-btn"
              >
                {todo.done && (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path
                      d="M2 6.5l3.5 3.5 5.5-6"
                      stroke="#12121e"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingId === todo.id ? (
                  <input
                    autoFocus
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmEdit(todo.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={() => confirmEdit(todo.id)}
                    style={styles.editInput}
                  />
                ) : (
                  <span
                    style={{
                      ...styles.todoText,
                      textDecoration: todo.done ? "line-through" : "none",
                      color: todo.done ? "#555570" : "#e0e0f0",
                    }}
                    onDoubleClick={() => startEdit(todo)}
                  >
                    {todo.text}
                  </span>
                )}
              </div>

              {/* Delete */}
              <button onClick={() => remove(todo.id)} style={styles.deleteBtn} className="delete-btn">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        <div style={styles.hint}>Double-click a task to edit</div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    width: "100vw",
    background: "#0d0d1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    margin: 0,
    padding: 0,
  },
  container: {
    width: "100%",
    maxWidth: "700px",
    padding: "48px 40px 32px",
    background: "#12121e",
    borderRadius: "28px",
    boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
    margin: "40px 24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px",
  },
  dateLabel: {
    fontSize: "13px",
    color: "#555570",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "6px",
    fontWeight: 500,
  },
  title: {
    fontSize: "42px",
    fontWeight: 800,
    color: "#e0e0f0",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  progressWrap: {
    position: "relative",
    width: "72px",
    height: "72px",
    flexShrink: 0,
  },
  progressText: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 700,
    color: "#FFD93D",
  },
  stats: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "32px",
  },
  statItem: { fontSize: "14px", color: "#888899" },
  dot: { color: "#333348", fontSize: "16px" },
  inputRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },
  input: {
    flex: 1,
    background: "#1e1e2e",
    border: "1.5px solid #2a2a3e",
    borderRadius: "14px",
    padding: "15px 20px",
    fontSize: "16px",
    color: "#e0e0f0",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  addBtn: {
    width: "54px",
    height: "54px",
    borderRadius: "14px",
    background: "#FFD93D",
    border: "none",
    color: "#12121e",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "transform 0.15s, background 0.2s",
  },
  filters: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #1e1e2e",
    paddingBottom: "14px",
  },
  filterBtn: {
    background: "none",
    border: "none",
    padding: "6px 16px",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 600,
    transition: "color 0.2s",
    letterSpacing: "0.02em",
  },
  clearBtn: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    color: "#FF6B6B",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: "8px",
    transition: "background 0.2s",
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxHeight: "450px",
    overflowY: "auto",
  },
  empty: {
    textAlign: "center",
    color: "#555570",
    fontSize: "15px",
    padding: "48px 0",
  },
  todoItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "18px 20px",
    background: "#1a1a2e",
    borderRadius: "16px",
    border: "1px solid #1e1e32",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  checkbox: {
    width: "28px",
    height: "28px",
    minWidth: "28px",
    minHeight: "28px",
    maxWidth: "28px",
    maxHeight: "28px",
    borderRadius: "8px",
    border: "2px solid",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s ease",
    background: "transparent",
    padding: 0,
  },
  todoText: {
    fontSize: "16px",
    display: "block",
    fontWeight: 500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    transition: "color 0.3s",
    cursor: "default",
  },
  editInput: {
    background: "transparent",
    border: "none",
    borderBottom: "1.5px solid #FFD93D",
    color: "#e0e0f0",
    fontSize: "16px",
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    padding: "0 0 2px",
    fontWeight: 500,
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#333348",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "8px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s, background 0.2s",
  },
  hint: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "12px",
    color: "#333348",
    letterSpacing: "0.05em",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; padding: 0; }

  .add-btn:hover { transform: scale(1.08); background: #ffe566 !important; }
  .add-btn:active { transform: scale(0.95); }

  .todo-item:hover { transform: translateX(6px); box-shadow: 0 4px 24px rgba(0,0,0,0.3); }

  .check-btn:hover { transform: scale(1.15); }

  .delete-btn:hover { color: #FF6B6B !important; background: rgba(255,107,107,0.1) !important; }

  input:focus { border-color: #FFD93D !important; }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
  }
  .shake { animation: shake 0.4s ease; }

  ul::-webkit-scrollbar { width: 5px; }
  ul::-webkit-scrollbar-track { background: transparent; }
  ul::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 4px; }
`;