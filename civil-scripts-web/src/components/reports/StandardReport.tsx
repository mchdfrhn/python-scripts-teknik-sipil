import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

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
    width: '45%',
  },
  value: {
    fontSize: 10,
    color: '#0f172a',
    width: '25%',
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
    height: 220,
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

export interface ReportItem {
  label: string;
  formula?: string;
  value: string | number;
  isAlert?: boolean;
}

export interface StandardReportProps {
  title: string;
  subtitle: string;
  inputs: ReportItem[];
  results: ReportItem[];
  conclusionMsg: string;
  conclusionStatus: 'safe' | 'warning' | 'danger' | 'neutral';
  chartImageBase64?: string;
}

export const StandardReport: React.FC<StandardReportProps> = ({ 
  title, subtitle, inputs, results, conclusionMsg, conclusionStatus, chartImageBase64 
}) => {
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
        <View style={styles.header}>
          <Text style={styles.title}>Laporan Perhitungan Struktur</Text>
          <Text style={styles.subtitle}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle} | Tanggal: {new Date().toLocaleDateString('id-ID')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Parameter Desain Input</Text>
          {inputs.map((item, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.formula}>{item.formula || '-'}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Hasil Analisis</Text>
          {results.map((item, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.formula}>{item.formula || '-'}</Text>
              <Text style={[styles.value, { color: item.isAlert ? '#ef4444' : '#0f172a' }]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Kesimpulan & Rekomendasi</Text>
          <View style={[styles.statusBox, { backgroundColor: getStatusColor(conclusionStatus) }]}>
            <Text style={[styles.statusText, { color: getStatusTextColor(conclusionStatus) }]}>
              {conclusionMsg}
            </Text>
          </View>
        </View>

        {chartImageBase64 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Visualisasi / Grafik</Text>
            <Image src={chartImageBase64} style={styles.chartImage} />
          </View>
        )}

        <Text style={styles.footer} fixed>
          Dokumen ini digenerate secara otomatis oleh Civil Intelligence Hub. Perhitungan mengacu pada standar SNI/Kementerian PUPR terkait.
        </Text>
      </Page>
    </Document>
  );
};
