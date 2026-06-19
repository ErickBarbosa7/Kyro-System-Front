import { useMemo } from 'react';
import type { PiezaDraft, CosteoBreakdown, MargenConfig } from '../pages/Piezas/types';

export const useCosteoCalculator = (
    draft: PiezaDraft,
    margen: MargenConfig | null
): CosteoBreakdown => {
    return useMemo(() => {
        const totalMetales = draft.metales.reduce((s, m) => s + Number(m.subtotal), 0);
        const totalMateriales = draft.materiales.reduce((s, m) => s + Number(m.subtotal), 0);
        const totalAcabados = draft.acabados.reduce((s, a) => s + Number(a.subtotal), 0);
        const totalManoObra = draft.manoObra.reduce((s, mo) => s + Number(mo.subtotal), 0);

        const costeDirecto = totalMetales + totalMateriales + totalAcabados + totalManoObra;
        const costeTotal = costeDirecto;

        let margenInfo = null;
        if (margen) {
            margenInfo = {
                nombre: margen.nombre,
                margenTaller: Number(margen.margenTaller),
                margenMayorista: Number(margen.margenMayorista),
                margenPublico: Number(margen.margenPublico),
                precioTaller: Number((costeTotal * (1 + Number(margen.margenTaller) / 100)).toFixed(2)),
                precioMayorista: Number((costeTotal * (1 + Number(margen.margenMayorista) / 100)).toFixed(2)),
                precioPublico: Number((costeTotal * (1 + Number(margen.margenPublico) / 100)).toFixed(2)),
            };
        }

        return {
            totalMetales,
            totalMateriales,
            totalAcabados,
            totalManoObra,
            costeDirecto: Number(costeDirecto.toFixed(2)),
            costeTotal: Number(costeTotal.toFixed(2)),
            margen: margenInfo,
            items: {
                metales: draft.metales,
                materiales: draft.materiales,
                acabados: draft.acabados,
                manoObra: draft.manoObra,
            },
        };
    }, [draft, margen]);
};
