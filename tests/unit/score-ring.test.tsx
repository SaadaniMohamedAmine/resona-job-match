import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ScoreRing } from "@/components/ui/score-ring";

const messages = { nav: { matchScoreAria: "Match score: {score}%" } };

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("ScoreRing", () => {
  it("renders the score as accessible text", () => {
    renderWithIntl(<ScoreRing score={87} />);
    expect(screen.getByLabelText("Match score: 87%")).toBeInTheDocument();
  });

  it("renders 0% without crashing", () => {
    renderWithIntl(<ScoreRing score={0} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("renders 100% without crashing", () => {
    renderWithIntl(<ScoreRing score={100} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
