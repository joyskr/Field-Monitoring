import { render, screen } from "@testing-library/react";
import KpiCard from "@/components/dashboard/KpiCard";
import { BarChart2 } from "lucide-react";

describe("<KpiCard />", () => {
  it("renders the label", () => {
    render(<KpiCard label="Total Campaigns" value={12} icon={BarChart2} />);
    expect(screen.getByText("Total Campaigns")).toBeInTheDocument();
  });

  it("renders numeric value", () => {
    render(<KpiCard label="Sites" value={42} icon={BarChart2} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders string value", () => {
    render(<KpiCard label="Progress" value="87%" icon={BarChart2} />);
    expect(screen.getByText("87%")).toBeInTheDocument();
  });

  it("applies iconColor class to icon", () => {
    const { container } = render(
      <KpiCard label="Test" value={1} icon={BarChart2} iconColor="text-red-500" />
    );
    const svg = container.querySelector("svg");
    expect(svg?.className).toContain("text-red-500");
  });
});
