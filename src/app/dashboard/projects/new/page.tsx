import { createProject } from "../actions";

export default function NewProjectPage() {
  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1>New Project</h1>
      <p style={{ opacity: 0.7 }}>Create a sandbox project. You’ll add characters, locations, and scenes next.</p>

      <form action={createProject} style={{ marginTop: 16 }}>
        <label style={{ display: "block", marginBottom: 8 }}>Title</label>
        <input
  name="title"
  placeholder="My first sandbox project"
  style={{
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #444",
    background: "#fff",
    color: "#111", // <-- makes typed text visible
  }}
/>

        <button style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10 }}>
          Create Project
        </button>
      </form>
    </div>
  );
}
