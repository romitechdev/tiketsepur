import type { Metadata } from "next";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import { Train, MessageSquare, MapPin, Clock } from "lucide-react";
import SellerAvatar from "@/components/SellerAvatar";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tiketsepur.vercel.app'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const ticket = await db.ticket.findUnique({
    where: { id },
    select: {
      id: true,
      asal: true,
      tujuan: true,
      harga: true,
      tanggal: true,
      jam: true,
      image: true,
      kelas: true,
      coach: true,
      seat: true,
    },
  })

  if (!ticket) {
    return {
      title: 'Tiket Tidak Ditemukan | TiketSepur',
    }
  }

  const title = `${ticket.asal} → ${ticket.tujuan} (${ticket.tanggal}) | TiketSepur`
  const description = `Beli tiket kereta dari ${ticket.asal} ke ${ticket.tujuan} tanggal ${ticket.tanggal} jam ${ticket.jam}. Kelas ${ticket.kelas || 'Standar'}. Harga Rp${ticket.harga.toLocaleString('id-ID')}. Transaksi aman di marketplace TiketSepur.`
  const url = `${baseUrl}/ticket/${id}`

  return {
    title,
    description,
    keywords: [`${ticket.asal}`, `${ticket.tujuan}`, 'tiket kereta', ticket.kelas || 'standar'],
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [
        {
          url: ticket.image || `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${ticket.asal} → ${ticket.tujuan}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ticket.image || `${baseUrl}/og-image.jpg`],
    },
  }
}

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = await params;
  const ticket = await db.ticket.findUnique({
    where: { id: unwrappedParams.id },
    include: {
      user: true
    }
  });

  if (!ticket) {
    return notFound();
  }

  const sellerName = ticket.user.name?.trim() || 'Penjual';

  const waNumber = ticket.user.phone ? ticket.user.phone.replace(/^0/, '62') : "";
  const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo, saya tertarik dengan tiket kereta dari ${ticket.asal} ke ${ticket.tujuan} tanggal ${ticket.tanggal} yang Anda posting di TiketSepur.`)}` : '';

  // Parse date (YYYY-MM-DD format)
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const parts = ticket.tanggal.split('-');
  const monthName = parts.length === 3 ? months[parseInt(parts[1]) - 1] || 'N/A' : 'N/A';
  const displayDate = parts.length === 3 ? `${monthName} ${parts[2]}` : ticket.tanggal;

  return (
    <div className="max-w-[1200px] mx-auto pt-8 px-4 md:px-8 pb-32">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Left Ticket Area */}
        <div className="lg:w-2/3">
          <div className="flex items-center gap-4 mb-2">
            <span className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              Rute Dikonfirmasi
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              ID: TK-{ticket.id.substring(ticket.id.length - 6, ticket.id.length).toUpperCase()}
            </span>
          </div>

          <h1 className="text-6xl md:text-[5.5rem] font-black uppercase tracking-tighter leading-[0.9] mb-8 mt-6">
            {ticket.asal}<br />
            <span className="flex items-center gap-4">
              <span className="text-4xl md:text-6xl">→</span> {ticket.tujuan}
            </span>
          </h1>

          <div className="border-[3px] border-black shadow-brand-lg bg-white p-8 md:p-12 mb-8 relative">
            <Train className="absolute top-8 right-8 h-24 w-24 text-gray-100 hidden md:block" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Keberangkatan</p>
                <p className="text-3xl font-black uppercase tracking-tighter">{ticket.jam} — {displayDate}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-2">{ticket.asal} TERMINAL</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Gerbong</p>
                <p className="text-2xl font-black uppercase tracking-tighter">{ticket.coach || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Kursi</p>
                <p className="text-2xl font-black uppercase tracking-tighter">{ticket.seat || '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Kedatangan (Perkiraan)</p>
                <p className="text-3xl font-black uppercase tracking-tighter">TBD — {displayDate}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-2">{ticket.tujuan} DEPOT</p>
              </div>
              <div className="col-span-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Kelas</p>
                <div className="bg-black text-white inline-block px-4 py-2 text-[10px] font-black uppercase tracking-widest mt-1">
                  {ticket.kelas || 'Standar'}
                </div>
              </div>
            </div>

            <div className="border-t-[3px] border-dashed border-gray-300 my-10"></div>

            <div className="flex flex-col sm:flex-row gap-8">
              <div className="w-full sm:w-56 h-36 border-[3px] border-black p-2 bg-gray-50 shrink-0 relative overflow-hidden">
                 <img src={ticket.image} className="w-full h-full object-cover filter grayscale contrast-125" />
                 <div className="absolute inset-0 border-2 border-transparent hover:border-black transition-colors cursor-pointer" title="View Full Extent"></div>
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter mb-3">Tiket Digital Disertakan</h3>
                <p className="text-xs font-medium text-gray-600 mb-6 leading-relaxed max-w-sm">
                  Tiket ini sudah diverifikasi oleh sistem TiketSepur. Kursi tetap aman, dan Anda cukup tunjukkan tiket digital saat proses check-in.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <div className="w-4 h-4 bg-black flex items-center justify-center text-white text-[8px] rounded-full">✓</div>
                  Terverifikasi Oleh Sistem TiketSepur
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#f4f4f4] border-l-[6px] border-black p-8 md:p-10">
            <h4 className="text-sm font-black uppercase tracking-tighter mb-6">Spesifikasi Manifest</h4>
            <ul className="space-y-4 text-xs font-semibold text-gray-600">
              <li className="flex gap-3"><span className="text-black">+</span> Informasi tiket disesuaikan dengan data yang diunggah penjual.</li>
              <li className="flex gap-3"><span className="text-black">+</span> Diskusikan detail perubahan jadwal langsung dengan penjual melalui WhatsApp.</li>
              <li className="flex gap-3"><span className="text-black">+</span> Simpan halaman ini agar akses tiket tetap cepat saat dibutuhkan.</li>
            </ul>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:w-1/3 space-y-8">
          
          <div className="bg-black text-white p-8 md:p-10 shadow-brand-lg">
            <p className="text-[9px] font-black uppercase tracking-widest mb-4 opacity-70">Penawaran Final</p>
            <div className="text-5xl font-black tracking-tighter mb-8 flex items-start">
              <span className="text-2xl mt-1 mr-1">Rp</span>
              {ticket.harga.toLocaleString('id-ID')}
            </div>
            
            {waUrl ? (
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="block w-full bg-white text-black p-4 text-center text-[11px] font-black uppercase tracking-widest hover:bg-gray-200 transition border-2 border-white shadow-sm flex items-center justify-center gap-3">
                  <MessageSquare className="h-4 w-4" /> Hubungi Penjual via WhatsApp
                </a>
            ) : (
                <div className="w-full border-2 border-dashed border-gray-600 text-gray-400 p-4 text-center text-[10px] font-black uppercase tracking-widest">
                  Kontak Penjual Tersembunyi
                </div>
            )}
            
            <p className="text-[8px] font-black uppercase tracking-widest text-center mt-6 opacity-50">
              Komunikasi Langsung Dan Transparan
            </p>
          </div>

          <div className="border-[3px] border-black bg-white p-8 shadow-brand">
             <div className="flex items-center gap-4 mb-8">
               <div className="w-16 h-16 border-[2px] border-black bg-gray-100 overflow-hidden shrink-0">
                 <SellerAvatar name={ticket.user.name} image={ticket.user.image} />
               </div>
               <div>
                 <h4 className="text-lg font-black uppercase tracking-tighter sm:truncate max-w-[150px]">{sellerName}</h4>
                 <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">Penjual Terverifikasi TiketSepur</p>
               </div>
             </div>

             <div className="flex border-t-[2px] border-b-[2px] border-black py-4 mb-6">
                <div className="flex-1 text-center border-r-[2px] border-black">
                  <p className="text-xl font-black tracking-tighter">01</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Tiket Terjual</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xl font-black tracking-tighter">100%</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Tingkat Respons</p>
                </div>
             </div>

             <div className="space-y-3 text-[9px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 flex items-center justify-center border border-black rounded-sm">✓</div>
                  Identitas Diverifikasi
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <Clock className="w-3 h-3" strokeWidth={3} />
                  Biasanya membalas dalam 5 menit
                </div>
             </div>
          </div>

          <div className="border-[3px] border-black bg-gray-200 h-48 relative overflow-hidden flex items-center justify-center p-4">
            {/* Map Placeholder */}
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center, #aaa 1px, transparent 1.5px)', backgroundSize: '16px 16px' }}></div>
            <MapPin className="h-24 w-24 text-gray-400 absolute top-1/2 left-1/2 -ml-12 -mt-16" />
            <div className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest relative z-10 z-10 shadow-brand">
              Asal: {ticket.asal}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
