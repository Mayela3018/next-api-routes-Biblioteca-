"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Edit, Plus, BarChart2 } from "lucide-react";

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
  publishedYear?: number;
  pages?: number;
}
interface Stats {
  totalBooks: number;
  firstBook: { title: string; year: number } | null;
  latestBook: { title: string; year: number } | null;
  averagePages: number;
  genres: string[];
  longestBook: { title: string; pages: number } | null;
  shortestBook: { title: string; pages: number } | null;
}

export default function AuthorDetailPage() {
  const { id } = useParams();
  const [author, setAuthor] = useState<Author | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", nationality: "", birthYear: "", bio: "" });
  const [bookForm, setBookForm] = useState({ title: "", description: "", isbn: "", publishedYear: "", genre: "", pages: "" });
  const genres = ["Novela", "Cuento", "Poesía", "Ensayo", "Periodismo", "Biografía", "Historia", "Ciencia ficción"];

  const fetchData = async () => {
    setLoading(true);
    const [authorRes, statsRes] = await Promise.all([
      fetch(`/api/authors/${id}`),
      fetch(`/api/authors/${id}/stats`),
    ]);
    const authorData = await authorRes.json();
    const statsData = await statsRes.json();
    setAuthor(authorData);
    setStats(statsData);
    setForm({
      name: authorData.name, email: authorData.email,
      nationality: authorData.nationality || "",
      birthYear: authorData.birthYear?.toString() || "",
      bio: authorData.bio || "",
    });
    setLoading(false);
  };

  useEffect(() => { if (id) fetchData(); }, [id]);

  const handleEditSubmit = async () => {
    await fetch(`/api/authors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, birthYear: form.birthYear ? parseInt(form.birthYear) : undefined }),
    });
    setShowEditForm(false);
    fetchData();
  };

  const handleAddBook = async () => {
    await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...bookForm,
        authorId: id,
        publishedYear: bookForm.publishedYear ? parseInt(bookForm.publishedYear) : undefined,
        pages: bookForm.pages ? parseInt(bookForm.pages) : undefined,
      }),
    });
    setShowBookForm(false);
    setBookForm({ title: "", description: "", isbn: "", publishedYear: "", genre: "", pages: "" });
    fetchData();
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fdf6f0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <p style={{ color: "#903238", fontSize: "1.2rem" }}>Cargando autor...</p>
    </div>
  );

  if (!author) return (
    <div style={{ minHeight: "100vh", background: "#fdf6f0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <p style={{ color: "#c64d40" }}>Autor no encontrado.</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#fdf6f0", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#6b2232", padding: "1.5rem 2rem" }}>
        <Link href="/" style={{ color: "#ffc865", display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", marginBottom: "1rem", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Volver al dashboard
        </Link>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#ffc865", color: "#6b2232", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.5rem" }}>
              {author.name.charAt(0)}
            </div>
            <div>
              <h1 style={{ color: "#ffc865", margin: 0, fontSize: "1.8rem", fontWeight: 700 }}>{author.name}</h1>
              <p style={{ color: "#ff8456", margin: 0, fontSize: "0.9rem" }}>{author.email}</p>
            </div>
          </div>
          <button onClick={() => setShowEditForm(!showEditForm)}
            style={{ background: "#ff8456", color: "white", border: "none", padding: "0.6rem 1.2rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
            <Edit size={16} /> Editar autor
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
        {/* Formulario editar */}
        {showEditForm && (
          <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem", border: "2px solid #c64d40" }}>
            <h3 style={{ color: "#6b2232", marginTop: 0 }}>Editar información del autor</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[
                { label: "Nombre", key: "name" }, { label: "Email", key: "email" },
                { label: "Nacionalidad", key: "nationality" }, { label: "Año nacimiento", key: "birthYear" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ display: "block", color: "#6b2232", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.85rem" }}>{label}</label>
                  <input value={form[key as keyof typeof form]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", color: "#6b2232", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.85rem" }}>Biografía</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box", minHeight: "80px" }} />
            </div>
            <div style={{ display: "flex", gap: "0.8rem", marginTop: "1rem" }}>
              <button onClick={handleEditSubmit}
                style={{ background: "#6b2232", color: "#ffc865", border: "none", padding: "0.6rem 1.5rem", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
                Guardar cambios
              </button>
              <button onClick={() => setShowEditForm(false)}
                style={{ background: "#eee", color: "#333", border: "none", padding: "0.6rem 1.5rem", borderRadius: "8px", cursor: "pointer" }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1.5rem" }}>
          {/* Info + Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Info básica */}
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", border: "1px solid #f0d0c0" }}>
              <h3 style={{ color: "#6b2232", marginTop: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Información
              </h3>
              {author.nationality && <p style={{ margin: "0.5rem 0", color: "#555", fontSize: "0.9rem" }}><span style={{ color: "#903238", fontWeight: 600 }}>Nacionalidad:</span> {author.nationality}</p>}
              {author.birthYear && <p style={{ margin: "0.5rem 0", color: "#555", fontSize: "0.9rem" }}><span style={{ color: "#903238", fontWeight: 600 }}>Nacimiento:</span> {author.birthYear}</p>}
              {author.bio && <p style={{ margin: "0.5rem 0", color: "#555", fontSize: "0.9rem", lineHeight: 1.6 }}>{author.bio}</p>}
            </div>

            {/* Estadísticas */}
            {stats && (
              <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", border: "1px solid #f0d0c0" }}>
                <h3 style={{ color: "#6b2232", marginTop: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <BarChart2 size={18} color="#c64d40" /> Estadísticas
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1rem" }}>
                  {[
                    { label: "Total libros", value: stats.totalBooks },
                    { label: "Prom. páginas", value: stats.averagePages },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: "#6b2232", borderRadius: "8px", padding: "0.8rem", textAlign: "center" }}>
                      <p style={{ margin: 0, color: "#ff8456", fontSize: "0.75rem" }}>{label}</p>
                      <p style={{ margin: 0, color: "#ffc865", fontSize: "1.5rem", fontWeight: 700 }}>{value}</p>
                    </div>
                  ))}
                </div>
                {stats.firstBook && <p style={{ margin: "0.4rem 0", color: "#555", fontSize: "0.82rem" }}><span style={{ color: "#903238", fontWeight: 600 }}>Primer libro:</span> {stats.firstBook.title} ({stats.firstBook.year})</p>}
                {stats.latestBook && <p style={{ margin: "0.4rem 0", color: "#555", fontSize: "0.82rem" }}><span style={{ color: "#903238", fontWeight: 600 }}>Último libro:</span> {stats.latestBook.title} ({stats.latestBook.year})</p>}
                {stats.longestBook && <p style={{ margin: "0.4rem 0", color: "#555", fontSize: "0.82rem" }}><span style={{ color: "#903238", fontWeight: 600 }}>Más largo:</span> {stats.longestBook.title} ({stats.longestBook.pages} págs.)</p>}
                {stats.shortestBook && <p style={{ margin: "0.4rem 0", color: "#555", fontSize: "0.82rem" }}><span style={{ color: "#903238", fontWeight: 600 }}>Más corto:</span> {stats.shortestBook.title} ({stats.shortestBook.pages} págs.)</p>}
                {stats.genres.length > 0 && (
                  <div style={{ marginTop: "0.8rem" }}>
                    <p style={{ margin: "0 0 0.4rem", color: "#903238", fontWeight: 600, fontSize: "0.82rem" }}>Géneros:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {stats.genres.map(g => (
                        <span key={g} style={{ background: "#fdf0e8", color: "#c64d40", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 600 }}>{g}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Libros del autor */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, color: "#6b2232", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <BookOpen size={18} color="#c64d40" /> Libros ({author.books.length})
              </h3>
              <button onClick={() => setShowBookForm(!showBookForm)}
                style={{ background: "#c64d40", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600, fontSize: "0.85rem" }}>
                <Plus size={14} /> Agregar libro
              </button>
            </div>

            {/* Formulario nuevo libro */}
            {showBookForm && (
              <div style={{ background: "white", borderRadius: "12px", padding: "1.2rem", marginBottom: "1rem", border: "2px solid #ff8456" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                  {[
                    { label: "Título *", key: "title", placeholder: "Título del libro" },
                    { label: "ISBN", key: "isbn", placeholder: "978-..." },
                    { label: "Año publicación", key: "publishedYear", placeholder: "2024" },
                    { label: "Páginas", key: "pages", placeholder: "300" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label style={{ display: "block", color: "#6b2232", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.8rem" }}>{label}</label>
                      <input value={bookForm[key as keyof typeof bookForm]} onChange={e => setBookForm({ ...bookForm, [key]: e.target.value })}
                        placeholder={placeholder}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box", fontSize: "0.85rem" }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: "block", color: "#6b2232", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.8rem" }}>Género</label>
                    <select value={bookForm.genre} onChange={e => setBookForm({ ...bookForm, genre: e.target.value })}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box", fontSize: "0.85rem" }}>
                      <option value="">Seleccionar</option>
                      {genres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#6b2232", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.8rem" }}>Descripción</label>
                    <input value={bookForm.description} onChange={e => setBookForm({ ...bookForm, description: e.target.value })}
                      placeholder="Breve descripción"
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box", fontSize: "0.85rem" }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.8rem", marginTop: "1rem" }}>
                  <button onClick={handleAddBook}
                    style={{ background: "#6b2232", color: "#ffc865", border: "none", padding: "0.5rem 1.2rem", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
                    Agregar libro
                  </button>
                  <button onClick={() => setShowBookForm(false)}
                    style={{ background: "#eee", color: "#333", border: "none", padding: "0.5rem 1.2rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Lista libros */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              {author.books.map(book => (
                <div key={book.id} style={{ background: "white", borderRadius: "10px", padding: "1rem", border: "1px solid #f0d0c0" }}>
                  <h4 style={{ margin: "0 0 0.4rem", color: "#6b2232" }}>{book.title}</h4>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {book.genre && <span style={{ background: "#6b2232", color: "#ffc865", padding: "0.15rem 0.5rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 600 }}>{book.genre}</span>}
                    {book.publishedYear && <span style={{ background: "#fff5e0", color: "#903238", padding: "0.15rem 0.5rem", borderRadius: "20px", fontSize: "0.7rem" }}>{book.publishedYear}</span>}
                    {book.pages && <span style={{ background: "#fdf0e8", color: "#c64d40", padding: "0.15rem 0.5rem", borderRadius: "20px", fontSize: "0.7rem" }}>{book.pages} págs.</span>}
                  </div>
                </div>
              ))}
              {author.books.length === 0 && (
                <div style={{ textAlign: "center", padding: "2rem", color: "#903238", background: "white", borderRadius: "12px" }}>
                  Este autor no tiene libros aún.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}