type Stats = {
  total_inscripciones: number;
  inscripciones_activas: number;
  inscripciones_canceladas: number;
  total_asistentes: number;
  total_recaudado: number;
  total_pendiente: number;
};

// Componente interno para cada "tarjeta" de estadística, ahora más pequeño
const StatItem = ({ label, value }: { label: string, value: string | number }) => (
  <div className="px-3 py-2 bg-white rounded shadow-sm">
    <p className="text-xs text-gray-500 truncate">{label}</p>
    <p className="text-lg font-semibold text-gray-800">{value}</p>
  </div>
);

export default function SummaryBar({ stats }: { stats: Stats }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-gray-100/90 backdrop-blur-sm p-3 border-t border-gray-300 shadow-md"> {/* Padding reducido */}
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-center"> {/* Gap reducido */}
          <StatItem label="Activas" value={stats.inscripciones_activas} />
          <StatItem label="Asistentes" value={stats.total_asistentes} />
          <StatItem label="Recaudado" value={`$${Number(stats.total_recaudado).toLocaleString('es-MX')}`} />
          <StatItem label="Pendiente" value={`$${Number(stats.total_pendiente).toLocaleString('es-MX')}`} />
          <StatItem label="Canceladas" value={stats.inscripciones_canceladas} />
          <StatItem label="Total Reg." value={stats.total_inscripciones} />
        </div>
      </div>
    </div>
  );
}