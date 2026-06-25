// AidTrack – Social Assistance Tracking Platform Kota Bogor
import { useState, useMemo, useRef, useEffect } from "react";
import { Toaster, toast } from "sonner";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  Tooltip, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  LayoutDashboard, Users, Gift, ClipboardList, CheckSquare,
  FileText, Bell, Settings, Search, Home, History, User,
  LogOut, Eye, Edit2, Trash2, Plus, Download, X, Check,
  AlertCircle, Clock, ChevronLeft, ChevronRight, ChevronDown,
  Menu, TrendingUp, Activity, CheckCircle, XCircle, AlertTriangle,
  Send, Phone, Mail, Calendar, Building2, SlidersHorizontal,
  MapPin, BarChart2, ArrowUpRight, ArrowDownRight, Upload,
  Shield, Package, Target, Zap, Award, RefreshCw, FileDown,
  Star, Info, Hash, Globe, Layers
} from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Role = "admin" | "stakeholder" | "citizen" | null;

type Page =
  | "landing" | "login" | "register"
  | "admin-dashboard" | "admin-penerima" | "admin-bantuan"
  | "admin-pengajuan" | "admin-verifikasi" | "admin-tracking"
  | "admin-laporan" | "admin-notifikasi" | "admin-pengaturan"
  | "stakeholder-dashboard" | "stakeholder-monitoring"
  | "stakeholder-statistik" | "stakeholder-wilayah" | "stakeholder-program"
  | "citizen-dashboard" | "citizen-tracking" | "citizen-pengajuan"
  | "citizen-riwayat" | "citizen-notifikasi" | "citizen-profil";

type StatusBantuan = "Menunggu Verifikasi" | "Diproses" | "Disetujui" | "Disalurkan" | "Ditolak";

interface Penerima {
  id: string; nik: string; nama: string; alamat: string;
  kecamatan: string; kelurahan: string; phone: string;
  email: string; status: "Aktif" | "Nonaktif"; createdAt: string;
}

interface BantuanProgram {
  id: string; nama: string; jenis: string; nominal: number;
  status: "Aktif" | "Nonaktif"; tanggalPenyaluran: string;
  penerima: number; anggaran: number; kecamatan: string;
}

interface Pengajuan {
  id: string; penerimaId: string; namaPenerima: string; nik: string;
  kecamatan: string; kelurahan: string; jenisBantuan: string;
  status: StatusBantuan; tanggal: string; catatan: string;
  petugas: string; dokumen: string[]; timeline: TimelineItem[];
}

interface TimelineItem {
  tahap: string; tanggal: string; catatan: string;
  petugas: string; selesai: boolean; aktif: boolean;
}

interface Notifikasi {
  id: string; judul: string; pesan: string; tanggal: string;
  dibaca: boolean; tipe: "success" | "info" | "warning" | "error";
  pengajuanId?: string;
}

interface DB {
  penerima: Penerima[]; bantuan: BantuanProgram[];
  pengajuan: Pengajuan[]; notifikasi: Notifikasi[];
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const KECAMATAN = [
  "Bogor Barat", "Bogor Timur", "Bogor Utara",
  "Bogor Selatan", "Bogor Tengah", "Tanah Sareal",
];
const KELURAHAN_MAP: Record<string, string[]> = {
  "Bogor Barat": ["Menteng", "Pasir Mulya", "Curug Mekar", "Cilendek Barat", "Sindang Rasa"],
  "Bogor Timur": ["Katulampa", "Sindangrasa", "Tajur", "Baranangsiang", "Sukasari"],
  "Bogor Utara": ["Cibuluh", "Ciluar", "Tegal Gundil", "Bantar Jati", "Tanah Baru"],
  "Bogor Selatan": ["Mulyaharja", "Pamoyanan", "Kertamaya", "Harjasari", "Cipaku"],
  "Bogor Tengah": ["Cibogor", "Sempur", "Panaragan", "Gudang", "Pabaton"],
  "Tanah Sareal": ["Kedung Badak", "Tanah Sareal", "Cibadak", "Sukadamai", "Kencana"],
};
const JENIS_BANTUAN = ["PKH", "BPNT", "BLT Dana Desa", "Bansos Reguler", "Bantuan Langsung Tunai"];
const NAMA_BANTUAN_MAP: Record<string, string> = {
  "PKH": "Program Keluarga Harapan",
  "BPNT": "Bantuan Pangan Non-Tunai",
  "BLT Dana Desa": "Bantuan Langsung Tunai Dana Desa",
  "Bansos Reguler": "Bantuan Sosial Reguler Kota Bogor",
  "Bantuan Langsung Tunai": "BLT Pemerintah Pusat",
};
const NOMINAL_MAP: Record<string, number> = {
  "PKH": 3000000, "BPNT": 2400000, "BLT Dana Desa": 1800000,
  "Bansos Reguler": 1200000, "Bantuan Langsung Tunai": 2500000,
};
const FIRST_NAMES = [
  "Ahmad", "Budi", "Dedi", "Eko", "Fauzi", "Hendra", "Irwan", "Joko", "Karto", "Lukman",
  "Siti", "Dewi", "Nur", "Rina", "Yanti", "Ani", "Dina", "Fitri", "Gita", "Putri",
  "Rudi", "Surya", "Tono", "Wahyu", "Maya", "Indah", "Hana", "Zainal", "Yudi", "Farida",
];
const LAST_NAMES = [
  "Santoso", "Rahayu", "Wijaya", "Kusuma", "Pratama", "Hartono",
  "Setiawan", "Gunawan", "Susanto", "Wibowo", "Nugroho", "Saputra",
  "Hidayat", "Firmansyah", "Ramadan", "Anwar", "Halim", "Handoko",
];
const JALAN = ["Merdeka", "Sudirman", "Diponegoro", "Pahlawan", "Mawar", "Melati", "Kenanga", "Dahlia"];
const CATATAN_LIST = [
  "Keluarga tidak mampu", "Lansia tidak produktif", "Difabel berat",
  "Kepala keluarga meninggal", "PHK akibat pandemi", "Buruh tani miskin",
  "Janda dengan anak banyak", "Rumah tidak layak huni",
];
const PETUGAS_LIST = [
  "Ahmad Santoso", "Siti Rahayu", "Budi Prakoso",
  "Dewi Kusuma", "Hendra Wijaya", "Nur Indah",
];
const STATUS_FLOW: StatusBantuan[] = [
  "Menunggu Verifikasi", "Diproses", "Disetujui", "Disalurkan", "Ditolak",
];
const C = {
  darkRose: "#A44F6A",
  primary: "#D47A9A",
  soft: "#E8A3B5",
  surface: "#FAF3F6",
  border: "#F1D8E2",
  success: "#10B981",
  slate: "#64748B",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const makeName = (i: number) =>
  `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]}`;

const makeNIK = (i: number) =>
  `3272${String(10 + (i % 89)).padStart(2, "0")}${String(100000 + i * 7).slice(0, 6)}${String(1000 + i * 3).slice(0, 4)}`;

const dateAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
};

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const makeTimeline = (statusIdx: number): TimelineItem[] => {
  const stages = ["Pengajuan", "Verifikasi", "Diproses", "Disetujui", "Disalurkan"];
  const reached = statusIdx === 4 ? 2 : statusIdx + 1;
  return stages.map((tahap, i) => ({
    tahap,
    tanggal: i < reached ? dateAgo(Math.max(0, (reached - i) * 4)) : "",
    catatan: i < reached ? `Tahap ${tahap} telah selesai diproses` : "Menunggu proses sebelumnya",
    petugas: i === 0 ? "Sistem" : PETUGAS_LIST[i % PETUGAS_LIST.length],
    selesai: i < reached,
    aktif: i === reached - 1,
  }));
};

// ─── INIT DATABASE ────────────────────────────────────────────────────────────

function initDB(): DB {
  const kec = (i: number) => KECAMATAN[i % 6];
  const kel = (i: number) => {
    const k = kec(i);
    return KELURAHAN_MAP[k][i % KELURAHAN_MAP[k].length];
  };

  const penerima: Penerima[] = Array.from({ length: 100 }, (_, i) => ({
    id: `P${String(i + 1).padStart(3, "0")}`,
    nik: makeNIK(i),
    nama: makeName(i),
    alamat: `Jl. ${JALAN[i % JALAN.length]} No. ${(i * 3 + 1) % 149 + 1}`,
    kecamatan: kec(i),
    kelurahan: kel(i),
    phone: `08${String(10000000 + i * 13579).slice(0, 8)}`,
    email: `${FIRST_NAMES[i % FIRST_NAMES.length].toLowerCase()}${i + 1}@mail.id`,
    status: i % 10 === 9 ? "Nonaktif" : "Aktif",
    createdAt: dateAgo(i * 3 + 30),
  }));

  const bantuan: BantuanProgram[] = JENIS_BANTUAN.map((jenis, i) => ({
    id: `B${String(i + 1).padStart(3, "0")}`,
    nama: NAMA_BANTUAN_MAP[jenis],
    jenis,
    nominal: NOMINAL_MAP[jenis],
    status: "Aktif",
    tanggalPenyaluran: dateAgo(10 + i * 5),
    penerima: [480, 320, 250, 195, 180][i],
    anggaran: NOMINAL_MAP[jenis] * [480, 320, 250, 195, 180][i],
    kecamatan: KECAMATAN[i % 6],
  }));

  const pengajuan: Pengajuan[] = Array.from({ length: 50 }, (_, i) => {
    const p = penerima[(i * 2) % 100];
    const statusIdx = i % 5;
    return {
      id: `AJU${String(i + 1).padStart(4, "0")}`,
      penerimaId: p.id,
      namaPenerima: p.nama,
      nik: p.nik,
      kecamatan: p.kecamatan,
      kelurahan: p.kelurahan,
      jenisBantuan: JENIS_BANTUAN[i % 5],
      status: STATUS_FLOW[statusIdx],
      tanggal: dateAgo(i * 2 + 1),
      catatan: CATATAN_LIST[i % CATATAN_LIST.length],
      petugas: PETUGAS_LIST[i % PETUGAS_LIST.length],
      dokumen: ["KTP", "KK", "Surat Keterangan Tidak Mampu"],
      timeline: makeTimeline(statusIdx),
    };
  });

  const notifikasi: Notifikasi[] = [
    { id: "N001", judul: "Bantuan Diverifikasi", pesan: "Pengajuan bantuan PKH Anda telah diverifikasi oleh petugas. Menunggu proses selanjutnya.", tanggal: dateAgo(2), dibaca: false, tipe: "info", pengajuanId: "AJU0001" },
    { id: "N002", judul: "Bantuan Disetujui", pesan: "Selamat! Pengajuan BPNT Anda disetujui. Bantuan akan segera disalurkan.", tanggal: dateAgo(5), dibaca: false, tipe: "success", pengajuanId: "AJU0002" },
    { id: "N003", judul: "Bantuan Disalurkan", pesan: "Bantuan BLT Dana Desa Rp 1.800.000 telah disalurkan ke rekening Anda.", tanggal: dateAgo(10), dibaca: true, tipe: "success", pengajuanId: "AJU0003" },
    { id: "N004", judul: "Dokumen Perlu Diperbaiki", pesan: "KK Anda tidak terbaca dengan jelas. Mohon upload ulang dokumen KK.", tanggal: dateAgo(14), dibaca: true, tipe: "warning", pengajuanId: "AJU0004" },
    { id: "N005", judul: "Pengajuan Diterima", pesan: "Pengajuan Bansos Reguler diterima dan menunggu verifikasi petugas lapangan.", tanggal: dateAgo(20), dibaca: true, tipe: "info", pengajuanId: "AJU0005" },
  ];

  return { penerima, bantuan, pengajuan, notifikasi };
}

// ─── STATIC CHART DATA ────────────────────────────────────────────────────────

const MONTHLY_DATA = [
  { bulan: "Jan", disalurkan: 245, diproses: 180, ditolak: 32 },
  { bulan: "Feb", disalurkan: 312, diproses: 210, ditolak: 28 },
  { bulan: "Mar", disalurkan: 289, diproses: 195, ditolak: 41 },
  { bulan: "Apr", disalurkan: 378, diproses: 220, ditolak: 35 },
  { bulan: "Mei", disalurkan: 356, diproses: 245, ditolak: 29 },
  { bulan: "Jun", disalurkan: 421, diproses: 280, ditolak: 38 },
  { bulan: "Jul", disalurkan: 398, diproses: 265, ditolak: 42 },
  { bulan: "Agu", disalurkan: 445, diproses: 290, ditolak: 31 },
  { bulan: "Sep", disalurkan: 389, diproses: 275, ditolak: 44 },
  { bulan: "Okt", disalurkan: 467, diproses: 310, ditolak: 36 },
  { bulan: "Nov", disalurkan: 512, diproses: 325, ditolak: 29 },
  { bulan: "Des", disalurkan: 489, diproses: 298, ditolak: 33 },
];

const KECAMATAN_CHART = [
  { name: "Bgr Barat", penerima: 720, disalurkan: 580, ditolak: 52 },
  { name: "Bgr Timur", penerima: 650, disalurkan: 510, ditolak: 48 },
  { name: "Bgr Utara", penerima: 580, disalurkan: 445, ditolak: 39 },
  { name: "Bgr Selatan", penerima: 490, disalurkan: 380, ditolak: 41 },
  { name: "Bgr Tengah", penerima: 420, disalurkan: 315, ditolak: 35 },
  { name: "T. Sareal", penerima: 380, disalurkan: 290, ditolak: 28 },
];

const STATUS_PIE = [
  { name: "Disalurkan", value: 1248, color: C.darkRose },
  { name: "Disetujui", value: 320, color: C.primary },
  { name: "Diproses", value: 215, color: C.soft },
  { name: "Menunggu", value: 189, color: C.border },
  { name: "Ditolak", value: 98, color: C.slate },
];

const PROGRAM_DONUT = [
  { name: "PKH", value: 34, color: C.darkRose },
  { name: "BPNT", value: 26, color: C.primary },
  { name: "BLT Dana Desa", value: 18, color: C.soft },
  { name: "Bansos Reguler", value: 14, color: C.slate },
  { name: "BLT Pusat", value: 8, color: C.success },
];

// ─── PRIMITIVE UI COMPONENTS ──────────────────────────────────────────────────

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    "Menunggu Verifikasi": "bg-amber-50 text-amber-700 border border-amber-200",
    "Diproses": "bg-blue-50 text-blue-700 border border-blue-200",
    "Disetujui": "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "Disalurkan": "bg-green-50 text-green-700 border border-green-200",
    "Ditolak": "bg-red-50 text-red-700 border border-red-200",
    "Aktif": "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "Nonaktif": "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", cfg[status] ?? "bg-gray-100 text-gray-600")}>
      {status}
    </span>
  );
}

