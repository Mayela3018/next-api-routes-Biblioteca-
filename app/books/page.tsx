"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Plus, Trash2, Edit, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

interface Book {
  id: string;
  title: string;
  description?: string;
  isbn?: string;
  publishedYear?: number;
  genre?: string;
  pages?: number;
  author: { id: string; name: string };
}
interface Author {
  id: string;
  name: string;
}
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    title: "", description: "", isbn: "", publishedYear: "",
    genre: "", pages: "", authorId: "",
  });
  const [toast, setToast] = useState<{msg: string, type: "success"|"error"} | null>(null);

  const showToast = (msg: string, type: "success"|"error" = "success") => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 3000);
  };

  const genres = ["Novela", "Cuento", "Poesía", "Ensayo", "Periodismo", "Biografía", "Historia", "Ciencia ficción"];

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(), limit: "10", sortBy, order,
      ...(search && { search }),
      ...(genre && { genre }),
      ...(authorFilter && { authorName: authorFilter }),
    });
    const res = await fetch(`/api/books/search?${params}`);
    const data = await res.json();
    setBooks(data.data || []);
    setPagination(data.pagination || null);
    setLoading(false);
  }, [search, genre, authorFilter, sortBy, order, page]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);
  useEffect(() => { setPage(1); }, [search, genre, authorFilter, sortBy, order]);
  useEffect(() => {
    fetch("/api/authors").then(r => r.json()).then(setAuthors);
  }, []);

  const handleSubmit = async () => {
    const method = editingBook ? "PUT" : "POST";
    const url = editingBook ? `/api/books/${editingBook.id}` : "/api/books";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        publishedYear: form.publishedYear ? parseInt(form.publishedYear) : undefined,
        pages: form.pages ? parseInt(form.pages) : undefined,
      }),
    });
    const wasEditing = !!editingBook;
    setShowForm(false);
    setEditingBook(null);
    setForm({ title: "", description: "", isbn: "", publishedYear: "", genre: "", pages: "", authorId: "" });
    fetchBooks();
    showToast(wasEditing ? "✏️ Libro actualizado correctamente" : "🎉 Libro creado correctamente");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este libro?")) return;
    await fetch(`/api/books/${id}`, { method: "DELETE" });
    fetchBooks();
    showToast("🗑️ Libro eliminado correctamente");
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title, description: book.description || "",
      isbn: book.isbn || "", publishedYear: book.publishedYear?.toString() || "",
      genre: book.genre || "", pages: book.pages?.toString() || "",
      authorId: book.author.id,
    });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

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

      {/* Header */}
      <div style={{ background: "#6b2232", padding: "1.5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/" style={{ color: "#ffc865", display: "flex" }}><ArrowLeft size={20} /></Link>
          <div>
            <h1 style={{ color: "#ffc865", margin: 0, fontSize: "1.8rem", fontWeight: 700 }}>📖 Libros</h1>
            <p style={{ color: "#ff8456", margin: 0, fontSize: "0.9rem" }}>
              {pagination ? `${pagination.total} resultados encontrados` : "Cargando..."}
            </p>
          </div>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingBook(null); setForm({ title: "", description: "", isbn: "", publishedYear: "", genre: "", pages: "", authorId: "" }); }}
          style={{ background: "#ff8456", color: "white", border: "none", padding: "0.6rem 1.2rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
          <Plus size={16} /> Nuevo Libro
        </button>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
        {/* Formulario */}
        {showForm && (
          <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem", border: "2px solid #c64d40" }}>
            <h3 style={{ color: "#6b2232", marginTop: 0 }}>{editingBook ? "✏️ Editar Libro" : "➕ Nuevo Libro"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[
                { label: "Título *", key: "title", placeholder: "Cien años de soledad" },
                { label: "ISBN", key: "isbn", placeholder: "978-0307474728" },
                { label: "Año de publicación", key: "publishedYear", placeholder: "1967" },
                { label: "Páginas", key: "pages", placeholder: "417" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ display: "block", color: "#6b2232", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.85rem" }}>{label}</label>
                  <input value={form[key as keyof typeof form]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", color: "#6b2232", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.85rem" }}>Género</label>
                <select value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" }}>
                  <option value="">Seleccionar género</option>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: "#6b2232", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.85rem" }}>Autor *</label>
                <select value={form.authorId} onChange={e => setForm({ ...form, authorId: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" }}>
                  <option value="">Seleccionar autor</option>
                  {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", color: "#6b2232", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.85rem" }}>Descripción</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Descripción del libro..."
                style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box", minHeight: "80px" }} />
            </div>
            <div style={{ display: "flex", gap: "0.8rem", marginTop: "1rem" }}>
              <button onClick={handleSubmit}
                style={{ background: "#6b2232", color: "#ffc865", border: "none", padding: "0.6rem 1.5rem", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
                {editingBook ? "💾 Guardar cambios" : "✅ Crear libro"}
              </button>
              <button onClick={() => setShowForm(false)}
                style={{ background: "#eee", color: "#333", border: "none", padding: "0.6rem 1.5rem", borderRadius: "8px", cursor: "pointer" }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div style={{ background: "white", borderRadius: "12px", padding: "1.2rem", marginBottom: "1.5rem", border: "1px solid #f0d0c0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "0.8rem", alignItems: "end" }}>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#903238" }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por título..."
                style={{ width: "100%", padding: "0.6rem 0.6rem 0.6rem 2rem", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" }} />
            </div>
            <select value={genre} onChange={e => setGenre(e.target.value)}
              style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid #ddd" }}>
              <option value="">Todos los géneros</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid #ddd" }}>
              <option value="createdAt">Fecha creación</option>
              <option value="title">Título</option>
              <option value="publishedYear">Año</option>
            </select>
            <select value={order} onChange={e => setOrder(e.target.value)}
              style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid #ddd" }}>
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </div>
        </div>

        {/* Lista libros */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#903238" }}>🔍 Buscando libros...</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
              {books.map(book => (
                <div key={book.id} style={{ background: "white", borderRadius: "12px", padding: "1.2rem", border: "1px solid #f0d0c0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.8rem" }}>
                    <h3 style={{ margin: 0, color: "#6b2232", fontSize: "1rem", flex: 1 }}>{book.title}</h3>
                    <div style={{ display: "flex", gap: "0.4rem", marginLeft: "0.5rem" }}>
                      <button onClick={() => handleEdit(book)}
                        style={{ background: "#ffc865", color: "#6b2232", border: "none", padding: "0.4rem", borderRadius: "6px", cursor: "pointer", display: "flex" }}>
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(book.id)}
                        style={{ background: "#c64d40", color: "white", border: "none", padding: "0.4rem", borderRadius: "6px", cursor: "pointer", display: "flex" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: "0 0 0.8rem", color: "#903238", fontSize: "0.85rem" }}>
                    por <Link href={`/authors/${book.author.id}`} style={{ color: "#c64d40", textDecoration: "none", fontWeight: 600 }}>{book.author.name}</Link>
                  </p>
                  {book.description && <p style={{ margin: "0 0 0.8rem", color: "#555", fontSize: "0.8rem", lineHeight: 1.5 }}>{book.description.slice(0, 100)}...</p>}
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {book.genre && <span style={{ background: "#6b2232", color: "#ffc865", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 600 }}>{book.genre}</span>}
                    {book.publishedYear && <span style={{ background: "#fff5e0", color: "#903238", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.72rem" }}>{book.publishedYear}</span>}
                    {book.pages && <span style={{ background: "#fdf0e8", color: "#c64d40", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.72rem" }}>{book.pages} págs.</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {pagination && pagination.totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "2rem" }}>
                <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev}
                  style={{ background: pagination.hasPrev ? "#6b2232" : "#ddd", color: pagination.hasPrev ? "#ffc865" : "#999", border: "none", padding: "0.6rem 1rem", borderRadius: "8px", cursor: pagination.hasPrev ? "pointer" : "default", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span style={{ color: "#6b2232", fontWeight: 600 }}>Página {pagination.page} de {pagination.totalPages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}
                  style={{ background: pagination.hasNext ? "#6b2232" : "#ddd", color: pagination.hasNext ? "#ffc865" : "#999", border: "none", padding: "0.6rem 1rem", borderRadius: "8px", cursor: pagination.hasNext ? "pointer" : "default", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            )}

            {books.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", color: "#903238", background: "white", borderRadius: "12px" }}>
                📭 No se encontraron libros con esos filtros.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}