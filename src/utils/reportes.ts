import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

// IMPORTACIONES DE INTERFACES
import { type Material } from '../services/materiales.service';
import { type GastoOperativo } from '../services/gastos-operativos.service';

// ============================================================================
// 1. REPORTE DE MATERIALES
// ============================================================================
export const generarPDFMateriales = (materiales: Material[], criterioFiltro: string = 'Activos') => {
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const colorPrimario = [30, 41, 59]; 
        const colorTextoSecundario = [148, 163, 184]; 

        // Encabezado
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.text('KYRO - SYSTEM ', 14, 20);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(colorTextoSecundario[0], colorTextoSecundario[1], colorTextoSecundario[2]);
        doc.text(`Reporte de Materiales (${criterioFiltro})`, 14, 26);

        const fechaActual = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
        doc.setFontSize(9);
        doc.text(`Generado el: ${fechaActual}`, 14, 31);

        doc.setDrawColor(226, 232, 240); 
        doc.line(14, 35, 196, 35);

        // Datos de la tabla
        const tableColumn = ['Material', 'Categoría', 'Proveedor', 'Precio Compra', 'Unidad', 'Stock Disp.', 'Costo Unitario'];
        const tableRows = materiales.map(mat => [
            mat.nombre,
            mat.categoria?.nombre || 'N/A',
            mat.proveedor?.nombre || 'Sin Proveedor',
            `$${Number(mat.precioCompra).toFixed(2)}`,
            mat.unidadMedida?.nombre || 'N/A',
            mat.stockDisponible,
            `$${Number(mat.costoUnitario).toFixed(4)}`
        ]);

        const valorTotalInventario = materiales.reduce((acc, mat) => acc + (mat.stockDisponible * mat.costoUnitario), 0);

        autoTable(doc, {
            startY: 40,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: {
                fillColor: colorPrimario as [number, number, number],
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'left'
            },
            bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                3: { halign: 'right' }, 
                5: { halign: 'center' }, 
                6: { halign: 'right' }  
            },
            margin: { top: 40, bottom: 20, left: 14, right: 14 },
            didDrawPage: (data: any) => {
                const str = `Página ${data.pageNumber}`;
                doc.setFont('Helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(148, 163, 184);
                doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;
        
        if (finalY > doc.internal.pageSize.height - 30) {
            doc.addPage();
        }

        doc.setDrawColor(226, 232, 240);
        doc.line(14, finalY - 4, 196, finalY - 4);

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(`Total de artículos listados: ${materiales.length}`, 14, finalY);
        doc.text(`Valor total estimado del inventario actual: $${valorTotalInventario.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, finalY + 5);

        // Disparar descarga
        doc.save(`reporte-materiales-${new Date().toISOString().slice(0,10)}.pdf`);
        
    } catch (error) {
        console.error("Error al generar el PDF de materiales:", error);
    }
};

// ============================================================================
// 2. REPORTE DE GASTOS OPERATIVOS
// ============================================================================
export const generarPDFGastos = (gastos: GastoOperativo[]) => {
    try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const colorPrimario = [30, 41, 59]; 
        const colorTextoSecundario = [148, 163, 184]; 

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.text('KYRO - SYSTEM', 14, 20);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(colorTextoSecundario[0], colorTextoSecundario[1], colorTextoSecundario[2]);
        doc.text('Reporte de Gastos Operativos', 14, 26);

        const fechaActual = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
        doc.setFontSize(9);
        doc.text(`Generado el: ${fechaActual}`, 14, 31);

        doc.setDrawColor(226, 232, 240); 
        doc.line(14, 35, 196, 35);

        const tableColumn = ['Fecha', 'Concepto', 'Categoría', 'Periodicidad', 'Monto'];
        const tableRows = gastos.map(g => [
            new Date(g.fecha).toLocaleDateString('es-MX'),
            g.concepto,
            g.categoria,
            g.periodicidad,
            Number(g.monto).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
        ]);

        const gastoTotal = gastos.reduce((acc, g) => acc + Number(g.monto), 0);

        autoTable(doc, {
            startY: 40,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: colorPrimario as [number, number, number], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
            bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: { 4: { halign: 'right' } }, // Monto alineado a la derecha
            margin: { top: 40, bottom: 20, left: 14, right: 14 },
            didDrawPage: (data: any) => {
                const str = `Página ${data.pageNumber}`;
                doc.setFont('Helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(148, 163, 184);
                doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;
        
        if (finalY > doc.internal.pageSize.height - 30) {
            doc.addPage();
        }

        doc.setDrawColor(226, 232, 240);
        doc.line(14, finalY - 4, 196, finalY - 4);

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(`Suma total de gastos listados: ${gastoTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, 14, finalY);

        doc.save(`reporte-gastos-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
        console.error("Error al generar el PDF de gastos:", error);
    }
};