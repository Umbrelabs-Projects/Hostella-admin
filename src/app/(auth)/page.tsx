import LoginForm from "./_components/LoginForm";
import SidebarImage from "./_components/SidebarImage";

export default function LoginPage() {
  return (
    <div className="relative flex w-full h-screen">
      {/* Left: Form */}
      <LoginForm />

      {/* Right: Image */}
      <SidebarImage />
    </div>
  );
}
