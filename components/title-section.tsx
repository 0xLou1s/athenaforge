export default function TitleSection({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-end p-6">
      <h2 className="text-xs text-primary uppercase">[ {text} ]</h2>
    </div>
  );
}
