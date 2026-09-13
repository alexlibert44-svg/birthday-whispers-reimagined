import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";

import { BirthdayExperience } from "@/components/experience/BirthdayExperience";
import { getPublicGift } from "@/lib/gifts.functions";

export const Route = createFileRoute("/birthday/$giftId")({
  loader: ({ params }) => getPublicGift({ data: { giftId: params.giftId } }),
  head: ({ loaderData }) => {
    const name = loaderData?.recipientName;
    const title = name ? `A birthday surprise for ${name}` : "A birthday surprise";
    return {
      meta: [
        { title },
        { name: "description", content: "Someone has prepared something special for you." },
        { name: "robots", content: "noindex" },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: "Someone has prepared something special for you.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: GiftPage,
  errorComponent: () => <Fallback text="This surprise couldn't be opened right now." />,
  notFoundComponent: () => <Fallback text="This gift link doesn't exist." />,
});

function Fallback({ text }: { text: string }) {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-black px-6 text-center">
      <div>
        <div className="text-5xl">🎁</div>
        <p className="mt-4 text-sm text-white/60">{text}</p>
      </div>
    </div>
  );
}

function GiftPage() {
  const gift = Route.useLoaderData();
  const router = useRouter();

  const onUnlock = useCallback(() => {
    void router.invalidate();
  }, [router]);

  if (!gift) return <Fallback text="This gift link doesn't exist." />;

  return <BirthdayExperience gift={gift} onUnlock={onUnlock} />;
}
