import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { SteelBeamResult } from '@/lib/api';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1E88E5',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f1f5f9',
    padding: 6,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 4,
  },
  label: {
    fontSize: 10,
    color: '#475569',
    width: '40%',
  },
  value: {
    fontSize: 10,
    color: '#0f172a',
    width: '30%',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  formula: {
    fontSize: 10,
    color: '#64748b',
    width: '30%',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statusBox: {
    marginTop: 15,
    padding: 10,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartImage: {
    marginTop: 15,
    width: '100%',
    height: 200,
    objectFit: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  }
});

interface SteelBeamReportProps {
  params: {
    length: number;
    load: number;
    profile: string;
    material: string;
    profileLabel: string;
    materialLabel: string;
  };
  result: SteelBeamResult;
  chartImageBase64?: string;
}

export const SteelBeamReport: React.FC<SteelBeamReportProps> = ({ params, result, chartImageBase64 }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'danger': return '#fef2f2';
      case 'warning': return '#fffbeb';
      case 'safe': return '#f0fdf4';
      default: return '#f8fafc';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'danger': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'safe': return '#10b981';
      default: return '#64748b';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Laporan Perhitungan Struktur</Text>
          <Text style={styles.subtitle}>Proyek: Analisis Balok Baja (SNI 1729:2020)</Text>
          <Text style={styles.subtitle}>Tanggal: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>

        {/* 1. Parameter Desain */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Parameter Desain Input</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Panjang Bentang Bebas (L)</Text>
            <Text style={styles.formula}>-</Text>
            <Text style={styles.value}>{params.length} m</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Beban Terpusat (P)</Text>
            <Text style={styles.formula}>-</Text>
            <Text style={styles.value}>{params.load} kN</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Profil Baja WF</Text>
            <Text style={styles.formula}>-</Text>
            <Text style={styles.value}>{params.profileLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mutu Baja (Fy)</Text>
            <Text style={styles.formula}>-</Text>
            <Text style={styles.value}>{params.materialLabel}</Text>
          </View>
        </View>

        {/* 2. Hasil Analisis Gaya Dalam & Kapasitas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Analisis Kekuatan & Lendutan</Text>
          
          {/* Momen */}
          <View style={styles.row}>
            <Text style={styles.label}>Momen Lentur Maksimal (Mu)</Text>
            <Text style={styles.formula}>M = (P * L) / 4</Text>
            <Text style={styles.value}>{result.maxMomen.toFixed(2)} kNm</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Kapasitas Momen Desain (ϕMn)</Text>
            <Text style={styles.formula}>ϕMn = 0.90 * Zx * Fy</Text>
            <Text style={[styles.value, { color: result.maxMomen > result.phiMn ? '#ef4444' : '#10b981' }]}>
              {result.phiMn.toFixed(2)} kNm
            </Text>
          </View>

          {/* Geser */}
          <View style={styles.row}>
            <Text style={styles.label}>Gaya Geser Maksimal (Vu)</Text>
            <Text style={styles.formula}>V = P / 2</Text>
            <Text style={styles.value}>{result.maxGeser.toFixed(2)} kN</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Kapasitas Geser Desain (ϕVn)</Text>
            <Text style={styles.formula}>ϕVn = 1.00 * 0.6 * Fy * Aw</Text>
            <Text style={[styles.value, { color: result.maxGeser > result.phiVn ? '#ef4444' : '#10b981' }]}>
              {result.phiVn.toFixed(2)} kN
            </Text>
          </View>

          {/* Lendutan */}
          <View style={styles.row}>
            <Text style={styles.label}>Lendutan Aktual (Δ)</Text>
            <Text style={styles.formula}>Δ = (P*L³) / (48*E*Ix)</Text>
            <Text style={styles.value}>{result.maxDeflection.toFixed(2)} mm</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Batas Lendutan Izin</Text>
            <Text style={styles.formula}>L / 360</Text>
            <Text style={[styles.value, { color: result.maxDeflection > result.limitDeflection ? '#ef4444' : '#10b981' }]}>
              {result.limitDeflection.toFixed(2)} mm
            </Text>
          </View>
        </View>

        {/* 3. Kesimpulan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Kesimpulan & Rekomendasi</Text>
          <View style={[styles.statusBox, { backgroundColor: getStatusColor(result.status) }]}>
            <Text style={[styles.statusText, { color: getStatusTextColor(result.status) }]}>
              {result.msg}
            </Text>
          </View>
        </View>

        {/* 4. Grafik (Jika ada) */}
        {chartImageBase64 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Grafik Diagram (SFD / BMD / Defleksi)</Text>
            <Image src={chartImageBase64} style={styles.chartImage} />
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Dokumen ini digenerate secara otomatis oleh Civil Intelligence Hub. Perhitungan mengacu pada standar SNI.
        </Text>
      </Page>
    </Document>
  );
};
