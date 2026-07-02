"use client";

import { useState, useEffect } from "react";
import { PencilLine, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "../ui/dialog";

function generateCaption(input: { title: string; category: string; description: string; tone: string; }) {
  const toneMap: Record<string, string> = {
    elegan: "mengalir elegan dan terasa premium",
    hangat: "hangat, dekat, dan natural",
    editorial: "lebih bold, rapi, dan terasa editorial",
  };
  const toneText = toneMap[input.tone] ?? toneMap.hangat;
  return `${input.title || "Sesi terbaru"} dari kategori ${input.category || "portfolio"} hadir dengan visual yang ${toneText}. ${input.description || "Momen utamanya terasa intim dan penuh detail kecil."} Jika kamu ingin konsep serupa, tim kami bisa bantu siapkan moodboard dan paket yang paling pas.`;
}

export function PortfolioManagerSection() {
  const { showToast } = useToast();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<any | null>(null);
  const [formData, setFormData] = useState({ judul: "", kategori: "Wedding", deskripsi: "", thumbnail_url: "", is_active: true});
  const [captionTone, setCaptionTone] = useState("hangat");
  const [generatedCaption, setGeneratedCaption] = useState("");
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string; url: string; storagePath: string }>>([]);
  const [loadingUploadedFiles, setLoadingUploadedFiles] = useState(false);
  const [stagedUploads, setStagedUploads] = useState<Array<{ name: string; url?: string; path: string; uploading: boolean; saved?: boolean }>>([]);
  const bucketName = "portfolios";

  async function fetchUploadedFiles() {
    try {
      setLoadingUploadedFiles(true);
      if (!selectedPortfolio) {
        setUploadedFiles([]);
        return;
      }

      const { data, error } = await supabase
        .from("portfolio_images")
        .select("id, image_url, created_at")
        .eq("portfolio_id", selectedPortfolio.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("DEBUG ERROR SUPABASE (list images):", error);
        showToast("Gagal memuat file", error.message, "error");
        return;
      }

      if (!data) return;

      const files = data.map((f: any) => {
        const prefix = `/storage/v1/object/public/${bucketName}/`;
        const storagePath = f.image_url.includes(prefix)
          ? f.image_url.split(prefix)[1]
          : f.image_url;
        return {
          id: f.id,
          name: f.image_url.split("/").pop() || f.id,
          url: f.image_url,
          storagePath,
        };
      });
      setUploadedFiles(files);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUploadedFiles(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxBytes = 4 * 1024 * 1024;

    if (!acceptedTypes.includes(file.type)) {
      showToast('Format tidak didukung', 'Hanya jpg, jpeg, dan png yang diperbolehkan.', 'error');
      e.target.value = '';
      return;
    }

    if (file.size > maxBytes) {
      showToast('Ukuran file terlalu besar', 'Maksimal 4MB per file.', 'error');
      e.target.value = '';
      return;
    }

    if (!selectedPortfolio) {
      showToast('Pilih portfolio terlebih dahulu untuk mengupload foto', '', 'error');
      e.target.value = '';
      return;
    }

    const folder = `${selectedPortfolio.id}/`;
    const filePath = `${folder}${Date.now()}-${file.name}`;

    // add staged entry before upload
    setStagedUploads((s) => [{ name: file.name, path: filePath, uploading: true }, ...s]);

    try {
      const { error: uploadErr } = await supabase.storage.from(bucketName).upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadErr) {
        console.error('DEBUG ERROR SUPABASE (upload):', uploadErr);
        const raw = uploadErr.message || JSON.stringify(uploadErr);
        const friendly = /exceed|maximum|too large/i.test(raw) ? 'Ukuran file terlalu besar.' : raw;
        showToast('Gagal upload file', friendly, 'error');
        setStagedUploads((s) => s.map((it) => (it.path === filePath ? { ...it, uploading: false } : it)));
        return;
      }
    } catch (err: any) {
      console.error('DEBUG ERROR SUPABASE (upload exception):', err);
      const raw = err?.message || String(err);
      const friendly = /exceed|maximum|too large/i.test(raw) ? 'Ukuran file terlalu besar.' : raw;
      showToast('Gagal upload file', friendly, 'error');
      setStagedUploads((s) => s.map((it) => (it.path === filePath ? { ...it, uploading: false } : it)));
      return;
    }

    const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    const publicUrl = publicData.publicUrl;

    // update staged entry with public url and mark uploaded (not yet saved to DB)
    setStagedUploads((s) => s.map((it) => (it.path === filePath ? { ...it, url: publicUrl, uploading: false, saved: false } : it)));
    showToast('Upload berhasil', 'Foto sudah ter-upload dan siap disimpan.');
  }

  async function saveStagedUploads() {
    if (!selectedPortfolio) return showToast('Pilih portfolio terlebih dahulu', '', 'error');
    const toSave = stagedUploads.filter((s) => !s.uploading && !s.saved && s.url).map((s) => ({ portfolio_id: selectedPortfolio.id, image_url: s.url }));
    if (toSave.length === 0) return showToast('Tidak ada file baru untuk disimpan', '', 'error');

    const { error } = await supabase.from('portfolio_images').insert(toSave);
    if (error) {
      console.error('DEBUG ERROR SUPABASE (save staged):', error);
      return showToast('Gagal menyimpan gambar', error.message, 'error');
    }

    // refresh DB-sourced list, clear staged uploads
    await fetchUploadedFiles();
    setStagedUploads([]);
    showToast('Simpan berhasil', 'Semua foto baru telah disimpan.');
  }

  async function handleDeleteStagedUpload(stagedItem: { path: string }) {
    const { error } = await supabase.storage.from(bucketName).remove([stagedItem.path]);
    if (error) {
      console.error('DEBUG ERROR SUPABASE (delete staged):', error);
      return showToast('Gagal menghapus upload sementara', error.message, 'error');
    }
    setStagedUploads((current) => current.filter((item) => item.path !== stagedItem.path));
    showToast('Upload dibatalkan', 'File staged telah dihapus dari storage.');
  }

  async function handleDeleteUploadedFile(file: { id: string; storagePath: string }) {
    const { error: storageError } = await supabase.storage.from(bucketName).remove([file.storagePath]);
    if (storageError) {
      console.error('DEBUG ERROR SUPABASE (delete storage):', storageError);
      return showToast('Gagal menghapus file di storage', storageError.message, 'error');
    }

    const { error: dbError } = await supabase.from('portfolio_images').delete().eq('id', file.id);
    if (dbError) {
      console.error('DEBUG ERROR SUPABASE (delete DB):', dbError);
      return showToast('Gagal menghapus record file', dbError.message, 'error');
    }

    setUploadedFiles((current) => current.filter((item) => item.id !== file.id));
    showToast('File dihapus', 'Foto berhasil dihapus dari storage dan database.');
  }

  async function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxBytes = 4 * 1024 * 1024;

    if (!acceptedTypes.includes(file.type)) {
      showToast('Format tidak didukung', 'Hanya jpg, jpeg, dan png yang diperbolehkan.', 'error');
      e.target.value = '';
      return;
    }

    if (file.size > maxBytes) {
      showToast('Ukuran file terlalu besar', 'Maksimal 4MB per file.', 'error');
      e.target.value = '';
      return;
    }

    const folder = `portfolio-thumbnails/${selectedPortfolio?.id ?? 'draft'}/`;
    const filePath = `${folder}${Date.now()}-${file.name}`;

    setThumbnailUploading(true);
    try {
      const { error: uploadErr } = await supabase.storage.from(bucketName).upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadErr) {
        console.error('DEBUG ERROR SUPABASE (thumbnail upload):', uploadErr);
        const raw = uploadErr.message || JSON.stringify(uploadErr);
        const friendly = /exceed|maximum|too large/i.test(raw) ? 'Ukuran file terlalu besar.' : raw;
        showToast('Gagal upload thumbnail', friendly, 'error');
        return;
      }

      const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      const publicUrl = publicData.publicUrl;
      setFormData({ ...formData, thumbnail_url: publicUrl });
      showToast('Thumbnail berhasil diupload', 'Thumbnail siap disimpan bersama portfolio.');
    } catch (err: any) {
      console.error('DEBUG ERROR SUPABASE (thumbnail upload exception):', err);
      const raw = err?.message || String(err);
      const friendly = /exceed|maximum|too large/i.test(raw) ? 'Ukuran file terlalu besar.' : raw;
      showToast('Gagal upload thumbnail', friendly, 'error');
    } finally {
      setThumbnailUploading(false);
    }
  }

  useEffect(() => { fetchPortfolios(); }, []);

  async function fetchPortfolios() {
    setLoadingData(true);
    try {
      const { data } = await supabase.from("portfolios").select("*").order("created_at", { ascending: false });
      if (data) setPortfolios(data);
    } finally {
      setLoadingData(false);
    }
  }

  const handleSelectPortfolio = (item: any) => {
    setSelectedPortfolio(item);
    setFormData({ 
      judul: item.judul, 
      kategori: item.kategori, 
      deskripsi: item.deskripsi, 
      thumbnail_url: item.thumbnail_url || "",
      is_active: item.is_active ?? true 
    });
  };

  const handleSave = async () => {
    const payload = { judul: formData.judul, kategori: formData.kategori, deskripsi: formData.deskripsi, thumbnail_url: formData.thumbnail_url, is_active: formData.is_active };
    const { error } = selectedPortfolio 
      ? await supabase.from("portfolios").update(payload).eq("id", selectedPortfolio.id)
      : await supabase.from("portfolios").insert([payload]);
    
    if (error) showToast("Gagal menyimpan portfolio", error.message, "error");
    else { showToast("Portfolio tersimpan", "Portfolio berhasil disimpan dan diperbarui."); fetchPortfolios(); handleAddNew(); }
  };

  const handleAddNew = () => {
    setSelectedPortfolio(null);
    setFormData({ judul: "", kategori: "Wedding", deskripsi: "", thumbnail_url: "", is_active: true });
    setGeneratedCaption("");
  };

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_100px_-52px_rgba(217,119,6,0.32)] backdrop-blur-xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-amber-700">Portfolio manager</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Upload portfolio dan generate AI caption</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[1.9rem] border border-amber-100 bg-amber-50/55 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-slate-900">Portfolio aktif saat ini</p>
              <p className="text-sm text-slate-500">Pilih card untuk edit data portfolio.</p>
            </div>
            <Button variant="outline" className="rounded-full border-amber-100 bg-white" onClick={handleAddNew}>
              <Plus className="size-4" /> Tambah
            </Button>
          </div>

          <div className="space-y-4">
            {loadingData ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-28 w-full animate-pulse rounded-[1.6rem] bg-slate-200/70" />
              ))
            ) : (
              [...portfolios]
                .sort((a, b) => (a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1))
                .map((item) => {
                  const isActive = selectedPortfolio?.id === item.id;

                  const cardStyle = item.is_active
                    ? isActive
                      ? "border-amber-200 bg-white shadow-[0_20px_60px_-38px_rgba(217,119,6,0.35)]"
                      : "border-white bg-white/90 hover:border-amber-100"
                    : "border-transparent bg-slate-100/70 opacity-80 hover:bg-slate-100";

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectPortfolio(item)}
                      className={`block w-full rounded-[1.6rem] border p-5 text-left transition-all ${cardStyle}`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <span className={`font-semibold ${item.is_active ? "text-slate-900" : "text-slate-500"}`}>
                          {item.judul} {!item.is_active && "(nonaktif)"}
                        </span>
                        <span className={`text-sm ${item.is_active ? "text-amber-700" : "text-slate-400"}`}>
                          {item.kategori}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-slate-500">{item.deskripsi}</p>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-amber-100 bg-white p-6 shadow-[0_20px_80px_-48px_rgba(217,119,6,0.28)] h-full">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-slate-900">
                {selectedPortfolio ? "Edit data portfolio" : "Tambah portfolio baru"}
              </p>
              <p className="text-sm text-slate-500">
                {selectedPortfolio
                  ? "Update judul, kategori, deskripsi, lalu generate caption."
                  : "Isi data portfolio baru lalu buat caption AI untuk deskripsinya."}
              </p>
            </div>
            <div className="rounded-full bg-amber-50 p-2 text-amber-700">
              {selectedPortfolio ? <PencilLine className="size-5" /> : <Plus className="size-5" />}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Thumbnail portfolio">
                <div className="space-y-3">
                  {formData.thumbnail_url ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <img src={formData.thumbnail_url} alt="thumbnail portfolio" className="h-40 w-full rounded-3xl object-cover border border-slate-200" />
                        {thumbnailUploading && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-slate-900/40 text-sm font-semibold text-white">
                            Mengupload thumbnail...
                          </div>
                        )}
                      </div>
                      <label className="relative inline-flex w-full cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                        Ganti thumbnail
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleThumbnailChange}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <label className="relative inline-flex w-full cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                        {thumbnailUploading ? "Mengupload thumbnail..." : "Unggah thumbnail portfolio"}
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleThumbnailChange}
                          disabled={thumbnailUploading}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                      </label>
                      {thumbnailUploading && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/40 text-sm font-semibold text-white">
                          Mengupload thumbnail...
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-xs font-semibold text-red-600">*maks. 4 MB jpeg jpg png</p>
                </div>
              </Field>
            </div>

            <Field label="Judul portfolio">
              <input
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                placeholder="Contoh: Akad pagi di rumah keluarga"
                className="w-full rounded-2xl border border-slate-200 bg-amber-50/30 px-4 py-3 text-sm outline-none focus:border-amber-400"
              />
            </Field>

            <Field label="Kategori">
              <select
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-amber-50/30 px-4 py-3 text-sm outline-none focus:border-amber-400"
              >
                <option value="Wedding">Wedding</option>
                <option value="Wisuda">Wisuda</option>
                <option value="Custom">Custom</option>
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Deskripsi momen">
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  rows={4}
                  placeholder="Ceritakan mood, lokasi, dan detail utama sesi foto"
                  className="w-full rounded-2xl border border-slate-200 bg-amber-50/30 px-4 py-3 text-sm outline-none focus:border-amber-400"
                />
              </Field>
            </div>

            <Field label="Tone caption">
              <select
                value={captionTone}
                onChange={(e) => setCaptionTone(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-amber-50/30 px-4 py-3 text-sm outline-none focus:border-amber-400"
              >
                <option value="hangat">Hangat</option>
                <option value="elegan">Elegan</option>
                <option value="editorial">Editorial</option>
              </select>
            </Field>

            {/* Area Draft Caption */}
            <div className="rounded-[1.5rem] border border-amber-100 bg-amber-50/55 p-4 sm:col-span-2">
              <div className="mb-3 flex items-center gap-2 text-slate-900">
                <Sparkles className="size-4 text-amber-600" />
                <p className="text-sm font-semibold">Draft caption</p>
              </div>
              <div className="min-h-36 rounded-2xl border border-white/80 bg-white p-4 text-sm leading-6 text-slate-600">
                {generatedCaption || "Caption hasil AI akan muncul di sini setelah Anda klik generate."}
              </div>
            </div>

            {selectedPortfolio && (
              <div className="sm:col-span-2 flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50/50 px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">Status Portfolio</span>
                  <span className="text-xs text-slate-500">
                    {formData.is_active ? "Portfolio sedang aktif (terlihat di web)" : "Portfolio sedang diarsipkan"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                    formData.is_active ? "bg-amber-500" : "bg-slate-300"
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    formData.is_active ? "translate-x-8" : "translate-x-1"
                  }`} />
                </button>
              </div>
            )}

            <div className="sm:col-span-2 flex flex-wrap gap-3 mt-2">
              <Button
                type="button"
                className="h-11 rounded-2xl bg-amber-500 px-5 text-white hover:bg-amber-600"
                onClick={() =>
                  setGeneratedCaption(
                    generateCaption({
                      title: formData.judul,
                      category: formData.kategori,
                      description: formData.deskripsi,
                      tone: captionTone,
                    })
                  )
                }
              >
                Generate AI caption
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="h-11 rounded-2xl border-amber-100" onClick={() => { setShowUploadModal(true); fetchUploadedFiles(); }}>
                    Upload foto
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload foto portfolio</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <label className="relative inline-flex w-full cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                        Pilih file foto
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleFileChange}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                      </label>
                      <p className="mt-2 text-xs text-red-600">* Maks. 4MB • jpg, jpeg, png</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Staged uploads</p>
                      <div className="grid grid-cols-3 gap-3">
                        {stagedUploads.length === 0 ? (
                          <div className="text-sm text-slate-500">Belum ada upload baru.</div>
                        ) : (
                          stagedUploads.map((s) => (
                            <div key={s.path} className="rounded-md border p-2">
                              {s.url ? (
                                <img src={s.url} alt={s.name} className="w-full h-24 object-cover rounded" />
                              ) : (
                                <div className="w-full h-24 flex items-center justify-center bg-slate-100">Uploading...</div>
                              )}
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs truncate">{s.name}</span>
                                <div className="flex gap-2">
                                  <span className="text-xs text-slate-500">{s.uploading ? 'Uploading' : 'Ready'}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Uploaded files</p>
                      <div className="grid grid-cols-3 gap-3">
                        {loadingUploadedFiles ? (
                          Array.from({ length: 3 }).map((_, idx) => (
                            <div key={idx} className="animate-pulse rounded-md border border-slate-200 bg-slate-100 p-2">
                              <div className="h-24 w-full rounded-lg bg-slate-200" />
                              <div className="mt-2 h-3 w-3/4 rounded-full bg-slate-200" />
                            </div>
                          ))
                        ) : uploadedFiles.length === 0 ? (
                          <div className="text-sm text-slate-500">Belum ada file.</div>
                        ) : (
                          uploadedFiles.map((f) => (
                            <div key={f.id} className="relative rounded-md border p-2">
                              <img src={f.url} alt={f.name} className="w-full h-24 object-cover rounded" />
                              <button
                                type="button"
                                onClick={() => handleDeleteUploadedFile(f)}
                                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm transition hover:bg-rose-100 hover:text-rose-600"
                                aria-label="Hapus foto"
                              >
                                <Trash2 className="size-4" />
                              </button>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs truncate">{f.name}</span>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, thumbnail_url: f.url })}
                                    className="text-xs text-emerald-600"
                                  >
                                    Pilih
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={saveStagedUploads}
                      disabled={stagedUploads.some((s) => s.uploading) || stagedUploads.length === 0}
                      className="h-10 rounded-2xl bg-amber-500 px-4 text-white"
                    >
                      Simpan upload
                    </Button>
                    <DialogClose asChild>
                      <Button variant="outline" className="h-10 rounded-2xl">Tutup</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {selectedPortfolio && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-2xl border-slate-200"
                  onClick={handleAddNew}
                >
                  Buat portfolio baru
                </Button>
              )}

              <Button 
                onClick={handleSave} 
                className="h-11 flex-1 rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800"
              >
                {selectedPortfolio ? "Simpan Perubahan" : "Simpan Portfolio Baru"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">{label}</span>{children}</label>;
}