function Btn({
  children, onClick, variant = "primary", size = "md", className = "", disabled = false, type = "button"
}: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg"; className?: string; disabled?: boolean;
  type?: "button" | "submit";
}) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  const variants: Record<string, string> = {
    primary: "bg-[#D47A9A] text-white hover:bg-[#C4698A] shadow-sm",
    secondary: "bg-[#F1D8E2] text-[#A44F6A] hover:bg-[#E8C8D6]",
    ghost: "text-[#64748B] hover:bg-[#FAF3F6]",
    danger: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-[#F1D8E2] text-[#1F2937] hover:bg-[#FAF3F6]",
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={cn(base, sizes[size], variants[variant], className)}>
      {children}
    </button>
  );
}

function Modal({ isOpen, onClose, title, children, wide = false }: {
  isOpen: boolean; onClose: () => void; title: string;
  children: React.ReactNode; wide?: boolean;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto", wide ? "w-full max-w-3xl" : "w-full max-w-lg")}>
        <div className="flex items-center justify-between p-6 border-b border-[#F1D8E2]">
          <h3 className="text-lg font-semibold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#FAF3F6] text-[#64748B] transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Pagination({ total, page, perPage, onChange }: {
  total: number; page: number; perPage: number; onChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });
  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-sm text-[#64748B]">
        Menampilkan {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} dari {total} data
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="p-1.5 rounded-lg hover:bg-[#FAF3F6] disabled:opacity-40 cursor-pointer transition-colors">
          <ChevronLeft size={16} />
        </button>
        {pages.map(p => (
          <button key={p} onClick={() => onChange(p)}
            className={cn("w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer",
              p === page ? "bg-[#D47A9A] text-white" : "hover:bg-[#FAF3F6] text-[#64748B]")}>
            {p}
          </button>
        ))}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="p-1.5 rounded-lg hover:bg-[#FAF3F6] disabled:opacity-40 cursor-pointer transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder = "Cari..." }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="pl-9 pr-4 py-2 text-sm rounded-xl border border-[#F1D8E2] bg-white focus:outline-none focus:ring-2 focus:ring-[#D47A9A]/30 w-full" />
    </div>
  );
}

function Select({ value, onChange, options, className = "" }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="appearance-none w-full pl-3 pr-8 py-2 text-sm rounded-xl border border-[#F1D8E2] bg-white focus:outline-none focus:ring-2 focus:ring-[#D47A9A]/30 cursor-pointer">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 text-sm rounded-xl border border-[#F1D8E2] bg-white focus:outline-none focus:ring-2 focus:ring-[#D47A9A]/30" />
  );
}

function KpiCard({ label, value, sub, icon: Icon, trend, color = C.primary, onClick }: {
  label: string; value: string; sub?: string; icon: React.ElementType;
  trend?: { value: string; up: boolean }; color?: string; onClick?: () => void;
}) {
  return (
    <div onClick={onClick}
      className={cn("bg-white rounded-2xl p-5 border border-[#F1D8E2] shadow-sm transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5")}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: color + "20" }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-xs font-medium", trend.up ? "text-emerald-600" : "text-red-500")}>
            {trend.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend.value}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-[#1F2937] mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {value}
      </div>
      <div className="text-sm text-[#64748B]">{label}</div>
      {sub && <div className="text-xs text-[#64748B] mt-0.5">{sub}</div>}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl border border-[#F1D8E2] shadow-sm", className)}>
      {children}
    </div>
  );
}

function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-5 border-b border-[#F1D8E2]">
      <h3 className="font-semibold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
      {action}
    </div>
  );
}

function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => String(row[h] ?? "")).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ─── LAYOUT COMPONENTS ────────────────────────────────────────────────────────

