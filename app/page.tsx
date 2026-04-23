import LandingClient from "@/components/landing/LandingClient";

export const metadata = {
  title: "QueryMind | Your database, in plain English.",
  description: "Connect your Postgres database and get answers in plain English. Powered by Gemini 2.5 Flash and vector search for zero-hallucination SQL generation.",
};

export default function LandingPage() {
  return <LandingClient />;
}
