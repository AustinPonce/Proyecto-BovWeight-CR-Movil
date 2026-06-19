import type jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export const cargarImagenBase64 = async (url: string): Promise<string | null> => {
  try {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const guardarPDF = async (doc: jsPDF, filename: string): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    const base64 = doc.output('datauristring').split(',')[1];
    await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
    const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
    await Share.share({ title: filename, url: uri, dialogTitle: 'Guardar PDF' });
  } else {
    doc.save(filename);
  }
};

export const guardarExcel = async (wb: XLSX.WorkBook, filename: string): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    const base64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
    await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
    const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
    await Share.share({ title: filename, url: uri, dialogTitle: 'Guardar Excel' });
  } else {
    XLSX.writeFile(wb, filename);
  }
};