const ADMIN_NAV = [
  { page: "admin-dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { page: "admin-penerima" as Page, label: "Data Penerima", icon: Users },
  { page: "admin-bantuan" as Page, label: "Data Bantuan", icon: Gift },
  { page: "admin-pengajuan" as Page, label: "Pengajuan", icon: ClipboardList },
  { page: "admin-verifikasi" as Page, label: "Verifikasi", icon: CheckSquare },
  { page: "admin-tracking" as Page, label: "Tracking", icon: Activity },
  { page: "admin-laporan" as Page, label: "Laporan", icon: FileText },
  { page: "admin-notifikasi" as Page, label: "Notifikasi", icon: Bell },
  { page: "admin-pengaturan" as Page, label: "Pengaturan", icon: Settings },
];

const STAKEHOLDER_NAV = [
  { page: "stakeholder-dashboard" as Page, label: "Executive Dashboard", icon: LayoutDashboard },
  { page: "stakeholder-monitoring" as Page, label: "Monitoring Distribusi", icon: Activity },
  { page: "stakeholder-statistik" as Page, label: "Statistik Real-Time", icon: BarChart2 },
  { page: "stakeholder-wilayah" as Page, label: "Analisis Wilayah", icon: MapPin },
  { page: "stakeholder-program" as Page, label: "Program Bantuan", icon: Package },
];

function AdminLayout({ page, nav, children, db, userName = "Admin Dinssos" }: {
  page: Page; nav: (p: Page) => void; children: React.ReactNode;
  db: DB; userName?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const unread = db.notifikasi.filter(n => !n.dibaca).length;
  const isStakeholder = page.startsWith("stakeholder");
  const navItems = isStakeholder ? STAKEHOLDER_NAV : ADMIN_NAV;

  return (
    <div className="flex h-screen bg-[#FAF3F6] overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col bg-white border-r border-[#F1D8E2] transition-all duration-300 shrink-0 z-20",
        sidebarOpen ? "w-60" : "w-16"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-[#F1D8E2] h-16">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.darkRose})` }}>
            <Shield size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <div className="font-bold text-sm text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AidTrack</div>
              <div className="text-[10px] text-[#64748B]">Dinas Sosial Bogor</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = page === item.page;
            return (
              <button key={item.page} onClick={() => nav(item.page)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer",
                  active
                    ? "bg-[#FAF3F6] text-[#D47A9A]"
                    : "text-[#64748B] hover:bg-[#FAF3F6] hover:text-[#D47A9A]"
                )}>
                <item.icon size={18} className="shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
                {sidebarOpen && active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D47A9A]" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-[#F1D8E2]">
          <button onClick={() => nav("landing")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#64748B] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer">
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[#F1D8E2] flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-[#FAF3F6] cursor-pointer transition-colors">
              <Menu size={18} className="text-[#64748B]" />
            </button>
            <div className="text-xs text-[#64748B] hidden sm:block">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input placeholder="Cari..." className="pl-8 pr-4 py-1.5 text-sm rounded-xl border border-[#F1D8E2] bg-[#FAF3F6] focus:outline-none focus:ring-2 focus:ring-[#D47A9A]/30 w-44" />
            </div>
            <button onClick={() => nav(isStakeholder ? "stakeholder-dashboard" : "admin-notifikasi")}
              className="relative p-2 rounded-xl hover:bg-[#FAF3F6] cursor-pointer transition-colors">
              <Bell size={18} className="text-[#64748B]" />
              {unread > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#D47A9A] text-white text-[10px] flex items-center justify-center">{unread}</span>}
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-[#F1D8E2]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.darkRose})` }}>
                {userName.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-[#1F2937]">{userName}</div>
                <div className="text-[10px] text-[#64748B]">{isStakeholder ? "Pimpinan" : "Admin Dinsos"}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
}

function CitizenLayout({ page, nav, children, db }: {
  page: Page; nav: (p: Page) => void; children: React.ReactNode; db: DB;
}) {
  const unread = db.notifikasi.filter(n => !n.dibaca).length;
  const bottomNav = [
    { page: "citizen-dashboard" as Page, label: "Beranda", icon: Home },
    { page: "citizen-tracking" as Page, label: "Tracking", icon: Activity },
    { page: "citizen-pengajuan" as Page, label: "Pengajuan", icon: Plus },
    { page: "citizen-riwayat" as Page, label: "Riwayat", icon: History },
    { page: "citizen-notifikasi" as Page, label: "Notifikasi", icon: Bell },
    { page: "citizen-profil" as Page, label: "Profil", icon: User },
  ];
  return (
    <div className="min-h-screen bg-[#FAF3F6] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-[#F1D8E2] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.darkRose})` }}>
            <Shield size={13} className="text-white" />
          </div>
          <span className="font-bold text-sm text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AidTrack</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => nav("citizen-notifikasi")} className="relative p-1.5 rounded-xl hover:bg-[#FAF3F6] cursor-pointer">
            <Bell size={18} className="text-[#64748B]" />
            {unread > 0 && <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#D47A9A] text-white text-[9px] flex items-center justify-center">{unread}</span>}
          </button>
          <button onClick={() => nav("citizen-profil")} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.darkRose})` }}>S</button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#F1D8E2] flex">
        {bottomNav.map(item => {
          const active = page === item.page;
          const isCenter = item.page === "citizen-pengajuan";
          return (
            <button key={item.page} onClick={() => nav(item.page)}
              className={cn("flex-1 flex flex-col items-center justify-center py-2 transition-colors cursor-pointer",
                active ? "text-[#D47A9A]" : "text-[#64748B]")}>
              {isCenter ? (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-0.5 -mt-4 shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.darkRose})` }}>
                  <Plus size={20} className="text-white" />
                </div>
              ) : (
                <div className="relative">
                  <item.icon size={19} />
                  {item.page === "citizen-notifikasi" && unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#D47A9A] text-white text-[8px] flex items-center justify-center">{unread}</span>
                  )}
                </div>
              )}
              <span className={cn("text-[10px] font-medium mt-0.5", isCenter && "mt-1")}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

function LandingPage({ nav }: { nav: (p: Page) => void }) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const faqs = [
    { q: "Apa itu AidTrack?", a: "AidTrack adalah platform digital milik Dinas Sosial Kota Bogor untuk monitoring, tracking, validasi, dan pelaporan bantuan sosial secara real-time dan transparan." },
    { q: "Siapa yang bisa menggunakan AidTrack?", a: "AidTrack dapat digunakan oleh masyarakat penerima bantuan, petugas Admin Dinas Sosial, serta Pimpinan/Stakeholder Dinas Sosial Kota Bogor." },
    { q: "Bagaimana cara mengajukan bantuan?", a: "Daftarkan akun sebagai Masyarakat, kemudian masuk ke menu Pengajuan Bantuan. Isi formulir, upload dokumen yang diperlukan (KTP, KK, Surat Keterangan), dan kirim pengajuan." },
    { q: "Berapa lama proses verifikasi bantuan?", a: "Proses verifikasi oleh petugas Dinas Sosial biasanya memakan waktu 3–7 hari kerja setelah berkas dinyatakan lengkap dan valid." },
    { q: "Apakah data saya aman di AidTrack?", a: "Ya, AidTrack menggunakan enkripsi data end-to-end dan autentikasi berlapis untuk melindungi data pribadi seluruh pengguna sesuai peraturan perlindungan data berlaku." },
  ];
  const features = [
    { icon: Activity, title: "Tracking Real-Time", desc: "Pantau status pengajuan bantuan sosial Anda secara real-time dengan timeline interaktif." },
    { icon: Shield, title: "Verifikasi Transparan", desc: "Proses verifikasi dokumen yang transparan dengan notifikasi di setiap tahapan." },
    { icon: BarChart2, title: "Dashboard Analitik", desc: "Dashboard eksekutif dengan visualisasi data distribusi bantuan per wilayah dan program." },
    { icon: Bell, title: "Notifikasi Otomatis", desc: "Dapatkan notifikasi real-time setiap ada pembaruan status pengajuan bantuan Anda." },
    { icon: FileText, title: "Laporan Lengkap", desc: "Ekspor laporan distribusi bantuan dalam format PDF, Excel, dan CSV kapan saja." },
    { icon: Globe, title: "Akses Multi-Perangkat", desc: "Akses platform AidTrack dari perangkat apapun — desktop, tablet, maupun smartphone." },
  ];
  const steps = [
    { num: "01", title: "Daftar & Login", desc: "Buat akun menggunakan NIK dan data diri. Login sebagai Masyarakat, Admin, atau Pimpinan." },
    { num: "02", title: "Ajukan Bantuan", desc: "Isi formulir pengajuan, upload dokumen KTP, KK, dan Surat Keterangan Tidak Mampu." },
    { num: "03", title: "Pantau Status", desc: "Tracking status pengajuan secara real-time melalui dashboard dan notifikasi otomatis." },
  ];

  return (
    <div className="min-h-screen bg-[#FAF3F6]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#F1D8E2]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.darkRose})` }}>
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-bold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AidTrack</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-[#64748B]">
            <a href="#fitur" className="hover:text-[#D47A9A] transition-colors cursor-pointer">Fitur</a>
            <a href="#cara-kerja" className="hover:text-[#D47A9A] transition-colors cursor-pointer">Cara Kerja</a>
            <a href="#faq" className="hover:text-[#D47A9A] transition-colors cursor-pointer">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="outline" size="sm" onClick={() => nav("login")}>Login</Btn>
            <Btn variant="primary" size="sm" onClick={() => nav("register")}>Daftar</Btn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #FAF3F6 0%, #F1D8E2 50%, #E8C8D6 100%)` }} />
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${C.primary}, transparent)` }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${C.darkRose}, transparent)` }} />
        <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E8A3B5] bg-white/60 text-xs text-[#A44F6A] font-medium mb-6">
            <Zap size={12} /> Platform Bantuan Sosial Digital Kota Bogor
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1F2937] mb-5 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            AidTrack – Sistem Pemantauan<br />
            <span style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.darkRose})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Distribusi Bantuan Sosial
            </span>
            <br />Kota Bogor
          </h1>
          <p className="text-lg text-[#64748B] max-w-2xl mx-auto mb-8 leading-relaxed">
            Meningkatkan transparansi, akurasi, dan efisiensi distribusi bantuan sosial melalui pemantauan real-time dan dashboard analitik terpadu.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Btn variant="primary" size="lg" onClick={() => nav("citizen-pengajuan")}>
              <Send size={16} /> Mulai Tracking
            </Btn>
            <Btn variant="outline" size="lg" onClick={() => nav("login")}>
              <User size={16} /> Login
            </Btn>
            <Btn variant="secondary" size="lg" onClick={() => nav("stakeholder-dashboard")}>
              <BarChart2 size={16} /> Lihat Demo Dashboard
            </Btn>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-3xl mx-auto">
            {[
              { value: "4.892", label: "Bantuan Disalurkan" },
              { value: "2.847", label: "Penerima Aktif" },
              { value: "94.7%", label: "Akurasi Data" },
              { value: "6", label: "Kecamatan Terlayani" },
            ].map(s => (
              <div key={s.label} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-[#F1D8E2]">
                <div className="text-2xl font-extrabold text-[#D47A9A]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
                <div className="text-xs text-[#64748B] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <div className="text-xs font-semibold text-[#D47A9A] uppercase tracking-widest mb-2">Fitur Utama</div>
          <h2 className="text-3xl font-extrabold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Semua yang Anda Butuhkan
          </h2>
          <p className="text-[#64748B] mt-2">Platform lengkap untuk pengelolaan bantuan sosial modern</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-[#F1D8E2] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: C.primary + "20" }}>
                <f.icon size={20} style={{ color: C.primary }} />
              </div>
              <h3 className="font-semibold text-[#1F2937] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{f.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="cara-kerja" className="py-16" style={{ backgroundColor: "#F7EEF3" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-10">
            <div className="text-xs font-semibold text-[#D47A9A] uppercase tracking-widest mb-2">Cara Kerja</div>
            <h2 className="text-3xl font-extrabold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>3 Langkah Mudah</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className="relative text-center">
                {i < 2 && <div className="hidden md:block absolute top-8 left-[60%] right-[-40%] h-0.5 bg-[#F1D8E2]" />}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-extrabold text-white"
                  style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.darkRose})`, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {s.num}
                </div>
                <h3 className="font-bold text-[#1F2937] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.title}</h3>
                <p className="text-sm text-[#64748B]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <div className="text-xs font-semibold text-[#D47A9A] uppercase tracking-widest mb-2">FAQ</div>
          <h2 className="text-3xl font-extrabold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pertanyaan Umum</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#F1D8E2] overflow-hidden">
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-[#FAF3F6] transition-colors">
                <span className="font-medium text-[#1F2937] text-sm">{f.q}</span>
                <ChevronDown size={16} className={cn("text-[#64748B] transition-transform shrink-0 ml-3", faqOpen === i && "rotate-180")} />
              </button>
              {faqOpen === i && (
                <div className="px-5 pb-5 text-sm text-[#64748B] leading-relaxed border-t border-[#F1D8E2] pt-4">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 pb-16">
        <div className="rounded-3xl p-10 text-center text-white" style={{ background: `linear-gradient(135deg, ${C.darkRose}, ${C.primary})` }}>
          <h2 className="text-3xl font-extrabold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Mulai Gunakan AidTrack Sekarang
          </h2>
          <p className="text-white/80 mb-7 max-w-xl mx-auto">
            Bergabunglah dengan ribuan masyarakat Kota Bogor yang telah merasakan kemudahan akses bantuan sosial digital.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => nav("register")}
              className="px-6 py-3 rounded-xl bg-white text-[#D47A9A] font-semibold text-sm hover:bg-[#FAF3F6] transition-colors cursor-pointer">
              Daftar Sekarang
            </button>
            <button onClick={() => nav("admin-dashboard")}
              className="px-6 py-3 rounded-xl border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors cursor-pointer">
              Demo Admin
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#F1D8E2] py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.darkRose})` }}>
              <Shield size={13} className="text-white" />
            </div>
            <span className="font-bold text-[#1F2937] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AidTrack</span>
          </div>
          <div className="text-sm text-[#64748B]">© 2025 Dinas Sosial Kota Bogor. Hak cipta dilindungi.</div>
          <div className="flex items-center gap-4 text-sm text-[#64748B]">
            <span className="cursor-pointer hover:text-[#D47A9A] transition-colors">Kebijakan Privasi</span>
            <span className="cursor-pointer hover:text-[#D47A9A] transition-colors">Syarat Layanan</span>
            <span className="cursor-pointer hover:text-[#D47A9A] transition-colors">Kontak</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── AUTH PAGES ───────────────────────────────────────────────────────────────

function LoginPage({ nav }: { nav: (p: Page) => void }) {
  const [role, setRole] = useState<"citizen" | "admin" | "stakeholder">("citizen");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) { toast.error("Email dan password wajib diisi"); return; }
    toast.success(`Login berhasil sebagai ${role === "citizen" ? "Masyarakat" : role === "admin" ? "Admin" : "Pimpinan"}`);
    setTimeout(() => {
      if (role === "citizen") nav("citizen-dashboard");
      else if (role === "admin") nav("admin-dashboard");
      else nav("stakeholder-dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-1/2 p-12 text-white" style={{ background: `linear-gradient(135deg, ${C.darkRose} 0%, ${C.primary} 60%, ${C.soft} 100%)` }}>
        <div className="flex items-center gap-3 mb-auto">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AidTrack</div>
            <div className="text-white/70 text-sm">Dinas Sosial Kota Bogor</div>
          </div>
        </div>
        <div className="mt-auto">
          <h2 className="text-4xl font-extrabold mb-4 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Selamat Datang di<br />Platform Bantuan Sosial
          </h2>
          <p className="text-white/80 leading-relaxed">
            Pantau, kelola, dan distribusikan bantuan sosial Kota Bogor secara transparan dan efisien dengan teknologi terdepan.
          </p>
          <div className="flex gap-4 mt-8">
            {[{ n: "2.847", l: "Penerima" }, { n: "4.892", l: "Disalurkan" }, { n: "94.7%", l: "Akurasi" }].map(s => (
              <div key={s.l} className="bg-white/15 rounded-xl px-4 py-3">
                <div className="text-xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.n}</div>
                <div className="text-white/70 text-xs mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#FAF3F6]">
        <div className="w-full max-w-md">
          <button onClick={() => nav("landing")} className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#D47A9A] mb-8 cursor-pointer transition-colors">
            <ChevronLeft size={16} /> Kembali ke Beranda
          </button>
          <h2 className="text-2xl font-extrabold text-[#1F2937] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Masuk ke AidTrack</h2>
          <p className="text-sm text-[#64748B] mb-6">Pilih peran Anda dan masukkan kredensial</p>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { value: "citizen" as const, label: "Masyarakat", icon: User },
              { value: "admin" as const, label: "Admin", icon: Shield },
              { value: "stakeholder" as const, label: "Pimpinan", icon: Award },
            ].map(r => (
              <button key={r.value} onClick={() => setRole(r.value)}
                className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                  role === r.value
                    ? "border-[#D47A9A] bg-[#D47A9A]/10 text-[#D47A9A]"
                    : "border-[#F1D8E2] bg-white text-[#64748B] hover:border-[#E8A3B5]")}>
                <r.icon size={18} />
                {r.label}
              </button>
            ))}
          </div>

          <div className="space-y-4 mb-6">
            <FormField label="Email">
              <Input value={email} onChange={setEmail} placeholder="nama@mail.com" type="email" />
            </FormField>
            <FormField label="Password">
              <Input value={password} onChange={setPassword} placeholder="Masukkan password" type="password" />
            </FormField>
          </div>

          <Btn variant="primary" className="w-full" onClick={handleLogin}>Masuk</Btn>
          <p className="text-center text-sm text-[#64748B] mt-4">
            Belum punya akun?{" "}
            <button onClick={() => nav("register")} className="text-[#D47A9A] font-medium hover:underline cursor-pointer">Daftar di sini</button>
          </p>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ nav }: { nav: (p: Page) => void }) {
  const [form, setForm] = useState({ nama: "", nik: "", email: "", phone: "", kecamatan: "", password: "", konfirmasi: "" });
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleRegister = () => {
    if (!form.nama || !form.nik || !form.email) { toast.error("Lengkapi semua data wajib"); return; }
    if (form.password !== form.konfirmasi) { toast.error("Password tidak cocok"); return; }
    toast.success("Registrasi berhasil! Silakan login.");
    setTimeout(() => nav("login"), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF3F6] p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-lg">
        <button onClick={() => nav("landing")} className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#D47A9A] mb-6 cursor-pointer transition-colors">
          <ChevronLeft size={16} /> Kembali
        </button>
        <div className="bg-white rounded-2xl border border-[#F1D8E2] shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.darkRose})` }}>
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Daftar Akun Masyarakat</h2>
              <p className="text-xs text-[#64748B]">AidTrack – Dinas Sosial Kota Bogor</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><FormField label="Nama Lengkap *"><Input value={form.nama} onChange={f("nama")} placeholder="Sesuai KTP" /></FormField></div>
            <FormField label="NIK *"><Input value={form.nik} onChange={f("nik")} placeholder="16 digit NIK" /></FormField>
            <FormField label="No. Telepon"><Input value={form.phone} onChange={f("phone")} placeholder="08xxxxxxxx" /></FormField>
            <div className="col-span-2"><FormField label="Email *"><Input value={form.email} onChange={f("email")} placeholder="nama@mail.com" type="email" /></FormField></div>
            <div className="col-span-2">
              <FormField label="Kecamatan">
                <Select value={form.kecamatan} onChange={f("kecamatan")}
                  options={[{ value: "", label: "Pilih Kecamatan" }, ...KECAMATAN.map(k => ({ value: k, label: k }))]} />
              </FormField>
            </div>
            <FormField label="Password *"><Input value={form.password} onChange={f("password")} placeholder="Min. 8 karakter" type="password" /></FormField>
            <FormField label="Konfirmasi Password"><Input value={form.konfirmasi} onChange={f("konfirmasi")} placeholder="Ulangi password" type="password" /></FormField>
          </div>
          <div className="mt-6 space-y-3">
            <Btn variant="primary" className="w-full" onClick={handleRegister}>Daftar Sekarang</Btn>
            <p className="text-center text-sm text-[#64748B]">
              Sudah punya akun?{" "}
              <button onClick={() => nav("login")} className="text-[#D47A9A] font-medium hover:underline cursor-pointer">Login di sini</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PAGES ──────────────────────────────────────────────────────────────

function AdminDashboard({ db }: { db: DB }) {
  const total = db.pengajuan.length;
  const disalurkan = db.pengajuan.filter(p => p.status === "Disalurkan").length;
  const diproses = db.pengajuan.filter(p => p.status === "Diproses" || p.status === "Menunggu Verifikasi").length;
  const ditolak = db.pengajuan.filter(p => p.status === "Ditolak").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Dashboard Admin</h1>
        <p className="text-sm text-[#64748B] mt-1">Selamat datang kembali. Berikut ringkasan hari ini.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Pengajuan" value={String(total)} icon={ClipboardList} trend={{ value: "8.2%", up: true }} color={C.primary} />
        <KpiCard label="Disalurkan" value={String(disalurkan)} icon={CheckCircle} trend={{ value: "12%", up: true }} color={C.success} />
        <KpiCard label="Dalam Proses" value={String(diproses)} icon={Clock} color="#F59E0B" />
        <KpiCard label="Ditolak" value={String(ditolak)} icon={XCircle} trend={{ value: "2.1%", up: false }} color="#EF4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader title="Distribusi Bantuan Bulanan" />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MONTHLY_DATA}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.primary} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1D8E2" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #F1D8E2", fontSize: 12 }} />
                <Area type="monotone" dataKey="disalurkan" stroke={C.primary} fill="url(#grad1)" strokeWidth={2} name="Disalurkan" />
                <Area type="monotone" dataKey="diproses" stroke={C.soft} fill="transparent" strokeWidth={2} strokeDasharray="4 2" name="Diproses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Status Pengajuan" />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={STATUS_PIE} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value">
                  {STATUS_PIE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #F1D8E2", fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent pengajuan */}
      <Card>
        <CardHeader title="Pengajuan Terbaru" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1D8E2]">
                {["ID", "Nama", "Kecamatan", "Jenis Bantuan", "Tanggal", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-[#64748B] px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {db.pengajuan.slice(0, 8).map(p => (
                <tr key={p.id} className="border-b border-[#F1D8E2] hover:bg-[#FAF3F6] transition-colors">
                  <td className="px-5 py-3 text-xs font-mono text-[#64748B]">{p.id}</td>
                  <td className="px-5 py-3 text-sm font-medium text-[#1F2937]">{p.namaPenerima}</td>
                  <td className="px-5 py-3 text-sm text-[#64748B]">{p.kecamatan}</td>
                  <td className="px-5 py-3 text-sm text-[#64748B]">{p.jenisBantuan}</td>
                  <td className="px-5 py-3 text-xs text-[#64748B]">{fmtDate(p.tanggal)}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function AdminPenerima({ db, setDb }: { db: DB; setDb: (d: DB) => void }) {
  const [search, setSearch] = useState("");
  const [filterKec, setFilterKec] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | null>(null);
  const [selected, setSelected] = useState<Penerima | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Penerima | null>(null);
  const [form, setForm] = useState<Partial<Penerima>>({});

  const filtered = useMemo(() => db.penerima.filter(p =>
    (!search || p.nama.toLowerCase().includes(search.toLowerCase()) || p.nik.includes(search)) &&
    (!filterKec || p.kecamatan === filterKec) &&
    (!filterStatus || p.status === filterStatus)
  ), [db.penerima, search, filterKec, filterStatus]);

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd = () => { setForm({ kecamatan: KECAMATAN[0], kelurahan: KELURAHAN_MAP[KECAMATAN[0]][0], status: "Aktif" }); setModalMode("add"); };
  const openEdit = (p: Penerima) => { setForm({ ...p }); setSelected(p); setModalMode("edit"); };
  const openView = (p: Penerima) => { setSelected(p); setModalMode("view"); };
  const f = (k: string) => (v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    if (!form.nama || !form.nik) { toast.error("NIK dan Nama wajib diisi"); return; }
    if (modalMode === "add") {
      const newP: Penerima = { id: `P${String(db.penerima.length + 1).padStart(3, "0")}`, nik: form.nik!, nama: form.nama!, alamat: form.alamat || "", kecamatan: form.kecamatan || KECAMATAN[0], kelurahan: form.kelurahan || "", phone: form.phone || "", email: form.email || "", status: (form.status as "Aktif") || "Aktif", createdAt: new Date().toISOString().split("T")[0] };
      setDb({ ...db, penerima: [newP, ...db.penerima] });
      toast.success("Penerima berhasil ditambahkan");
    } else {
      setDb({ ...db, penerima: db.penerima.map(p => p.id === selected?.id ? { ...p, ...form } as Penerima : p) });
      toast.success("Data penerima berhasil diperbarui");
    }
    setModalMode(null);
  };

  const handleDelete = (p: Penerima) => {
    setDb({ ...db, penerima: db.penerima.filter(x => x.id !== p.id) });
    toast.success("Data penerima berhasil dihapus");
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Data Penerima</h1>
          <p className="text-sm text-[#64748B] mt-1">{db.penerima.length} total penerima terdaftar</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" size="sm" onClick={() => { downloadCSV(db.penerima as unknown as Record<string, unknown>[], "data-penerima"); toast.success("CSV berhasil diunduh"); }}>
            <Download size={14} /> Export CSV
          </Btn>
          <Btn variant="primary" size="sm" onClick={openAdd}><Plus size={14} /> Tambah Penerima</Btn>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-[#F1D8E2] flex flex-wrap gap-3">
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Cari nama atau NIK..." />
          <Select value={filterKec} onChange={v => { setFilterKec(v); setPage(1); }}
            options={[{ value: "", label: "Semua Kecamatan" }, ...KECAMATAN.map(k => ({ value: k, label: k }))]}
            className="w-44" />
          <Select value={filterStatus} onChange={v => { setFilterStatus(v); setPage(1); }}
            options={[{ value: "", label: "Semua Status" }, { value: "Aktif", label: "Aktif" }, { value: "Nonaktif", label: "Nonaktif" }]}
            className="w-36" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1D8E2]">
                {["NIK", "Nama", "Kecamatan", "Kelurahan", "Status", "Aksi"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-[#64748B] px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(p => (
                <tr key={p.id} className="border-b border-[#F1D8E2] hover:bg-[#FAF3F6] transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-[#64748B]">{p.nik}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#1F2937]">{p.nama}</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{p.kecamatan}</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{p.kelurahan}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(p)} className="p-1.5 rounded-lg hover:bg-[#FAF3F6] text-[#64748B] cursor-pointer transition-colors"><Eye size={14} /></button>
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-[#FAF3F6] text-[#D47A9A] cursor-pointer transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => setConfirmDelete(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 cursor-pointer transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4"><Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} /></div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalMode === "add" || modalMode === "edit"} onClose={() => setModalMode(null)}
        title={modalMode === "add" ? "Tambah Penerima" : "Edit Penerima"}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><FormField label="Nama Lengkap *"><Input value={form.nama || ""} onChange={f("nama")} placeholder="Nama sesuai KTP" /></FormField></div>
          <FormField label="NIK *"><Input value={form.nik || ""} onChange={f("nik")} placeholder="16 digit NIK" /></FormField>
          <FormField label="No. Telepon"><Input value={form.phone || ""} onChange={f("phone")} placeholder="08xxxxxxxx" /></FormField>
          <FormField label="Email"><Input value={form.email || ""} onChange={f("email")} placeholder="nama@mail.com" /></FormField>
          <FormField label="Status">
            <Select value={form.status || "Aktif"} onChange={f("status")} options={[{ value: "Aktif", label: "Aktif" }, { value: "Nonaktif", label: "Nonaktif" }]} />
          </FormField>
          <FormField label="Kecamatan">
            <Select value={form.kecamatan || ""} onChange={v => { f("kecamatan")(v); f("kelurahan")(KELURAHAN_MAP[v]?.[0] || ""); }}
              options={KECAMATAN.map(k => ({ value: k, label: k }))} />
          </FormField>
          <FormField label="Kelurahan">
            <Select value={form.kelurahan || ""} onChange={f("kelurahan")}
              options={(KELURAHAN_MAP[form.kecamatan || ""] || []).map(k => ({ value: k, label: k }))} />
          </FormField>
          <div className="col-span-2"><FormField label="Alamat"><Input value={form.alamat || ""} onChange={f("alamat")} placeholder="Alamat lengkap" /></FormField></div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Btn variant="outline" onClick={() => setModalMode(null)}>Batal</Btn>
          <Btn variant="primary" onClick={handleSave}><Check size={14} /> Simpan</Btn>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={modalMode === "view"} onClose={() => setModalMode(null)} title="Detail Penerima">
        {selected && (
          <div className="space-y-3">
            {[
              { label: "NIK", value: selected.nik },
              { label: "Nama", value: selected.nama },
              { label: "Kecamatan", value: selected.kecamatan },
              { label: "Kelurahan", value: selected.kelurahan },
              { label: "Alamat", value: selected.alamat },
              { label: "Telepon", value: selected.phone },
              { label: "Email", value: selected.email },
              { label: "Status", value: selected.status },
              { label: "Terdaftar", value: fmtDate(selected.createdAt) },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-2 border-b border-[#F1D8E2] last:border-0">
                <span className="text-sm text-[#64748B]">{row.label}</span>
                <span className="text-sm font-medium text-[#1F2937]">{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Konfirmasi Hapus">
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={22} className="text-red-500" />
          </div>
          <p className="text-[#1F2937] font-medium mb-1">Hapus data penerima?</p>
          <p className="text-sm text-[#64748B] mb-6">Data <strong>{confirmDelete?.nama}</strong> akan dihapus permanen dan tidak dapat dikembalikan.</p>
          <div className="flex justify-center gap-3">
            <Btn variant="outline" onClick={() => setConfirmDelete(null)}>Batal</Btn>
            <Btn variant="danger" onClick={() => confirmDelete && handleDelete(confirmDelete)}>Ya, Hapus</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AdminBantuan({ db, setDb }: { db: DB; setDb: (d: DB) => void }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | null>(null);
  const [selected, setSelected] = useState<BantuanProgram | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<BantuanProgram | null>(null);
  const [form, setForm] = useState<Partial<BantuanProgram>>({});
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const filtered = useMemo(() => db.bantuan.filter(b =>
    !search || b.nama.toLowerCase().includes(search.toLowerCase()) || b.jenis.toLowerCase().includes(search.toLowerCase())
  ), [db.bantuan, search]);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd = () => { setForm({ jenis: JENIS_BANTUAN[0], status: "Aktif", kecamatan: KECAMATAN[0] }); setModalMode("add"); };
  const openEdit = (b: BantuanProgram) => { setForm({ ...b }); setSelected(b); setModalMode("edit"); };

  const handleSave = () => {
    if (!form.nama || !form.jenis) { toast.error("Nama dan jenis bantuan wajib diisi"); return; }
    if (modalMode === "add") {
      const newB: BantuanProgram = { id: `B${String(db.bantuan.length + 1).padStart(3, "0")}`, nama: form.nama!, jenis: form.jenis!, nominal: Number(form.nominal) || 0, status: "Aktif", tanggalPenyaluran: form.tanggalPenyaluran || new Date().toISOString().split("T")[0], penerima: Number(form.penerima) || 0, anggaran: (Number(form.nominal) || 0) * (Number(form.penerima) || 0), kecamatan: form.kecamatan || KECAMATAN[0] };
      setDb({ ...db, bantuan: [newB, ...db.bantuan] });
      toast.success("Program bantuan berhasil ditambahkan");
    } else {
      setDb({ ...db, bantuan: db.bantuan.map(b => b.id === selected?.id ? { ...b, ...form, nominal: Number(form.nominal), penerima: Number(form.penerima) } as BantuanProgram : b) });
      toast.success("Program bantuan berhasil diperbarui");
    }
    setModalMode(null);
  };

  const handleDelete = (b: BantuanProgram) => {
    setDb({ ...db, bantuan: db.bantuan.filter(x => x.id !== b.id) });
    toast.success("Program bantuan dihapus"); setConfirmDelete(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Data Bantuan</h1>
          <p className="text-sm text-[#64748B] mt-1">{db.bantuan.length} program bantuan aktif</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" size="sm" onClick={() => { downloadCSV(db.bantuan as unknown as Record<string, unknown>[], "data-bantuan"); toast.success("CSV diunduh"); }}>
            <Download size={14} /> Export
          </Btn>
          <Btn variant="primary" size="sm" onClick={openAdd}><Plus size={14} /> Tambah Program</Btn>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-[#F1D8E2]">
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Cari program bantuan..." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1D8E2]">
                {["Nama Bantuan", "Jenis", "Nominal", "Penerima", "Tgl Penyaluran", "Status", "Aksi"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-[#64748B] px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(b => (
                <tr key={b.id} className="border-b border-[#F1D8E2] hover:bg-[#FAF3F6] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-[#1F2937] max-w-40">{b.nama}</td>
                  <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#FAF3F6] text-[#D47A9A] border border-[#F1D8E2]">{b.jenis}</span></td>
                  <td className="px-4 py-3 text-sm text-[#1F2937] font-mono">{fmtCurrency(b.nominal)}</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{b.penerima.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-[#64748B]">{fmtDate(b.tanggalPenyaluran)}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => { setSelected(b); setModalMode("view"); }} className="p-1.5 rounded-lg hover:bg-[#FAF3F6] text-[#64748B] cursor-pointer"><Eye size={14} /></button>
                      <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-[#FAF3F6] text-[#D47A9A] cursor-pointer"><Edit2 size={14} /></button>
                      <button onClick={() => setConfirmDelete(b)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 cursor-pointer"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4"><Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} /></div>
      </Card>

      <Modal isOpen={modalMode === "add" || modalMode === "edit"} onClose={() => setModalMode(null)}
        title={modalMode === "add" ? "Tambah Program Bantuan" : "Edit Program Bantuan"}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><FormField label="Nama Bantuan *"><Input value={form.nama || ""} onChange={f("nama")} placeholder="Nama program bantuan" /></FormField></div>
          <FormField label="Jenis Bantuan">
            <Select value={form.jenis || ""} onChange={v => { f("jenis")(v); f("nominal")(String(NOMINAL_MAP[v] || "")); }}
              options={JENIS_BANTUAN.map(j => ({ value: j, label: j }))} />
          </FormField>
          <FormField label="Nominal (Rp)"><Input value={String(form.nominal || "")} onChange={f("nominal")} placeholder="Nominal bantuan" type="number" /></FormField>
          <FormField label="Jumlah Penerima"><Input value={String(form.penerima || "")} onChange={f("penerima")} placeholder="Estimasi penerima" type="number" /></FormField>
          <FormField label="Tgl Penyaluran"><Input value={form.tanggalPenyaluran || ""} onChange={f("tanggalPenyaluran")} type="date" /></FormField>
          <FormField label="Kecamatan">
            <Select value={form.kecamatan || ""} onChange={f("kecamatan")} options={KECAMATAN.map(k => ({ value: k, label: k }))} />
          </FormField>
          <FormField label="Status">
            <Select value={form.status || "Aktif"} onChange={f("status")} options={[{ value: "Aktif", label: "Aktif" }, { value: "Nonaktif", label: "Nonaktif" }]} />
          </FormField>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Btn variant="outline" onClick={() => setModalMode(null)}>Batal</Btn>
          <Btn variant="primary" onClick={handleSave}><Check size={14} /> Simpan</Btn>
        </div>
      </Modal>

      <Modal isOpen={modalMode === "view"} onClose={() => setModalMode(null)} title="Detail Program Bantuan">
        {selected && (
          <div className="space-y-2">
            {[
              { label: "Nama", value: selected.nama },
              { label: "Jenis", value: selected.jenis },
              { label: "Nominal", value: fmtCurrency(selected.nominal) },
              { label: "Total Penerima", value: selected.penerima.toLocaleString() + " orang" },
              { label: "Total Anggaran", value: fmtCurrency(selected.anggaran) },
              { label: "Tgl Penyaluran", value: fmtDate(selected.tanggalPenyaluran) },
              { label: "Kecamatan", value: selected.kecamatan },
              { label: "Status", value: selected.status },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-2 border-b border-[#F1D8E2] last:border-0">
                <span className="text-sm text-[#64748B]">{r.label}</span>
                <span className="text-sm font-medium text-[#1F2937]">{r.value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Konfirmasi Hapus">
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-500" /></div>
          <p className="text-[#1F2937] font-medium mb-1">Hapus program bantuan?</p>
          <p className="text-sm text-[#64748B] mb-6"><strong>{confirmDelete?.nama}</strong> akan dihapus permanen.</p>
          <div className="flex justify-center gap-3">
            <Btn variant="outline" onClick={() => setConfirmDelete(null)}>Batal</Btn>
            <Btn variant="danger" onClick={() => confirmDelete && handleDelete(confirmDelete)}>Ya, Hapus</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AdminPengajuan({ db, nav }: { db: DB; nav: (p: Page) => void }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = useMemo(() => db.pengajuan.filter(p =>
    (!search || p.namaPenerima.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search)) &&
    (!filterStatus || p.status === filterStatus) &&
    (!filterJenis || p.jenisBantuan === filterJenis)
  ), [db.pengajuan, search, filterStatus, filterJenis]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Daftar Pengajuan</h1>
          <p className="text-sm text-[#64748B] mt-1">{db.pengajuan.length} total pengajuan</p>
        </div>
        <Btn variant="primary" size="sm" onClick={() => nav("admin-verifikasi")}><CheckSquare size={14} /> Verifikasi</Btn>
      </div>
      <Card>
        <div className="p-4 border-b border-[#F1D8E2] flex flex-wrap gap-3">
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Cari ID atau nama..." />
          <Select value={filterStatus} onChange={v => { setFilterStatus(v); setPage(1); }} className="w-48"
            options={[{ value: "", label: "Semua Status" }, ...STATUS_FLOW.map(s => ({ value: s, label: s }))]} />
          <Select value={filterJenis} onChange={v => { setFilterJenis(v); setPage(1); }} className="w-44"
            options={[{ value: "", label: "Semua Jenis" }, ...JENIS_BANTUAN.map(j => ({ value: j, label: j }))]} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1D8E2]">
                {["ID", "Nama", "NIK", "Kecamatan", "Jenis Bantuan", "Tgl Pengajuan", "Status", "Aksi"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-[#64748B] px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(p => (
                <tr key={p.id} className="border-b border-[#F1D8E2] hover:bg-[#FAF3F6] transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-[#64748B]">{p.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#1F2937]">{p.namaPenerima}</td>
                  <td className="px-4 py-3 text-xs font-mono text-[#64748B]">{p.nik}</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{p.kecamatan}</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{p.jenisBantuan}</td>
                  <td className="px-4 py-3 text-xs text-[#64748B]">{fmtDate(p.tanggal)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <Btn variant="secondary" size="sm" onClick={() => nav("admin-verifikasi")}>
                      <Eye size={12} /> Detail
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4"><Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} /></div>
      </Card>
    </div>
  );
}

function AdminVerifikasi({ db, setDb }: { db: DB; setDb: (d: DB) => void }) {
  const pending = db.pengajuan.filter(p => p.status === "Menunggu Verifikasi");
  const [selected, setSelected] = useState<Pengajuan | null>(null);
  const [catatanRevisi, setCatatanRevisi] = useState("");
  const [showRevisiModal, setShowRevisiModal] = useState(false);

  const updateStatus = (id: string, status: StatusBantuan, msg: string) => {
    setDb({ ...db, pengajuan: db.pengajuan.map(p => p.id === id ? { ...p, status } : p) });
    toast.success(msg); setSelected(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Verifikasi Pengajuan</h1>
        <p className="text-sm text-[#64748B] mt-1">{pending.length} pengajuan menunggu verifikasi</p>
      </div>

      {pending.length === 0 && (
        <Card className="p-10 text-center">
          <CheckCircle size={40} className="mx-auto mb-3 text-emerald-400" />
          <p className="font-medium text-[#1F2937]">Semua pengajuan sudah diverifikasi</p>
          <p className="text-sm text-[#64748B] mt-1">Tidak ada pengajuan yang menunggu verifikasi saat ini.</p>
        </Card>
      )}

      <div className="grid gap-4">
        {pending.map(p => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-[#64748B] bg-[#FAF3F6] px-2 py-0.5 rounded-lg">{p.id}</span>
                  <StatusBadge status={p.status} />
                </div>
                <h3 className="font-semibold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p.namaPenerima}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm text-[#64748B]">
                  <div><span className="font-medium text-[#1F2937] block text-xs">NIK</span>{p.nik}</div>
                  <div><span className="font-medium text-[#1F2937] block text-xs">Kecamatan</span>{p.kecamatan}</div>
                  <div><span className="font-medium text-[#1F2937] block text-xs">Jenis Bantuan</span>{p.jenisBantuan}</div>
                  <div><span className="font-medium text-[#1F2937] block text-xs">Tanggal</span>{fmtDate(p.tanggal)}</div>
                </div>
                <div className="mt-3">
                  <span className="text-xs font-medium text-[#64748B]">Dokumen:</span>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {p.dokumen.map(d => (
                      <span key={d} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check size={10} /> {d}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-2 text-xs text-[#64748B]"><span className="font-medium">Catatan:</span> {p.catatan}</div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Btn variant="primary" size="sm" onClick={() => updateStatus(p.id, "Diproses", `Pengajuan ${p.id} disetujui`)}>
                  <Check size={13} /> Approve
                </Btn>
                <Btn variant="outline" size="sm" onClick={() => { setSelected(p); setShowRevisiModal(true); }}>
                  <RefreshCw size={13} /> Revisi
                </Btn>
                <Btn variant="danger" size="sm" onClick={() => updateStatus(p.id, "Ditolak", `Pengajuan ${p.id} ditolak`)}>
                  <X size={13} /> Tolak
                </Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={showRevisiModal} onClose={() => setShowRevisiModal(false)} title="Minta Revisi Dokumen">
        <FormField label="Catatan Revisi">
          <textarea value={catatanRevisi} onChange={e => setCatatanRevisi(e.target.value)}
            placeholder="Jelaskan dokumen yang perlu diperbaiki..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-[#F1D8E2] focus:outline-none focus:ring-2 focus:ring-[#D47A9A]/30 h-28 resize-none" />
        </FormField>
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="outline" onClick={() => setShowRevisiModal(false)}>Batal</Btn>
          <Btn variant="primary" onClick={() => {
            if (selected) updateStatus(selected.id, "Menunggu Verifikasi", "Permintaan revisi terkirim");
            setShowRevisiModal(false); setCatatanRevisi("");
          }}>Kirim Permintaan Revisi</Btn>
        </div>
      </Modal>
    </div>
  );
}

function AdminTracking({ db, setDb }: { db: DB; setDb: (d: DB) => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Pengajuan | null>(null);

  const filtered = db.pengajuan.filter(p =>
    !search || p.namaPenerima.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search)
  );

  const updateStatus = (id: string, status: StatusBantuan) => {
    setDb({ ...db, pengajuan: db.pengajuan.map(p => p.id === id ? { ...p, status, timeline: makeTimeline(STATUS_FLOW.indexOf(status)) } : p) });
    toast.success(`Status diperbarui ke: ${status}`);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Tracking Bantuan</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <CardHeader title="Daftar Pengajuan" />
          <div className="p-3 border-b border-[#F1D8E2]">
            <SearchInput value={search} onChange={setSearch} placeholder="Cari pengajuan..." />
          </div>
          <div className="divide-y divide-[#F1D8E2] max-h-[60vh] overflow-y-auto">
            {filtered.slice(0, 20).map(p => (
              <button key={p.id} onClick={() => setSelected(p)}
                className={cn("w-full text-left px-4 py-3 hover:bg-[#FAF3F6] transition-colors cursor-pointer",
                  selected?.id === p.id && "bg-[#FAF3F6]")}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-[#64748B]">{p.id}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="text-sm font-medium text-[#1F2937]">{p.namaPenerima}</div>
                <div className="text-xs text-[#64748B] mt-0.5">{p.jenisBantuan} · {p.kecamatan}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          {selected ? (
            <>
              <CardHeader title={`Timeline – ${selected.id}`}
                action={
                  <Select value={selected.status} onChange={v => updateStatus(selected.id, v as StatusBantuan)} className="w-52"
                    options={STATUS_FLOW.map(s => ({ value: s, label: s }))} />
                } />
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div><span className="text-xs text-[#64748B]">Penerima</span><p className="font-semibold text-[#1F2937] mt-0.5">{selected.namaPenerima}</p></div>
                  <div><span className="text-xs text-[#64748B]">Jenis Bantuan</span><p className="font-semibold text-[#1F2937] mt-0.5">{selected.jenisBantuan}</p></div>
                  <div><span className="text-xs text-[#64748B]">Kecamatan</span><p className="font-semibold text-[#1F2937] mt-0.5">{selected.kecamatan}</p></div>
                  <div><span className="text-xs text-[#64748B]">Tgl Pengajuan</span><p className="font-semibold text-[#1F2937] mt-0.5">{fmtDate(selected.tanggal)}</p></div>
                </div>
                <TrackingTimeline timeline={selected.timeline} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-[#64748B]">
              <Activity size={36} className="mb-3 opacity-40" />
              <p className="text-sm">Pilih pengajuan untuk melihat timeline</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function TrackingTimeline({ timeline }: { timeline: TimelineItem[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div className="relative">
      {timeline.map((item, i) => (
        <div key={i} className="flex gap-4 mb-0">
          {/* Connector */}
          <div className="flex flex-col items-center">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all",
              item.selesai
                ? "border-[#D47A9A] bg-[#D47A9A]"
                : item.aktif
                  ? "border-[#D47A9A] bg-white"
                  : "border-[#F1D8E2] bg-white")}>
              {item.selesai
                ? <Check size={14} className="text-white" />
                : item.aktif
                  ? <div className="w-2.5 h-2.5 rounded-full bg-[#D47A9A] animate-pulse" />
                  : <div className="w-2.5 h-2.5 rounded-full bg-[#F1D8E2]" />}
            </div>
            {i < timeline.length - 1 && (
              <div className={cn("w-0.5 flex-1 my-1 min-h-8", item.selesai ? "bg-[#D47A9A]" : "bg-[#F1D8E2]")} />
            )}
          </div>
          {/* Content */}
          <button onClick={() => setExpanded(expanded === i ? null : i)}
            className={cn("flex-1 pb-6 text-left cursor-pointer",
              i === timeline.length - 1 && "pb-0")}>
            <div className="flex items-center justify-between">
              <span className={cn("text-sm font-semibold", item.selesai ? "text-[#1F2937]" : "text-[#64748B]")}>{item.tahap}</span>
              {item.tanggal && <span className="text-xs text-[#64748B]">{fmtDate(item.tanggal)}</span>}
            </div>
            {item.selesai && (
              <div className={cn("overflow-hidden transition-all", expanded === i ? "max-h-24 mt-2" : "max-h-0")}>
                <div className="bg-[#FAF3F6] rounded-xl p-3 text-xs text-[#64748B]">
                  <div><span className="font-medium">Catatan:</span> {item.catatan}</div>
                  <div className="mt-1"><span className="font-medium">Petugas:</span> {item.petugas}</div>
                </div>
              </div>
            )}
            {!item.selesai && <div className="text-xs text-[#64748B] mt-0.5">Menunggu proses sebelumnya</div>}
          </button>
        </div>
      ))}
    </div>
  );
}

function AdminLaporan({ db }: { db: DB }) {
  const [filterBulan, setFilterBulan] = useState("Des");
  const [filterTahun, setFilterTahun] = useState("2025");
  const [filterKec, setFilterKec] = useState("");
  const [filterJenis, setFilterJenis] = useState("");

  const filteredData = useMemo(() => {
    return MONTHLY_DATA.filter(d => !filterBulan || d.bulan === filterBulan);
  }, [filterBulan]);

  const summary = {
    totalDisalurkan: db.pengajuan.filter(p => p.status === "Disalurkan").length,
    totalPenerima: db.penerima.filter(p => p.status === "Aktif").length,
    totalAnggaran: db.bantuan.reduce((s, b) => s + b.anggaran, 0),
    tingkatKeberhasilan: "87.3%",
  };

  const handleDownload = (format: string) => {
    if (format === "csv") {
      downloadCSV(db.pengajuan as unknown as Record<string, unknown>[], `laporan-bantuan-${filterBulan}-${filterTahun}`);
      toast.success("File CSV berhasil diunduh");
    } else {
      toast.success(`File ${format.toUpperCase()} sedang diproses dan akan segera diunduh`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Laporan</h1>
          <p className="text-sm text-[#64748B] mt-1">Laporan distribusi bantuan sosial Kota Bogor</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" size="sm" onClick={() => handleDownload("pdf")}><FileDown size={14} /> PDF</Btn>
          <Btn variant="outline" size="sm" onClick={() => handleDownload("xlsx")}><Download size={14} /> Excel</Btn>
          <Btn variant="primary" size="sm" onClick={() => handleDownload("csv")}><Download size={14} /> CSV</Btn>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <SlidersHorizontal size={15} className="text-[#64748B]" />
          <Select value={filterBulan} onChange={setFilterBulan} className="w-32"
            options={MONTHLY_DATA.map(d => ({ value: d.bulan, label: d.bulan }))} />
          <Select value={filterTahun} onChange={setFilterTahun} className="w-28"
            options={[{ value: "2025", label: "2025" }, { value: "2024", label: "2024" }]} />
          <Select value={filterKec} onChange={setFilterKec} className="w-44"
            options={[{ value: "", label: "Semua Kecamatan" }, ...KECAMATAN.map(k => ({ value: k, label: k }))]} />
          <Select value={filterJenis} onChange={setFilterJenis} className="w-44"
            options={[{ value: "", label: "Semua Jenis" }, ...JENIS_BANTUAN.map(j => ({ value: j, label: j }))]} />
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Disalurkan" value={String(summary.totalDisalurkan)} icon={CheckCircle} color={C.success} />
        <KpiCard label="Total Penerima Aktif" value={String(summary.totalPenerima)} icon={Users} color={C.primary} />
        <KpiCard label="Total Anggaran" value={`Rp ${(summary.totalAnggaran / 1e9).toFixed(1)}M`} icon={Target} color={C.darkRose} />
        <KpiCard label="Tingkat Keberhasilan" value={summary.tingkatKeberhasilan} icon={Award} color="#F59E0B" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader title={`Distribusi Bulan ${filterBulan} ${filterTahun}`} />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1D8E2" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #F1D8E2", fontSize: 12 }} />
                <Bar dataKey="disalurkan" fill={C.primary} radius={[6, 6, 0, 0]} name="Disalurkan" />
                <Bar dataKey="diproses" fill={C.soft} radius={[6, 6, 0, 0]} name="Diproses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Program Bantuan" />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={PROGRAM_DONUT} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {PROGRAM_DONUT.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #F1D8E2", fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader title="Ringkasan Pengajuan" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1D8E2]">
                {["ID", "Nama", "Jenis", "Kecamatan", "Tanggal", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-[#64748B] px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {db.pengajuan.slice(0, 10).map(p => (
                <tr key={p.id} className="border-b border-[#F1D8E2] hover:bg-[#FAF3F6] transition-colors">
                  <td className="px-4 py-2.5 text-xs font-mono text-[#64748B]">{p.id}</td>
                  <td className="px-4 py-2.5 text-sm text-[#1F2937]">{p.namaPenerima}</td>
                  <td className="px-4 py-2.5 text-sm text-[#64748B]">{p.jenisBantuan}</td>
                  <td className="px-4 py-2.5 text-sm text-[#64748B]">{p.kecamatan}</td>
                  <td className="px-4 py-2.5 text-xs text-[#64748B]">{fmtDate(p.tanggal)}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function AdminNotifikasi({ db, setDb }: { db: DB; setDb: (d: DB) => void }) {
  const markAll = () => {
    setDb({ ...db, notifikasi: db.notifikasi.map(n => ({ ...n, dibaca: true })) });
    toast.success("Semua notifikasi ditandai dibaca");
  };
  const notifIcons: Record<string, React.ElementType> = {
    success: CheckCircle, info: Info, warning: AlertTriangle, error: XCircle
  };
  const notifColors: Record<string, string> = {
    success: "#10B981", info: "#3B82F6", warning: "#F59E0B", error: "#EF4444"
  };
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Notifikasi</h1>
          <p className="text-sm text-[#64748B] mt-1">{db.notifikasi.filter(n => !n.dibaca).length} belum dibaca</p>
        </div>
        <Btn variant="outline" size="sm" onClick={markAll}><Check size={14} /> Tandai Semua Dibaca</Btn>
      </div>
      <div className="space-y-3">
        {db.notifikasi.map(n => {
          const Icon = notifIcons[n.tipe];
          const color = notifColors[n.tipe];
          return (
            <Card key={n.id} className={cn("p-4 flex gap-4 cursor-pointer transition-all hover:shadow-md", !n.dibaca && "border-[#D47A9A]")}
              onClick={() => setDb({ ...db, notifikasi: db.notifikasi.map(x => x.id === n.id ? { ...x, dibaca: true } : x) })}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "20" }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#1F2937]">{n.judul}</span>
                  {!n.dibaca && <span className="w-2 h-2 rounded-full bg-[#D47A9A]" />}
                </div>
                <p className="text-sm text-[#64748B] mt-0.5 leading-relaxed">{n.pesan}</p>
                <span className="text-xs text-[#64748B] mt-1 block">{fmtDate(n.tanggal)}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function AdminPengaturan() {
  const [form, setForm] = useState({ nama: "Ulan", email: "admin@dinsos.bogorkota.go.id", jabatan: "Koordinator Bansos", phone: "0811234567", password: "" });
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pengaturan Akun</h1>
      <Card className="p-6">
        <h3 className="font-semibold text-[#1F2937] mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Profil Admin</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold" style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.darkRose})` }}>A</div>
            <div>
              <Btn variant="secondary" size="sm">Upload Foto</Btn>
              <p className="text-xs text-[#64748B] mt-1">JPG/PNG, maks 2MB</p>
            </div>
          </div>
          <FormField label="Nama Lengkap"><Input value={form.nama} onChange={f("nama")} /></FormField>
          <FormField label="Jabatan"><Input value={form.jabatan} onChange={f("jabatan")} /></FormField>
          <FormField label="Email"><Input value={form.email} onChange={f("email")} type="email" /></FormField>
          <FormField label="Telepon"><Input value={form.phone} onChange={f("phone")} /></FormField>
          <div className="col-span-2"><FormField label="Password Baru (kosongkan jika tidak ingin mengubah)"><Input value={form.password} onChange={f("password")} type="password" placeholder="Min 8 karakter" /></FormField></div>
        </div>
        <div className="mt-5">
          <Btn variant="primary" onClick={() => toast.success("Pengaturan berhasil disimpan")}><Check size={14} /> Simpan Perubahan</Btn>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="font-semibold text-[#1F2937] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Preferensi Notifikasi</h3>
        {["Notifikasi pengajuan baru", "Notifikasi status berubah", "Notifikasi laporan harian", "Notifikasi sistem"].map(item => (
          <div key={item} className="flex items-center justify-between py-3 border-b border-[#F1D8E2] last:border-0">
            <span className="text-sm text-[#1F2937]">{item}</span>
            <button className="w-10 h-6 rounded-full bg-[#D47A9A] relative transition-all cursor-pointer">
              <div className="w-4 h-4 rounded-full bg-white absolute right-1 top-1 shadow" />
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── STAKEHOLDER PAGES ────────────────────────────────────────────────────────

function StakeholderDashboard({ db, nav }: { db: DB; nav: (p: Page) => void }) {
  const [filterBulan, setFilterBulan] = useState("");
  const [filterKec, setFilterKec] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [kpiModal, setKpiModal] = useState<string | null>(null);

  const totalDisalurkan = db.pengajuan.filter(p => p.status === "Disalurkan").length + 1238;
  const totalPenerima = db.penerima.length + 2747;
  const diproses = db.pengajuan.filter(p => p.status === "Diproses").length + 304;
  const ditolak = db.pengajuan.filter(p => p.status === "Ditolak").length + 88;

  const kpis = [
    { id: "disalurkan", label: "Total Bantuan Disalurkan", value: totalDisalurkan.toLocaleString(), sub: "Tahun 2025", icon: CheckCircle, trend: { value: "12.3%", up: true }, color: C.success },
    { id: "penerima", label: "Total Penerima", value: totalPenerima.toLocaleString(), sub: "Penerima aktif", icon: Users, trend: { value: "8.5%", up: true }, color: C.primary },
    { id: "diproses", label: "Dalam Proses", value: String(diproses), sub: "Menunggu verifikasi", icon: Clock, color: "#F59E0B" },
    { id: "ditolak", label: "Bantuan Ditolak", value: String(ditolak), sub: "Perlu evaluasi", icon: XCircle, trend: { value: "2.1%", up: false }, color: "#EF4444" },
    { id: "akurasi", label: "Akurasi Data", value: "94.7%", sub: "+1.2% dari bulan lalu", icon: Target, trend: { value: "1.2%", up: true }, color: C.darkRose },
    { id: "keberhasilan", label: "Tingkat Keberhasilan", value: "87.3%", sub: "Semua program", icon: Award, trend: { value: "3.4%", up: true }, color: "#8B5CF6" },
  ];

  const insightItems = [
    { icon: MapPin, color: C.darkRose, title: "Penerima Terbanyak", value: "Bogor Barat – 720 penerima" },
    { icon: Star, color: "#F59E0B", title: "Program Paling Aktif", value: "PKH – 480 penerima aktif" },
    { icon: TrendingUp, color: C.success, title: "Distribusi Bulan Ini", value: "489 bantuan berhasil disalurkan" },
    { icon: AlertTriangle, color: "#EF4444", title: "Belum Diverifikasi", value: `${db.pengajuan.filter(p => p.status === "Menunggu Verifikasi").length} pengajuan menunggu` },
    { icon: RefreshCw, color: "#8B5CF6", title: "Perlu Evaluasi", value: "BLT Dana Desa – target 80% belum tercapai" },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Executive Dashboard</h1>
          <p className="text-sm text-[#64748B] mt-1">Monitoring distribusi bantuan sosial Kota Bogor secara real-time</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filterBulan} onChange={setFilterBulan} className="w-32"
            options={[{ value: "", label: "Semua Bulan" }, ...MONTHLY_DATA.map(d => ({ value: d.bulan, label: d.bulan }))]} />
          <Select value={filterKec} onChange={setFilterKec} className="w-44"
            options={[{ value: "", label: "Semua Kecamatan" }, ...KECAMATAN.map(k => ({ value: k, label: k }))]} />
          <Select value={filterJenis} onChange={setFilterJenis} className="w-44"
            options={[{ value: "", label: "Semua Jenis" }, ...JENIS_BANTUAN.map(j => ({ value: j, label: j }))]} />
          <Btn variant="outline" size="sm" onClick={() => toast.success("Dashboard diperbarui")}>
            <RefreshCw size={13} /> Refresh
          </Btn>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map(k => (
          <KpiCard key={k.id} label={k.label} value={k.value} sub={k.sub}
            icon={k.icon} trend={k.trend} color={k.color}
            onClick={() => setKpiModal(k.id)} />
        ))}
      </div>

      {/* KPI Drill-down Modal */}
      <Modal isOpen={!!kpiModal} onClose={() => setKpiModal(null)} title={kpis.find(k => k.id === kpiModal)?.label || ""} wide>
        <div className="text-center py-4">
          <div className="text-4xl font-extrabold text-[#D47A9A] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {kpis.find(k => k.id === kpiModal)?.value}
          </div>
          <p className="text-[#64748B] text-sm mb-6">{kpis.find(k => k.id === kpiModal)?.sub}</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_DATA}>
              <defs>
                <linearGradient id="drillGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.primary} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1D8E2" />
              <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #F1D8E2", fontSize: 12 }} />
              <Area type="monotone" dataKey="disalurkan" stroke={C.primary} fill="url(#drillGrad)" strokeWidth={2} name="Disalurkan" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Modal>

      {/* Main Charts */}
      <Card>
        <CardHeader title="Tren Distribusi Bantuan Bulanan 2025" />
        <div className="p-5">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={MONTHLY_DATA}>
              <defs>
                <linearGradient id="areaGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.darkRose} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={C.darkRose} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.soft} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={C.soft} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1D8E2" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #F1D8E2", fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="disalurkan" stroke={C.darkRose} fill="url(#areaGrad1)" strokeWidth={2.5} name="Disalurkan" />
              <Area type="monotone" dataKey="diproses" stroke={C.soft} fill="url(#areaGrad2)" strokeWidth={2} name="Diproses" />
              <Area type="monotone" dataKey="ditolak" stroke={C.slate} fill="transparent" strokeWidth={1.5} strokeDasharray="4 2" name="Ditolak" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Kecamatan Bar Chart */}
        <Card>
          <CardHeader title="Distribusi per Kecamatan" action={<Btn variant="ghost" size="sm" onClick={() => nav("stakeholder-wilayah")}><ArrowUpRight size={13} /> Detail</Btn>} />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={KECAMATAN_CHART} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1D8E2" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} width={70} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #F1D8E2", fontSize: 12 }} />
                <Bar dataKey="disalurkan" fill={C.primary} radius={[0, 6, 6, 0]} name="Disalurkan" />
                <Bar dataKey="ditolak" fill={C.soft} radius={[0, 6, 6, 0]} name="Ditolak" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status + Program pie/donut */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="Status Bantuan" />
            <div className="p-5">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={STATUS_PIE} cx="50%" cy="50%" outerRadius={70} paddingAngle={2} dataKey="value">
                    {STATUS_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #F1D8E2", fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Insight Panel + Program Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader title="Panel Insight" />
          <div className="p-5 space-y-3">
            {insightItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF3F6]">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: item.color + "20" }}>
                  <item.icon size={16} style={{ color: item.color }} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#64748B]">{item.title}</div>
                  <div className="text-sm text-[#1F2937] font-medium mt-0.5">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Komposisi Program" />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={PROGRAM_DONUT} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {PROGRAM_DONUT.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ borderRadius: 12, border: "1px solid #F1D8E2", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {PROGRAM_DONUT.map(p => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-[#64748B]">{p.name}</span>
                  </div>
                  <span className="font-semibold text-[#1F2937]">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StakeholderMonitoring({ db }: { db: DB }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Monitoring Distribusi</h1>
        <p className="text-sm text-[#64748B] mt-1">Pemantauan real-time distribusi bantuan seluruh kecamatan</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {KECAMATAN.map((kec, i) => {
          const total = KECAMATAN_CHART[i];
          const pct = Math.round((total.disalurkan / total.penerima) * 100);
          return (
            <Card key={kec} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin size={15} style={{ color: C.primary }} />
                  <span className="font-semibold text-sm text-[#1F2937]">{kec}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: C.primary }}>{pct}%</span>
              </div>
              <div className="h-2 bg-[#F1D8E2] rounded-full mb-3">
                <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: C.primary }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><div className="text-xs text-[#64748B]">Penerima</div><div className="text-sm font-bold text-[#1F2937]">{total.penerima}</div></div>
                <div><div className="text-xs text-[#64748B]">Disalurkan</div><div className="text-sm font-bold text-[#D47A9A]">{total.disalurkan}</div></div>
                <div><div className="text-xs text-[#64748B]">Ditolak</div><div className="text-sm font-bold text-red-500">{total.ditolak}</div></div>
              </div>
            </Card>
          );
        })}
      </div>
      <Card>
        <CardHeader title="Distribusi Bulanan per Kecamatan" />
        <div className="p-5">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={KECAMATAN_CHART}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1D8E2" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #F1D8E2", fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="penerima" fill={C.soft} radius={[4, 4, 0, 0]} name="Total Penerima" />
              <Bar dataKey="disalurkan" fill={C.primary} radius={[4, 4, 0, 0]} name="Disalurkan" />
              <Bar dataKey="ditolak" fill={C.slate} radius={[4, 4, 0, 0]} name="Ditolak" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function StakeholderStatistik() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Statistik Real-Time</h1>
        <p className="text-sm text-[#64748B] mt-1">Analisis statistik komprehensif distribusi bantuan sosial</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader title="Tren 12 Bulan" />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={MONTHLY_DATA}>
                <defs>
                  <linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.primary} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1D8E2" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #F1D8E2", fontSize: 12 }} />
                <Area type="monotone" dataKey="disalurkan" stroke={C.primary} fill="url(#sg1)" strokeWidth={2} name="Disalurkan" />
                <Area type="monotone" dataKey="ditolak" stroke="#EF4444" fill="transparent" strokeWidth={1.5} strokeDasharray="3 2" name="Ditolak" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Komposisi Status" />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={STATUS_PIE} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {STATUS_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #F1D8E2", fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card>
        <CardHeader title="Ringkasan Statistik Tahunan" />
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Total Pengajuan", value: "2.070", color: C.primary },
              { label: "Berhasil Disalurkan", value: "1.248", color: C.success },
              { label: "Dalam Antrian", value: "724", color: "#F59E0B" },
              { label: "Ditolak", value: "98", color: "#EF4444" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold mb-1" style={{ color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
                <div className="text-sm text-[#64748B]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function StakeholderWilayah() {
  const [selected, setSelected] = useState(KECAMATAN[0]);
  const idx = KECAMATAN.indexOf(selected);
  const data = KECAMATAN_CHART[idx];
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Analisis Wilayah</h1>
        <p className="text-sm text-[#64748B] mt-1">Detail distribusi bantuan per kecamatan</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {KECAMATAN.map(k => (
          <button key={k} onClick={() => setSelected(k)}
            className={cn("px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer",
              selected === k ? "bg-[#D47A9A] text-white border-[#D47A9A]" : "bg-white text-[#64748B] border-[#F1D8E2] hover:border-[#E8A3B5]")}>
            {k}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Penerima" value={String(data.penerima)} icon={Users} color={C.primary} />
        <KpiCard label="Disalurkan" value={String(data.disalurkan)} icon={CheckCircle} color={C.success} />
        <KpiCard label="Ditolak" value={String(data.ditolak)} icon={XCircle} color="#EF4444" />
        <KpiCard label="Realisasi" value={`${Math.round(data.disalurkan / data.penerima * 100)}%`} icon={Target} color={C.darkRose} />
      </div>
      <Card>
        <CardHeader title={`Detail Kelurahan – ${selected}`} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1D8E2]">
                {["Kelurahan", "Penerima", "Disalurkan", "Ditolak", "Realisasi"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-[#64748B] px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(KELURAHAN_MAP[selected] || []).map((kel, i) => {
                const p = Math.round(data.penerima / 5) + i * 10;
                const d = Math.round(p * 0.8);
                const t = Math.round(p * 0.07);
                return (
                  <tr key={kel} className="border-b border-[#F1D8E2] hover:bg-[#FAF3F6]">
                    <td className="px-4 py-3 text-sm text-[#1F2937]">{kel}</td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{p}</td>
                    <td className="px-4 py-3 text-sm text-[#D47A9A] font-medium">{d}</td>
                    <td className="px-4 py-3 text-sm text-red-500">{t}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#F1D8E2] rounded-full">
                          <div className="h-1.5 rounded-full" style={{ width: `${Math.round(d / p * 100)}%`, backgroundColor: C.primary }} />
                        </div>
                        <span className="text-xs text-[#64748B]">{Math.round(d / p * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StakeholderProgram({ db }: { db: DB }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Monitoring Program Bantuan</h1>
          <p className="text-sm text-[#64748B] mt-1">{db.bantuan.length} program aktif berjalan</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" size="sm" onClick={() => toast.success("Laporan PDF diunduh")}><FileDown size={14} /> PDF</Btn>
          <Btn variant="primary" size="sm" onClick={() => { downloadCSV(db.bantuan as unknown as Record<string, unknown>[], "monitoring-program"); toast.success("Excel diunduh"); }}><Download size={14} /> Excel</Btn>
        </div>
      </div>
      <div className="grid gap-4">
        {db.bantuan.map(b => {
          const pct = Math.round((b.penerima / (b.penerima + 50)) * 100);
          return (
            <Card key={b.id} className="p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{b.nama}</span>
                    <StatusBadge status={b.status} />
                    <span className="px-2 py-0.5 rounded-lg text-xs bg-[#FAF3F6] text-[#D47A9A] border border-[#F1D8E2]">{b.jenis}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-[#64748B]">
                    <span className="flex items-center gap-1"><Users size={13} /> {b.penerima.toLocaleString()} penerima</span>
                    <span className="flex items-center gap-1"><Target size={13} /> {fmtCurrency(b.nominal)}/orang</span>
                    <span className="flex items-center gap-1"><Calendar size={13} /> Penyaluran: {fmtDate(b.tanggalPenyaluran)}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-[#64748B] mb-1">
                      <span>Progres Realisasi</span><span className="font-medium text-[#D47A9A]">{pct}%</span>
                    </div>
                    <div className="h-2 bg-[#F1D8E2] rounded-full">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: C.primary }} />
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-[#64748B]">Total Anggaran</div>
                  <div className="text-lg font-bold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{fmtCurrency(b.anggaran)}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── CITIZEN PAGES ────────────────────────────────────────────────────────────

function CitizenDashboard({ nav, db }: { nav: (p: Page) => void; db: DB }) {
  const myPengajuan = db.pengajuan.slice(0, 3);
  const unread = db.notifikasi.filter(n => !n.dibaca).length;

  return (
    <div className="p-4 space-y-5">
      {/* Welcome */}
      <div className="rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${C.darkRose}, ${C.primary})` }}>
        <div className="text-white/80 text-sm mb-1">Selamat datang kembali,</div>
        <div className="text-xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Siti Rahayu</div>
        <div className="text-white/70 text-xs mt-1">NIK: 3272058901234567</div>
        {unread > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2 cursor-pointer" onClick={() => nav("citizen-notifikasi")}>
            <Bell size={14} />
            <span className="text-xs font-medium">{unread} notifikasi baru</span>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => nav("citizen-pengajuan")} className="bg-white rounded-2xl p-4 border border-[#F1D8E2] flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-all active:scale-95">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.primary + "20" }}>
            <Send size={18} style={{ color: C.primary }} />
          </div>
          <span className="text-xs font-medium text-[#1F2937]">Ajukan Bantuan</span>
        </button>
        <button onClick={() => nav("citizen-tracking")} className="bg-white rounded-2xl p-4 border border-[#F1D8E2] flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-all active:scale-95">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.darkRose + "20" }}>
            <Activity size={18} style={{ color: C.darkRose }} />
          </div>
          <span className="text-xs font-medium text-[#1F2937]">Tracking</span>
        </button>
        <button onClick={() => nav("citizen-riwayat")} className="bg-white rounded-2xl p-4 border border-[#F1D8E2] flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-all active:scale-95">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.success + "20" }}>
            <History size={18} style={{ color: C.success }} />
          </div>
          <span className="text-xs font-medium text-[#1F2937]">Riwayat</span>
        </button>
        <button onClick={() => nav("citizen-notifikasi")} className="bg-white rounded-2xl p-4 border border-[#F1D8E2] flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-all active:scale-95 relative">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F59E0B20" }}>
            <Bell size={18} style={{ color: "#F59E0B" }} />
          </div>
          {unread > 0 && <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#D47A9A] text-white text-[10px] flex items-center justify-center">{unread}</span>}
          <span className="text-xs font-medium text-[#1F2937]">Notifikasi</span>
        </button>
      </div>

      {/* My bantuan */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Bantuan Saya</h3>
          <button onClick={() => nav("citizen-riwayat")} className="text-xs text-[#D47A9A] font-medium cursor-pointer">Lihat Semua</button>
        </div>
        <div className="space-y-3">
          {myPengajuan.map(p => (
            <div key={p.id} className="bg-white rounded-2xl p-4 border border-[#F1D8E2]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-sm text-[#1F2937]">{p.jenisBantuan}</div>
                  <div className="text-xs text-[#64748B] mt-0.5">{p.id} · {fmtDate(p.tanggal)}</div>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <button onClick={() => nav("citizen-tracking")} className="mt-3 text-xs text-[#D47A9A] font-medium flex items-center gap-1 cursor-pointer">
                <Activity size={11} /> Lihat Timeline
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CitizenTracking({ db }: { db: DB }) {
  const [selectedId, setSelectedId] = useState(db.pengajuan[0]?.id || "");
  const pengajuan = db.pengajuan.find(p => p.id === selectedId);

  return (
    <div className="p-4 space-y-5">
      <h2 className="text-xl font-bold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Tracking Bantuan</h2>

      {/* Select pengajuan */}
      <div>
        <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Pilih Pengajuan</label>
        <Select value={selectedId} onChange={setSelectedId}
          options={db.pengajuan.slice(0, 10).map(p => ({ value: p.id, label: `${p.id} – ${p.jenisBantuan}` }))} />
      </div>

      {pengajuan && (
        <>
          {/* Info card */}
          <div className="bg-white rounded-2xl p-4 border border-[#F1D8E2]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{pengajuan.jenisBantuan}</div>
                <div className="text-xs text-[#64748B] mt-0.5">Pengajuan {pengajuan.id}</div>
              </div>
              <StatusBadge status={pengajuan.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-[#64748B]">Tanggal Pengajuan</span><br /><span className="font-medium text-[#1F2937]">{fmtDate(pengajuan.tanggal)}</span></div>
              <div><span className="text-[#64748B]">Kecamatan</span><br /><span className="font-medium text-[#1F2937]">{pengajuan.kecamatan}</span></div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl p-5 border border-[#F1D8E2]">
            <h3 className="font-semibold text-[#1F2937] mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Status Proses</h3>
            <TrackingTimeline timeline={pengajuan.timeline} />
          </div>

          {/* Dokumen */}
          <div className="bg-white rounded-2xl p-4 border border-[#F1D8E2]">
            <h3 className="font-semibold text-sm text-[#1F2937] mb-3">Dokumen Pengajuan</h3>
            <div className="space-y-2">
              {pengajuan.dokumen.map(d => (
                <div key={d} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF3F6]">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-[#D47A9A]" />
                    <span className="text-sm text-[#1F2937]">{d}</span>
                  </div>
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><Check size={11} /> Terverifikasi</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CitizenPengajuan({ db, setDb }: { db: DB; setDb: (d: DB) => void }) {
  const [form, setForm] = useState({
    nama: "Siti Rahayu", nik: "3272058901234567", alamat: "", kecamatan: "",
    kelurahan: "", jenisBantuan: "", keterangan: ""
  });
  const [files, setFiles] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleFile = (doc: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFiles(prev => ({ ...prev, [doc]: file.name }));
  };

  const handleSubmit = (isDraft: boolean) => {
    if (!isDraft && (!form.kecamatan || !form.jenisBantuan)) {
      toast.error("Lengkapi kecamatan dan jenis bantuan"); return;
    }
    const newP: Pengajuan = {
      id: `AJU${String(db.pengajuan.length + 1).padStart(4, "0")}`,
      penerimaId: "P999", namaPenerima: form.nama, nik: form.nik,
      kecamatan: form.kecamatan, kelurahan: form.kelurahan,
      jenisBantuan: form.jenisBantuan, status: isDraft ? "Menunggu Verifikasi" : "Menunggu Verifikasi",
      tanggal: new Date().toISOString().split("T")[0],
      catatan: form.keterangan, petugas: "-", dokumen: Object.keys(files),
      timeline: makeTimeline(0)
    };
    setDb({ ...db, pengajuan: [newP, ...db.pengajuan] });
    toast.success(isDraft ? "Draft tersimpan" : "Pengajuan berhasil dikirim!");
    if (!isDraft) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: C.primary + "20" }}>
          <CheckCircle size={40} style={{ color: C.primary }} />
        </div>
        <h2 className="text-xl font-bold text-[#1F2937] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pengajuan Terkirim!</h2>
        <p className="text-sm text-[#64748B] mb-6">Pengajuan bantuan Anda telah diterima dan akan diverifikasi oleh petugas.</p>
        <Btn variant="primary" onClick={() => setSubmitted(false)}>Buat Pengajuan Baru</Btn>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pengajuan Bantuan</h2>

      <div className="bg-white rounded-2xl p-4 border border-[#F1D8E2] space-y-4">
        <h3 className="font-semibold text-sm text-[#1F2937]">Data Pemohon</h3>
        <FormField label="Nama Lengkap"><Input value={form.nama} onChange={f("nama")} placeholder="Sesuai KTP" /></FormField>
        <FormField label="NIK"><Input value={form.nik} onChange={f("nik")} placeholder="16 digit NIK" /></FormField>
        <FormField label="Alamat"><Input value={form.alamat} onChange={f("alamat")} placeholder="Alamat lengkap" /></FormField>
        <FormField label="Kecamatan">
          <Select value={form.kecamatan} onChange={v => { f("kecamatan")(v); f("kelurahan")(KELURAHAN_MAP[v]?.[0] || ""); }}
            options={[{ value: "", label: "Pilih Kecamatan" }, ...KECAMATAN.map(k => ({ value: k, label: k }))]} />
        </FormField>
        {form.kecamatan && (
          <FormField label="Kelurahan">
            <Select value={form.kelurahan} onChange={f("kelurahan")}
              options={(KELURAHAN_MAP[form.kecamatan] || []).map(k => ({ value: k, label: k }))} />
          </FormField>
        )}
        <FormField label="Jenis Bantuan">
          <Select value={form.jenisBantuan} onChange={f("jenisBantuan")}
            options={[{ value: "", label: "Pilih Jenis Bantuan" }, ...JENIS_BANTUAN.map(j => ({ value: j, label: j }))]} />
        </FormField>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-[#F1D8E2] space-y-4">
        <h3 className="font-semibold text-sm text-[#1F2937]">Upload Dokumen</h3>
        {["KTP", "KK", "Surat Keterangan Tidak Mampu"].map(doc => (
          <div key={doc}>
            <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{doc}</label>
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-[#F1D8E2] hover:border-[#D47A9A] cursor-pointer transition-colors bg-[#FAF3F6]">
              <Upload size={16} className="text-[#D47A9A]" />
              <span className="text-sm text-[#64748B]">{files[doc] || `Upload ${doc}`}</span>
              <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => handleFile(doc, e)} />
            </label>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-[#F1D8E2]">
        <FormField label="Keterangan Tambahan">
          <textarea value={form.keterangan} onChange={e => f("keterangan")(e.target.value)}
            placeholder="Jelaskan kondisi dan alasan pengajuan bantuan..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-[#F1D8E2] focus:outline-none focus:ring-2 focus:ring-[#D47A9A]/30 h-24 resize-none" />
        </FormField>
      </div>

      <div className="flex gap-3">
        <Btn variant="outline" className="flex-1" onClick={() => handleSubmit(true)}><FileText size={14} /> Simpan Draft</Btn>
        <Btn variant="primary" className="flex-1" onClick={() => handleSubmit(false)}><Send size={14} /> Kirim Pengajuan</Btn>
      </div>
    </div>
  );
}

function CitizenRiwayat({ db, nav }: { db: DB; nav: (p: Page) => void }) {
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  const filtered = db.pengajuan.filter(p =>
    (!filterStatus || p.status === filterStatus) &&
    (!search || p.jenisBantuan.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search))
  );

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Riwayat Bantuan</h2>
      <div className="space-y-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari bantuan..." />
        <Select value={filterStatus} onChange={setFilterStatus}
          options={[{ value: "", label: "Semua Status" }, ...STATUS_FLOW.map(s => ({ value: s, label: s }))]} />
      </div>
      <div className="space-y-3">
        {filtered.slice(0, 20).map(p => (
          <div key={p.id} className="bg-white rounded-2xl p-4 border border-[#F1D8E2]">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-sm text-[#1F2937]">{p.jenisBantuan}</div>
                <div className="text-xs text-[#64748B] mt-0.5">{p.id} · {fmtDate(p.tanggal)}</div>
                <div className="text-xs text-[#64748B] mt-0.5">{p.kecamatan}, {p.kelurahan}</div>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div className="mt-3 flex gap-2">
              <Btn variant="secondary" size="sm" onClick={() => nav("citizen-tracking")}>
                <Activity size={12} /> Timeline
              </Btn>
              {p.status === "Disalurkan" && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle size={12} /> Bantuan diterima
                </span>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-[#64748B]">
            <History size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada riwayat bantuan</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CitizenNotifikasi({ db, setDb, nav }: { db: DB; setDb: (d: DB) => void; nav: (p: Page) => void }) {
  const notifColors: Record<string, string> = { success: "#10B981", info: "#3B82F6", warning: "#F59E0B", error: "#EF4444" };
  const notifIcons: Record<string, React.ElementType> = { success: CheckCircle, info: Info, warning: AlertTriangle, error: XCircle };
  const markAll = () => {
    setDb({ ...db, notifikasi: db.notifikasi.map(n => ({ ...n, dibaca: true })) });
    toast.success("Semua notifikasi dibaca");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Notifikasi</h2>
        <button onClick={markAll} className="text-xs text-[#D47A9A] font-medium cursor-pointer">Tandai Semua Dibaca</button>
      </div>
      <div className="space-y-3">
        {db.notifikasi.map(n => {
          const Icon = notifIcons[n.tipe];
          const color = notifColors[n.tipe];
          return (
            <div key={n.id}
              className={cn("bg-white rounded-2xl p-4 border cursor-pointer transition-all hover:shadow-md", !n.dibaca ? "border-[#D47A9A]" : "border-[#F1D8E2]")}
              onClick={() => {
                setDb({ ...db, notifikasi: db.notifikasi.map(x => x.id === n.id ? { ...x, dibaca: true } : x) });
                if (n.pengajuanId) nav("citizen-tracking");
              }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "20" }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#1F2937]">{n.judul}</span>
                    {!n.dibaca && <div className="w-2 h-2 rounded-full bg-[#D47A9A] shrink-0" />}
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{n.pesan}</p>
                  <span className="text-xs text-[#64748B] mt-1 block">{fmtDate(n.tanggal)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CitizenProfil({ nav, db, setDb }: { nav: (p: Page) => void; db: DB; setDb: (d: DB) => void }) {
  const [activeTab, setActiveTab] = useState<"profil" | "password" | "aktivitas">("profil");
  const [form, setForm] = useState({ nama: "Siti Rahayu", nik: "3272058901234567", phone: "081234567890", email: "siti.rahayu@mail.id", alamat: "Jl. Merdeka No. 12", kecamatan: "Bogor Barat", kelurahan: "Menteng" });
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="p-4 space-y-4">
      {/* Profile header */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1D8E2] text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3"
          style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.darkRose})` }}>S</div>
        <div className="font-bold text-[#1F2937]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{form.nama}</div>
        <div className="text-xs text-[#64748B] mt-0.5">NIK: {form.nik}</div>
        <div className="flex justify-center gap-4 mt-3 text-center">
          {[
            { n: String(db.pengajuan.slice(0, 5).length), l: "Pengajuan" },
            { n: String(db.pengajuan.filter(p => p.status === "Disalurkan").slice(0, 2).length), l: "Diterima" },
            { n: "2", l: "Aktif" },
          ].map(s => (
            <div key={s.l}>
              <div className="text-lg font-bold text-[#D47A9A]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.n}</div>
              <div className="text-xs text-[#64748B]">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#F1D8E2] rounded-xl p-1">
        {(["profil", "password", "aktivitas"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer capitalize",
              activeTab === tab ? "bg-white text-[#D47A9A] shadow-sm" : "text-[#64748B]")}>
            {tab === "profil" ? "Edit Profil" : tab === "password" ? "Password" : "Aktivitas"}
          </button>
        ))}
      </div>

      {activeTab === "profil" && (
        <div className="bg-white rounded-2xl p-4 border border-[#F1D8E2] space-y-3">
          <FormField label="Nama Lengkap"><Input value={form.nama} onChange={f("nama")} /></FormField>
          <FormField label="NIK"><Input value={form.nik} onChange={f("nik")} /></FormField>
          <FormField label="No. Telepon"><Input value={form.phone} onChange={f("phone")} /></FormField>
          <FormField label="Email"><Input value={form.email} onChange={f("email")} type="email" /></FormField>
          <FormField label="Alamat"><Input value={form.alamat} onChange={f("alamat")} /></FormField>
          <FormField label="Kecamatan">
            <Select value={form.kecamatan} onChange={f("kecamatan")} options={KECAMATAN.map(k => ({ value: k, label: k }))} />
          </FormField>
          <Btn variant="primary" className="w-full" onClick={() => toast.success("Profil berhasil diperbarui")}>
            Simpan Perubahan
          </Btn>
        </div>
      )}

      {activeTab === "password" && (
        <div className="bg-white rounded-2xl p-4 border border-[#F1D8E2] space-y-3">
          <FormField label="Password Lama"><Input value="" onChange={() => { }} type="password" placeholder="Masukkan password lama" /></FormField>
          <FormField label="Password Baru"><Input value="" onChange={() => { }} type="password" placeholder="Min. 8 karakter" /></FormField>
          <FormField label="Konfirmasi Password Baru"><Input value="" onChange={() => { }} type="password" placeholder="Ulangi password baru" /></FormField>
          <Btn variant="primary" className="w-full" onClick={() => toast.success("Password berhasil diubah")}>Ubah Password</Btn>
        </div>
      )}

      {activeTab === "aktivitas" && (
        <div className="bg-white rounded-2xl p-4 border border-[#F1D8E2]">
          <div className="space-y-3">
            {[
              { icon: Send, label: "Mengirim pengajuan PKH", time: "2 hari lalu", color: C.primary },
              { icon: CheckCircle, label: "BPNT diverifikasi petugas", time: "5 hari lalu", color: C.success },
              { icon: Upload, label: "Upload dokumen KTP", time: "7 hari lalu", color: "#F59E0B" },
              { icon: User, label: "Update profil akun", time: "14 hari lalu", color: C.slate },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[#F1D8E2] last:border-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: item.color + "20" }}>
                  <item.icon size={14} style={{ color: item.color }} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-[#1F2937]">{item.label}</div>
                  <div className="text-xs text-[#64748B]">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#F1D8E2] overflow-hidden">
        {[
          { icon: HelpCircle, label: "Bantuan & FAQ", color: C.primary },
          { icon: Shield, label: "Kebijakan Privasi", color: C.slate },
          { icon: Info, label: "Tentang AidTrack", color: C.slate },
        ].map(item => (
          <button key={item.label} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#F1D8E2] last:border-0 hover:bg-[#FAF3F6] cursor-pointer transition-colors text-left">
            <item.icon size={16} style={{ color: item.color }} />
            <span className="text-sm text-[#1F2937]">{item.label}</span>
            <ChevronRight size={14} className="ml-auto text-[#64748B]" />
          </button>
        ))}
        <button onClick={() => nav("landing")}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 cursor-pointer transition-colors text-left">
          <LogOut size={16} className="text-red-500" />
          <span className="text-sm text-red-500 font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [db, setDb] = useState<DB>(() => initDB());

  const nav = (p: Page) => setPage(p);

  // Citizen pages
  if (page === "citizen-dashboard" || page === "citizen-tracking" || page === "citizen-pengajuan" ||
    page === "citizen-riwayat" || page === "citizen-notifikasi" || page === "citizen-profil") {
    return (
      <>
        <Toaster richColors position="top-center" />
        <CitizenLayout page={page} nav={nav} db={db}>
          {page === "citizen-dashboard" && <CitizenDashboard nav={nav} db={db} />}
          {page === "citizen-tracking" && <CitizenTracking db={db} />}
          {page === "citizen-pengajuan" && <CitizenPengajuan db={db} setDb={setDb} />}
          {page === "citizen-riwayat" && <CitizenRiwayat db={db} nav={nav} />}
          {page === "citizen-notifikasi" && <CitizenNotifikasi db={db} setDb={setDb} nav={nav} />}
          {page === "citizen-profil" && <CitizenProfil nav={nav} db={db} setDb={setDb} />}
        </CitizenLayout>
      </>
    );
  }

  // Admin pages
  if (page.startsWith("admin-")) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <AdminLayout page={page} nav={nav} db={db} userName="Ulan">
          {page === "admin-dashboard" && <AdminDashboard db={db} />}
          {page === "admin-penerima" && <AdminPenerima db={db} setDb={setDb} />}
          {page === "admin-bantuan" && <AdminBantuan db={db} setDb={setDb} />}
          {page === "admin-pengajuan" && <AdminPengajuan db={db} nav={nav} />}
          {page === "admin-verifikasi" && <AdminVerifikasi db={db} setDb={setDb} />}
          {page === "admin-tracking" && <AdminTracking db={db} setDb={setDb} />}
          {page === "admin-laporan" && <AdminLaporan db={db} />}
          {page === "admin-notifikasi" && <AdminNotifikasi db={db} setDb={setDb} />}
          {page === "admin-pengaturan" && <AdminPengaturan />}
        </AdminLayout>
      </>
    );
  }

  // Stakeholder pages
  if (page.startsWith("stakeholder-")) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <AdminLayout page={page} nav={nav} db={db} userName="H. Budi Prakoso">
          {page === "stakeholder-dashboard" && <StakeholderDashboard db={db} nav={nav} />}
          {page === "stakeholder-monitoring" && <StakeholderMonitoring db={db} />}
          {page === "stakeholder-statistik" && <StakeholderStatistik />}
          {page === "stakeholder-wilayah" && <StakeholderWilayah />}
          {page === "stakeholder-program" && <StakeholderProgram db={db} />}
        </AdminLayout>
      </>
    );
  }

  // Public pages
  return (
    <>
      <Toaster richColors position="top-center" />
      {page === "landing" && <LandingPage nav={nav} />}
      {page === "login" && <LoginPage nav={nav} />}
      {page === "register" && <RegisterPage nav={nav} />}
    </>
  );
}
