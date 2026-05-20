import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

const formatDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

export const exportPDF = (logs, stats) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const date = formatDate();

  // Set dark theme colors
  doc.setFillColor(2, 6, 23);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('ForgeSecure', 20, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('AI-Powered Network Anomaly Detection Platform', 20, 32);
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, 20, 38);

  // Stats section
  doc.setFillColor(15, 23, 42);
  doc.rect(20, 45, pageWidth - 40, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`Total Logs: ${stats.totalLogs}`, 25, 52);
  doc.text(`Anomalies: ${stats.totalAnomalies}`, 85, 52);
  doc.text(`Critical: ${stats.criticalThreats}`, 145, 52);
  doc.text(`Devices: ${stats.activeDevices}`, 205, 52);

  // Incident table
  const tableData = logs.map((log) => [
    log.device || '--',
    log.severity || '--',
    log.status || '--',
    `${log.confidence || 0}%`,
    `${log.duration || 0}s`,
    log.src_bytes || 0,
    log.dst_bytes || 0,
    log.src_pkts || 0,
    log.dst_pkts || 0,
    log.incidentStatus || '--',
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(log.createdAt)),
  ]);

  autoTable(doc, {
    head: [
      [
        'Device',
        'Severity',
        'Status',
        'Confidence',
        'Duration',
        'Src Bytes',
        'Dst Bytes',
        'Src Pkts',
        'Dst Pkts',
        'Incident',
        'Timestamp',
      ],
    ],
    body: tableData,
    startY: 70,
    theme: 'grid',
    headStyles: {
      fillColor: [34, 211, 238],
      textColor: [2, 6, 23],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      textColor: [255, 255, 255],
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [15, 23, 42],
    },
    gridColor: [71, 85, 105],
    margin: { top: 70, right: 20, bottom: 20, left: 20 },
    didDrawPage: () => {
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - 25, pageHeight - 10);
    },
  });

  const filename = `ForgeSecure_Report_${date}.pdf`;
  doc.save(filename);
};

export const exportCSV = (logs) => {
  const data = logs.map((log) => ({
    Device: log.device || '--',
    Severity: log.severity || '--',
    Status: log.status || '--',
    Confidence: `${log.confidence || 0}%`,
    Duration: `${log.duration || 0}s`,
    'Src Bytes': log.src_bytes || 0,
    'Dst Bytes': log.dst_bytes || 0,
    'Src Packets': log.src_pkts || 0,
    'Dst Packets': log.dst_pkts || 0,
    'Incident Status': log.incidentStatus || '--',
    Timestamp: new Date(log.createdAt).toLocaleString(),
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const date = formatDate();
  const filename = `ForgeSecure_Report_${date}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
