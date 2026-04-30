interface Props {
  reason: string;
}

export function EndScene({ reason }: Props) {
  return (
    <main className="min-h-[100dvh] bg-black text-[#f7f7f6] flex flex-col items-center justify-center gap-8 p-6">
      <p className="text-lg sm:text-2xl leading-relaxed text-center whitespace-pre-wrap">{reason}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="border border-[#f7f7f6]/50 px-5 py-2 text-sm sm:text-base hover:bg-[#f7f7f6] hover:text-black transition"
      >
        [ 重新開始 ]
      </button>
    </main>
  );
}
