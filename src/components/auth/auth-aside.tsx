import Image from "next/image";

type AuthAsideProps = {
  /** Path to the illustration that sits above the copy. */
  image: string;
  /** Short marketing headline rendered at the bottom of the panel. */
  title: string;
  /** Supporting line under the headline. */
  description: string;
};

/**
 * The decorative right-hand panel shared by every authentication page.
 *
 * It pairs a themed illustration with the page's headline over the brand
 * gradient. The panel is hidden below `lg`, where the form takes the full
 * width of the page.
 */
export default function AuthAside({
  image,
  title,
  description,
}: AuthAsideProps) {
  return (
    <div className="relative hidden bg-primary lg:block">
      <div className="sticky top-(--spacing-header) h-[calc(100svh-var(--spacing-header))] overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-br from-primary via-primary to-primary/60"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-primary-foreground/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-32 size-96 rounded-full bg-primary-foreground/10 blur-3xl"
        />

        {/* Decorative: the headline below already describes the panel. */}
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain object-center px-6 pt-10 pb-56"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-primary via-primary/85 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-10 text-primary-foreground">
          <p className="max-w-sm text-2xl font-semibold tracking-tight text-balance">
            {title}
          </p>
          <p className="text-sm text-primary-foreground/80">{description}</p>
        </div>
      </div>
    </div>
  );
}
