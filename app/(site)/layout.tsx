import Track from "@/components/Track";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Track />
      {children}
    </>
  );
}
