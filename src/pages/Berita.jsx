import BeritaList from "../components/Berita/BeritaList";

const Berita = () => {
    return (
        <div className="flex flex-col items-center gap-17 px-3 py-13">
            <div className="font-poppins font-bold flex flex-col gap-7">
                <h1 className="text-center text-4xl">
                    Berita <span className="text-smporange">SMP Negeri 20 Semarang</span>
                </h1>
            </div>
            <div>
                <BeritaList />
            </div>
        </div>
    );
};
export default Berita;
