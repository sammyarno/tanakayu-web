import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  link: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav aria-label="breadcrumb">
      <ol className="bg-tanakayu-accent/15 flex w-fit gap-1 rounded-md p-1 text-xs">
        {items.map((item, index) => (
          <li key={item.link} className="flex items-center gap-1">
            <Link href={item.link}>
              <p className="tracking-wide hover:underline">{item.label}</p>
            </Link>
            {index < items.length - 1 && <span>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
