import Link from "next/link";
import type { Metadata } from "next";
import db from "@/lib/db";
import { Search } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tiketsepur.com'

export const metadata: Metadata = {
  title: "Marketplace Tiket Kereta Preloved - TiketSepur",
  description: "Cari dan beli tiket kereta preloved dengan harga terjangkau. Ribuan tiket tersedia dari berbagai kelas. Transaksi aman dan proses cepat.",
  keywords: ["tiket kereta", "beli tiket", "jual tiket kereta", "tiket murah", "tiket preloved"],
  openGraph: {
    title: "TiketSepur - Marketplace Tiket Kereta Terlengkap",
    description: "Cari, beli, dan jual tiket kereta preloved dengan harga terjangkau.",
    url: baseUrl,
    type: "website",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "TiketSepur Marketplace",
      },
    ],
  },
}

export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; kelas?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const kelas = params.kelas?.trim() || "";
  const pageSize = 9;
  const skip = (currentPage - 1) * pageSize;

  const today = new Date().toISOString().split('T')[0];
  let tickets: Awaited<ReturnType<typeof db.ticket.findMany>> = [];
  let totalTickets = 0;

  try {
    // Keep homepage accessible in development even if DB isn't available yet.
    await db.ticket.deleteMany({
      where: { tanggal: { lt: today }, status: 'available' }
    });

    const where = {
      status: "available",
      ...(kelas ? { kelas } : {}),
    };

    totalTickets = await db.ticket.count({ where });

    tickets = await db.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        user: { select: { name: true, image: true } }
      }
    });
  } catch {
    tickets = [];
    totalTickets = 0;
  }

  const totalPages = Math.max(1, Math.ceil(totalTickets / pageSize));

  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  return (
    <div className="space-y-16 mt-8 p-4 md:p-8">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row border-kinetic shadow-kinetic-lg bg-white overflow-hidden">
        <div className="md:w-[55%] p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.95] mb-8 mt-4">
            Cari, Dapat, Berangkat!
          </h1>
          <p className="text-sm md:text-base font-medium mb-12 max-w-md opacity-80">
            Temukan tiket kereta preloved dengan harga masuk akal, proses cepat, dan transaksi yang lebih aman di TiketSepur.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <form method="GET" action="/search" className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1 border-[2px] border-black flex items-center px-4 py-3 bg-[#f4f4f4]">
                <span className="w-3 h-3 border-2 border-black mr-3 inline-block"></span>
                <input type="text" name="asal" placeholder="STASIUN ASAL" className="bg-transparent text-xs font-black tracking-widest outline-none w-full uppercase" />
              </div>
              <div className="flex-1 border-[2px] border-black flex items-center px-4 py-3 bg-[#f4f4f4]">
                <span className="w-3 h-3 rounded-full border-2 border-black mr-3 inline-block"></span>
                <input type="text" name="tujuan" placeholder="STASIUN TUJUAN" className="bg-transparent text-xs font-black tracking-widest outline-none w-full uppercase" />
              </div>
              <button type="submit" className="bg-black text-white px-6 w-full sm:w-auto flex items-center justify-center border-2 border-black hover:bg-gray-800 transition py-4 sm:py-0">
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
        <div className="md:w-[45%] bg-gray-200 border-t-4 md:border-t-0 md:border-l-4 border-black relative min-h-[300px] md:min-h-full overflow-hidden">
           {/* Unsplash train station image */}
           <img src="https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?q=80&w=2000&auto=format&fit=crop" alt="Train Station" className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 hover:scale-105 transition duration-1000" />
        </div>
      </div>

      {/* Departures Grid */}
      <div className="pt-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b-2 border-black pb-4 gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Lalu Lintas Real-time</p>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Tiket Tersedia Hari Ini</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <form method="GET" className="flex gap-2 items-center">
              <select
                name="kelas"
                defaultValue={kelas}
                className="border-[2px] border-black px-3 py-2 text-[10px] font-black uppercase tracking-widest bg-white"
              >
                <option value="">Semua Kategori</option>
                <option value="Ekonomi">Ekonomi</option>
                <option value="Bisnis">Bisnis</option>
                <option value="Eksekutif">Eksekutif</option>
                <option value="Business Premier">Business Premier</option>
                <option value="Luxury">Luxury</option>
              </select>
              <button
                type="submit"
                className="border-[2px] border-black px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition"
              >
                Filter
              </button>
              {kelas && (
                <Link
                  href="/"
                  className="border-[2px] border-black px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition"
                >
                  Reset
                </Link>
              )}
            </form>
            <Link href="/upload" className="text-[10px] font-black uppercase tracking-widest border-b-2 border-transparent hover:border-black transition py-1 self-start sm:self-auto">Jual Tiketmu</Link>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="border-kinetic p-16 text-center bg-white shadow-kinetic-lg max-w-2xl mx-auto my-16">
             <div className="text-4xl font-black uppercase tracking-tighter mb-4">Belum Ada Tiket Tersedia.</div>
             <p className="text-sm font-medium opacity-70">Jadilah yang pertama upload tiket dan bantu pengguna lain berangkat tepat waktu.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {tickets.map((t) => (
                <div key={t.id} className="border-[3px] border-black bg-white shadow-kinetic p-6 lg:p-8 flex flex-col group hover:-translate-y-1 hover:shadow-kinetic-lg transition-all duration-200">
                  <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-black">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Express-{t.id.substring(t.id.length - 3)}</span>
                    <span className="bg-black text-white text-[9px] font-black uppercase tracking-widest px-2 py-1">Siap Dipesan</span>
                  </div>
                  
                  <h3 className="text-[1.75rem] font-black uppercase tracking-tighter leading-[1.1] mb-8">
                    {t.asal} <br/><span className="opacity-30">→</span><br/> {t.tujuan}
                  </h3>
                  
                  <div className="space-y-4 mb-10 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-3">
                       <div className="w-3.5 h-3.5 border-[2px] border-black"></div>
                       {months[parseInt(t.tanggal.split('-')[1]) - 1] || 'N/A'} {t.tanggal.split('-')[2] || "01"}, {t.tanggal.split('-')[0] || "2024"}
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-3.5 h-3.5 rounded-full border-[2px] border-black"></div>
                       {t.jam} <span className="opacity-40 ml-1">→ Perkiraan</span>
                    </div>
                  </div>

                  <div className="mt-auto border-t-2 border-black pt-5 flex items-end justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1">Harga Standar</span>
                      <span className="text-2xl font-black tracking-tighter">Rp {t.harga.toLocaleString('id-ID')}</span>
                    </div>
                    <Link href={`/ticket/${t.id}`} className="bg-black text-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition shadow-sm">
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-black pt-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Halaman {currentPage} dari {totalPages}
                </p>
                <div className="flex gap-3">
                  <Link
                    href={currentPage > 1 ? `/?page=${currentPage - 1}${kelas ? `&kelas=${encodeURIComponent(kelas)}` : ""}` : `/?page=1${kelas ? `&kelas=${encodeURIComponent(kelas)}` : ""}`}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-[2px] border-black ${
                      currentPage <= 1 ? "pointer-events-none opacity-40" : "hover:bg-gray-100"
                    }`}
                  >
                    Sebelumnya
                  </Link>
                  <Link
                    href={currentPage < totalPages ? `/?page=${currentPage + 1}${kelas ? `&kelas=${encodeURIComponent(kelas)}` : ""}` : `/?page=${totalPages}${kelas ? `&kelas=${encodeURIComponent(kelas)}` : ""}`}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-[2px] border-black ${
                      currentPage >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-gray-100"
                    }`}
                  >
                    Selanjutnya
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subscribe Banner */}
      <div className="flex flex-col md:flex-row border-[3px] border-black shadow-kinetic bg-black text-white overflow-hidden my-24">
        <div className="md:w-[65%] p-8 lg:p-16 flex flex-col justify-center">
          <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-4 leading-none">Masuk Ke Update TiketSepur.</h2>
          <p className="text-sm font-medium opacity-80 mb-10 max-w-md leading-relaxed">Dapatkan info tiket baru, rute favorit, dan tips beli tiket aman langsung ke email Anda tiap minggu.</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
              <input type="email" placeholder="EMAIL@CONTOH.COM" className="flex-1 p-4 text-xs font-black uppercase tracking-widest text-black outline-none border-[3px] border-transparent focus:border-gray-500 bg-white" />
            <button className="bg-[#e4e4e4] text-black px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white transition border-[3px] border-[#e4e4e4]">
              Berlangganan
            </button>
          </div>
        </div>
        <div className="md:w-[35%] bg-[#eee] text-black border-t-4 md:border-t-0 md:border-l-4 border-black p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 border-[3px] border-black mb-8 grid grid-cols-2 grid-rows-2 p-1.5 gap-1.5">
              <div className="bg-black"></div><div className="border-2 border-black"></div>
              <div className="border-2 border-black"></div><div className="bg-black"></div>
            </div>
            <h3 className="text-[15px] font-black uppercase tracking-widest mb-3">Fokus Mobile</h3>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-relaxed px-4">Pantau tiket kapan saja langsung dari genggaman</p>
        </div>
      </div>
    </div>
  );
}
