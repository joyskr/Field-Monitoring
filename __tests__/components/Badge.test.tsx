import { render, screen } from "@testing-library/react";
import Badge from "@/components/ui/Badge";

describe("<Badge />", () => {
  it("renders the label text", () => {
    render(<Badge label="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies active variant classes", () => {
    render(<Badge label="Active" variant="active" />);
    const el = screen.getByText("Active");
    expect(el.className).toContain("green");
  });

  it("applies terminated variant classes", () => {
    render(<Badge label="Terminated" variant="terminated" />);
    const el = screen.getByText("Terminated");
    expect(el.className).toContain("red");
  });

  it("applies pending variant classes", () => {
    render(<Badge label="Pending" variant="pending" />);
    const el = screen.getByText("Pending");
    expect(el.className).toContain("yellow");
  });

  it("applies default variant when no variant prop given", () => {
    render(<Badge label="Unknown" />);
    const el = screen.getByText("Unknown");
    expect(el.className).toContain("gray");
  });

  it("merges custom className", () => {
    render(<Badge label="Test" className="custom-class" />);
    const el = screen.getByText("Test");
    expect(el.className).toContain("custom-class");
  });

  it("renders as a span", () => {
    render(<Badge label="Test" />);
    expect(screen.getByText("Test").tagName).toBe("SPAN");
  });
});
