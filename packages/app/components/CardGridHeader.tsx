interface CardGridHeaderProps {
  title: string;
  subtitle: string;
}

export default function CardGridHeader({
  title,
  subtitle,
}: CardGridHeaderProps): JSX.Element {
  return (
    <div className="pt-12 px-4 bg-indigo-200 sm:px-6 lg:px-8 lg:pt-20 py-20">
      <div className="text-center">
        <p className="mt-2 text-3xl text-indigo-900 sm:text-4xl lg:text-5xl">
          {title}
        </p>
        <p className="mt-3 max-w-4xl mx-auto text-xl text-indigo-900 sm:mt-5 sm:text-2xl">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
