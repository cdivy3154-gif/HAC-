import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Log In — HAC 🐴",
  description:
    "Log in to HAC, your AI-powered hackathon finder. Find hackathons, build teams, and win prizes.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
