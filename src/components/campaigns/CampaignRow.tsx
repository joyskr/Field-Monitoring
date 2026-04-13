import { formatDateRange } from "@/lib/utils";
import ProgressRing from "@/components/ui/ProgressRing";
import Badge from "@/components/ui/Badge";
import ActionDropdown from "./ActionDropdown";
import { MapPin } from "lucide-react";

interface CampaignRowProps {
  id: string;
  name: string;
  createdBy: string;
  type: string;
  brand: string;
  brandId: string;
  startDate: Date;
  endDate: Date;
  state: string;
  status: string;
  popProgress: number;
  brands?: { id: string; name: string }[];
  isAdmin?: boolean;
}

export default function CampaignRow({
  id,
  name,
  createdBy,
  type,
  brand,
  brandId,
  startDate,
  endDate,
  state,
  status,
  popProgress,
  brands = [],
  isAdmin = false,
}: CampaignRowProps) {
  const statusVariant = status.toLowerCase() as Parameters<typeof Badge>[0]["variant"];

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 text-sm">
      <td className="px-4 py-3 font-medium text-gray-800">{name}</td>
      <td className="px-4 py-3 text-gray-600">{createdBy}</td>
      <td className="px-4 py-3 text-gray-600 capitalize">{type.toLowerCase()}</td>
      <td className="px-4 py-3 text-gray-600">{brand}</td>
      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
        {formatDateRange(startDate, endDate)}
      </td>
      <td className="px-4 py-3">
        <ProgressRing value={popProgress} />
      </td>
      <td className="px-4 py-3 text-gray-600">{state}</td>
      <td className="px-4 py-3">
        <Badge label={status} variant={statusVariant} />
      </td>
      <td className="px-4 py-3">
        <ActionDropdown
          campaignId={id}
          campaignData={{ id, name, type, brandId, startDate, endDate, state, status }}
          brands={brands}
          isAdmin={isAdmin}
        />
      </td>
      <td className="px-4 py-3">
        <button title="View Map" className="text-gray-400 hover:text-gray-600">
          <MapPin size={16} />
        </button>
      </td>
    </tr>
  );
}
