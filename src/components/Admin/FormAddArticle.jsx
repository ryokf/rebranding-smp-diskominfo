import { useState, useEffect } from "react";
import { supabase } from "../../config/db";
import { ImagePlus, UploadCloud } from "lucide-react";
import { getLatestArticleId } from "../../services/articles";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const FormAddArticle = () => {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [latestId, setLatestId] = useState();

    const handleUpload = async (e) => {
        e.preventDefault();

        try {
            setUploading(true);
            if (!image) throw new Error("Pilih gambar terlebih dahulu!");

            const fileExt = image.name.split(".").pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            let { error: uploadError } = await supabase.storage
                .from("thumbnail-article")
                .upload(filePath, image);

            if (uploadError) throw uploadError;

            const {
                data: { publicUrl },
            } = supabase.storage.from("thumbnail-article").getPublicUrl(filePath);

            const { error } = await supabase.from("articles").insert([
                {
                    id: latestId + 1,
                    title,
                    content,
                    thumbnail: publicUrl,
                },
            ]);
            console.log(publicUrl);

            if (error) throw error;

            await Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Artikel berhasil diunggah.",
                confirmButtonColor: "#f97316",
            });

            setTitle("");
            setContent("");
            setImage(null);
            setImageUrl("");

            navigate("/admin/berita");
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: error.message,
                confirmButtonColor: "#ef4444",
            });
        } finally {
            setUploading(false);
            console.log(title, content, imageUrl);
        }
    };

    useEffect(() => {
        const fetchLastArticleId = async () => {
            const id = await getLatestArticleId();
            setLatestId(id);
            console.log(id);
        };

        fetchLastArticleId();
    }, []);

    return (
        <div className="px-4 py-10 font-inter bg-gray-50 min-h-screen">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold text-smporange flex items-center gap-2">
                    <UploadCloud className="w-6 h-6" />
                    Tambah Berita Baru
                </h2>

                <form onSubmit={handleUpload} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Judul Artikel
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Masukkan judul artikel"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-smporange"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Konten Artikel
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Tulis isi artikel di sini..."
                            rows={6}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-smporange"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Thumbnail Artikel
                        </label>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer flex items-center gap-2 bg-smporange text-white px-4 py-2 rounded-md hover:bg-orange-600 transition">
                                <ImagePlus size={18} />
                                <span>{image ? image.name : "Pilih Gambar"}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setImage(file);
                                            setImageUrl(URL.createObjectURL(file));
                                        }
                                    }}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                            {image && (
                                <span className="text-sm text-gray-600 italic">{image.name}</span>
                            )}
                        </div>
                    </div>

                    {imageUrl && (
                        <div className="mt-6 border-t pt-4">
                            <h3 className="font-semibold text-gray-700 mb-2">
                                Pratinjau Thumbnail:
                            </h3>
                            <img
                                src={imageUrl}
                                alt="Thumbnail Preview"
                                className="w-60 h-auto object-cover rounded-lg shadow"
                            />
                            <p className="mt-2 text-sm text-gray-500 break-all">
                                URL:{" "}
                                <a
                                    href={imageUrl}
                                    className="text-blue-600 underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {imageUrl}
                                </a>
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={uploading}
                        className="flex items-center gap-2 bg-smporange hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <UploadCloud size={18} />
                        {uploading ? "Mengupload..." : "Upload Artikel"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FormAddArticle;
