import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Sign Up — HAC 🐴",
  description:
    "Join HAC — your witty AI-powered hackathon finder. Sign up to discover, track, and win hackathons.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
