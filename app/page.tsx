"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, BookOpen, Plus, Edit, Trash2, Eye, Library } from "lucide-react";

interface Author {
  id: string;
  name: string;
  email: string;
  nationality?: string;
  birthYear?: number;
  bio?: string;
  books: Book[];
}
interface Book {
  id: string;
  title: string;
  genre?: string;
}

export default function Dashboard() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [form, setForm] = useState({ name: "", email: "", nationality: "", birthYear: "", bio: "" });
  const [toast, setToast] = useState<{msg: string, type: "success"|"error"} | null>(null);

  const showToast = (msg: string, type: "success"|"error" = "success") => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAuthors = async () => {
    setLoading(true);
    const res = await fetch("/api/authors");
    const data = await res.json();
    setAuthors(data);
    setLoading(false);
  };

  useEffect(() => { fetchAuthors(); }, []);

  const handleSubmit = async () => {
    const method = editingAuthor ? "PUT" : "POST";
    const url = editingAuthor ? `/api/authors/${editingAuthor.id}` : "/api/authors";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, birthYear: form.birthYear ? parseInt(form.birthYear) : undefined }),
    });
    setShowForm(false);
    setEditingAuthor(null);
    setForm({ name: "", email: "", nationality: "", birthYear: "", bio: "" });
    fetchAuthors();
    showToast(editingAuthor ? "✏️ Autor actualizado correctamente" : "🎉 Autor creado correctamente");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este autor?")) return;
    await fetch(`/api/authors/${id}`, { method: "DELETE" });
    fetchAuthors();
    showToast("🗑️ Autor eliminado correctamente");
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setForm({
      name: author.name, email: author.email,
      nationality: author.nationality || "",
      birthYear: author.birthYear?.toString() || "",
      bio: author.bio || "",
    });
    setShowForm(true);
  };

  const totalBooks = authors.reduce((sum, a) => sum + a.books.length, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#fdf6f0", fontFamily: "sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999,
          background: toast.type === "success" ? "#6b2232" : "#c64d40",
          color: "#ffc865", padding: "1rem 1.5rem", borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(107,34,50,0.4)",
          display: "flex", alignItems: "center", gap: "0.8rem",
          fontSize: "0.95rem", fontWeight: 600,
          animation: "slideIn 0.3s ease",
        }}>
          {toast.msg}
        </div>
      )}

      {/* HERO */}
      <div style={{
        background: "linear-gradient(135deg, #6b2232 0%, #903238 50%, #c64d40 100%)",
        padding: "4rem 2rem 5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-60px", left: "-60px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,196,101,0.08)" }} />
        <div style={{ position: "absolute", bottom: "-40px", right: "-40px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,132,86,0.1)" }} />
        <div style={{ position: "absolute", top: "20px", right: "15%", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,196,101,0.06)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,196,101,0.15)", marginBottom: "1.2rem", border: "2px solid rgba(255,196,101,0.3)" }}>
            <Library size={40} color="#ffc865" />
          </div>
          <h1 style={{ color: "#ffc865", margin: "0 0 0.5rem", fontSize: "3rem", fontWeight: 800, letterSpacing: "-1px" }}>
            Librarium
          </h1>
          <p style={{ color: "#ff8456", margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 500 }}>
            Sistema de Gestión de Biblioteca
          </p>
          <p style={{ color: "rgba(255,255,255,0.6)", margin: "0 0 2rem", fontSize: "0.95rem" }}>
            Gestiona autores, libros y colecciones en un solo lugar
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => { setShowForm(true); setEditingAuthor(null); setForm({ name: "", email: "", nationality: "", birthYear: "", bio: "" }); }}
              style={{ background: "#ffc865", color: "#6b2232", border: "none", padding: "0.8rem 1.8rem", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Plus size={18} /> Nuevo Autor
            </button>
            <Link href="/books"
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", padding: "0.8rem 1.8rem", borderRadius: "10px", textDecoration: "none", fontWeight: 600, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BookOpen size={18} /> Ver Libros
            </Link>
          </div>
        </div>
      </div>

      {/* Ola decorativa */}
      <div style={{ background: "#6b2232", height: "40px", clipPath: "ellipse(55% 100% at 50% 0%)", marginTop: "-1px" }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2.5rem", marginTop: "0.5rem" }}>
          {[
            { icon: <Users size={28} color="#ffc865" />, label: "Total autores", value: authors.length, bg: "#6b2232" },
            { icon: <BookOpen size={28} color="#ffc865" />, label: "Total libros", value: totalBooks, bg: "#903238" },
            { icon: <Library size={28} color="#ffc865" />, label: "Géneros únicos", value: [...new Set(authors.flatMap(a => a.books.map(b => b.genre)).filter(Boolean))].length, bg: "#c64d40" },
          ].map(({ icon, label, value, bg }) => (
            <div key={label} style={{ background: bg, borderRadius: "16px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", boxShadow: "0 4px 15px rgba(107,34,50,0.2)" }}>
              <div style={{ background: "rgba(255,196,101,0.15)", borderRadius: "10px", padding: "0.7rem", display: "flex" }}>{icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#ff8456" }}>{label}</p>
                <p style={{ margin: 0, fontSize: "2rem", fontWeight: 700, color: "#ffc865", lineHeight: 1.2 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Título sección */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ margin: 0, color: "#6b2232", fontSize: "1.4rem", fontWeight: 700 }}>Autores registrados</h2>
            <p style={{ margin: 0, color: "#903238", fontSize: "0.85rem" }}>{authors.length} autor{authors.length !== 1 ? "es" : ""} en el sistema</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditingAuthor(null); setForm({ name: "", email: "", nationality: "", birthYear: "", bio: "" }); }}
            style={{ background: "#c64d40", color: "white", border: "none", padding: "0.7rem 1.3rem", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, boxShadow: "0 3px 10px rgba(198,77,64,0.3)" }}>
            <Plus size={16} /> Nuevo Autor
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div style={{ background: "white", borderRadius: "16px", padding: "1.8rem", marginBottom: "1.5rem", border: "2px solid #c64d40", boxShadow: "0 4px 20px rgba(198,77,64,0.1)" }}>
            <h3 style={{ color: "#6b2232", marginTop: 0, fontSize: "1.1rem" }}>{editingAuthor ? "✏️ Editar Autor" : "➕ Nuevo Autor"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[
                { label: "Nombre *", key: "name", placeholder: "Gabriel García Márquez" },
                { label: "Email *", key: "email", placeholder: "autor@email.com" },
                { label: "Nacionalidad", key: "nationality", placeholder: "Colombia" },
                { label: "Año de nacimiento", key: "birthYear", placeholder: "1927" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ display: "block", color: "#6b2232", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.85rem" }}>{label}</label>
                  <input value={form[key as keyof typeof form]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1.5px solid #f0d0c0", boxSizing: "border-box", outline: "none" }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", color: "#6b2232", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.85rem" }}>Biografía</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                placeholder="Breve biografía del autor..."
                style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1.5px solid #f0d0c0", boxSizing: "border-box", minHeight: "90px", resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: "0.8rem", marginTop: "1.2rem" }}>
              <button onClick={handleSubmit}
                style={{ background: "#6b2232", color: "#ffc865", border: "none", padding: "0.7rem 1.8rem", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>
                {editingAuthor ? "💾 Guardar cambios" : "✅ Crear autor"}
              </button>
              <button onClick={() => setShowForm(false)}
                style={{ background: "#f5f5f5", color: "#555", border: "none", padding: "0.7rem 1.5rem", borderRadius: "8px", cursor: "pointer" }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista autores */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#903238" }}>
            <Library size={48} color="#c64d40" style={{ marginBottom: "1rem" }} />
            <p>Cargando autores...</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {authors.map(author => (
              <div key={author.id} style={{ background: "white", borderRadius: "14px", padding: "1.5rem", border: "1px solid #f0d0c0", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(107,34,50,0.06)" }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(135deg, #6b2232, #c64d40)", color: "#ffc865", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.2rem", flexShrink: 0 }}>
                    {author.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 0.2rem", color: "#6b2232", fontSize: "1rem", fontWeight: 700 }}>{author.name}</h3>
                    <p style={{ margin: "0 0 0.5rem", color: "#903238", fontSize: "0.82rem" }}>{author.email}</p>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {author.nationality && <span style={{ background: "#fdf0e8", color: "#c64d40", padding: "0.2rem 0.7rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 600 }}>🌍 {author.nationality}</span>}
                      {author.birthYear && <span style={{ background: "#fff5e0", color: "#903238", padding: "0.2rem 0.7rem", borderRadius: "20px", fontSize: "0.72rem" }}>📅 {author.birthYear}</span>}
                      <span style={{ background: "#6b2232", color: "#ffc865", padding: "0.2rem 0.7rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 600 }}>📚 {author.books.length} libro{author.books.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem" }}>
                  <Link href={`/authors/${author.id}`} title="Ver detalle"
                    style={{ background: "#ff8456", color: "white", border: "none", padding: "0.6rem", borderRadius: "8px", cursor: "pointer", display: "flex", textDecoration: "none" }}>
                    <Eye size={16} />
                  </Link>
                  <button onClick={() => handleEdit(author)}
                    style={{ background: "#ffc865", color: "#6b2232", border: "none", padding: "0.6rem", borderRadius: "8px", cursor: "pointer", display: "flex" }}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(author.id)}
                    style={{ background: "#c64d40", color: "white", border: "none", padding: "0.6rem", borderRadius: "8px", cursor: "pointer", display: "flex" }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {authors.length === 0 && (
              <div style={{ textAlign: "center", padding: "4rem", color: "#903238", background: "white", borderRadius: "16px", border: "2px dashed #f0d0c0" }}>
                <Library size={48} color="#c64d40" style={{ marginBottom: "1rem", opacity: 0.5 }} />
                <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>No hay autores aún</p>
                <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>¡Crea el primero usando el botón de arriba!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "2rem", color: "#903238", fontSize: "0.82rem", marginTop: "2rem", borderTop: "1px solid #f0d0c0" }}>
        <p style={{ margin: 0 }}>📚 Librarium — Sistema de Gestión de Biblioteca · Desarrollado con Next.js + Prisma + Supabase</p>
      </div>
    </div>
  );
}