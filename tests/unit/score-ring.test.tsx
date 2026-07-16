import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreRing } from "@/components/ui/score-ring";

describe("ScoreRing", () => {
  it("renders the score as accessible text", () => {
    render(<ScoreRing score={87} />);
    expect(screen.getByLabelText("Match score: 87%")).toBeInTheDocument();
  });

  it("renders 0% without crashing", () => {
    render(<ScoreRing score={0} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("renders 100% without crashing", () => {
    render(<ScoreRing score={100} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
