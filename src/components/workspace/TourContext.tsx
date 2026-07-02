import React, { createContext, useContext, useState, ReactNode } from "react";

export type TourStep = {
  id: number;
  targetId: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right" | "center";
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    targetId: "tour-step-1-header",
    title: "Orientasi Halaman",
    content: "Halaman ini dipakai untuk mengumpulkan, meninjau, dan menyiapkan bukti kasus sebelum analisis mendalam.",
    position: "bottom",
  },
  {
    id: 2,
    targetId: "tour-step-2-upload",
    title: "Tambah Bukti Baru",
    content: "Tambah berkas utama atau pendukung di sini (PDF, gambar, video, audio).",
    position: "bottom",
  },
  {
    id: 3,
    targetId: "tour-step-3-search",
    title: "Cari & Ringkasan",
    content: "Cari file dengan cepat dan lihat total statistik bukti yang sudah terkumpul di kasus ini.",
    position: "bottom",
  },
  {
    id: 4,
    targetId: "tour-step-4-groups",
    title: "Penyimpanan Terorganisir",
    content: "Berkas dikelompokkan secara otomatis antara 'Data CCR' dan 'Bukti Pendukung'. Klik untuk memperluas folder.",
    position: "right",
  },
  {
    id: 5,
    targetId: "tour-step-5-status",
    title: "Status Analisis AI",
    content: "Lencana ini menunjukkan status proses AI, seperti 'Teranalisis' atau 'Menunggu', pada setiap bukti.",
    position: "right",
  },
  {
    id: 6,
    targetId: "tour-step-6-preview",
    title: "Pratinjau Media",
    content: "Buka file untuk melihat isi dan detail media secara langsung tanpa perlu berpindah aplikasi.",
    position: "left",
  },
  {
    id: 7,
    targetId: "tour-step-7-insights",
    title: "Panel Wawasan AI",
    content: "Panel kanan menampilkan ringkasan temuan otomatis dari AI, seperti deteksi anomali pada video atau metadata gambar.",
    position: "left",
  },
  {
    id: 8,
    targetId: "tour-step-8-next",
    title: "Langkah Selanjutnya",
    content: "Setelah data terkumpul dan ditinjau, lanjutkan ke tahap Analisis untuk rekonstruksi fakta dan investigasi menyeluruh.",
    position: "bottom",
  },
];

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const startTour = () => {
    setCurrentStep(1);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const endTour = () => {
    setIsActive(false);
    setCurrentStep(1);
  };

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStep,
        startTour,
        nextStep,
        prevStep,
        endTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
};
