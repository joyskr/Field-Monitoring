interface SitePanelProps {
  siteCode: string;
  mediaType: string;
  monitor: string;
  locality: string;
  vendor: string;
  frequency: string;
}

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="py-2 border-b border-gray-100">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-medium text-gray-700 mt-0.5">{value}</p>
  </div>
);

export default function SitePanel({
  siteCode,
  mediaType,
  monitor,
  locality,
  vendor,
  frequency,
}: SitePanelProps) {
  return (
    <div className="w-52 shrink-0 bg-gray-50 border-r border-gray-200 p-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Site Details
      </h3>
      <Field label="Site Code" value={siteCode} />
      <Field label="Media Type" value={mediaType} />
      <Field label="Monitor" value={monitor} />
      <Field label="Locality" value={locality} />
      <Field label="Vendor" value={vendor} />
      <Field label="Frequency" value={frequency} />
    </div>
  );
}
