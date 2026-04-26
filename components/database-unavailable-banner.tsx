type DatabaseUnavailableBannerProps = {
  className?: string;
};

export default function DatabaseUnavailableBanner({ className = '' }: DatabaseUnavailableBannerProps) {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`.trim()}>
      <div className="rounded-lg border border-amber-300/70 bg-amber-100/75 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/35 dark:bg-amber-500/12 dark:text-amber-200">
        Live data is currently unavailable in this environment. Showing fallback content.
      </div>
    </div>
  );
}